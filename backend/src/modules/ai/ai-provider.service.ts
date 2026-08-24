import { Injectable, Logger } from "@nestjs/common";

export interface ProviderConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxOutputTokens: number;
  requestTimeoutMs: number;
}

export interface ProviderMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ProviderToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface ProviderToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface ProviderToolSchema {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ProviderResult {
  content: string;
  toolCalls: ProviderToolCall[];
  promptTokens: number;
  completionTokens: number;
}

@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);

  async chatCompletion(
    cfg: ProviderConfig,
    messages: ProviderMessage[],
    tools?: ProviderToolSchema[]
  ): Promise<ProviderResult> {
    const res = await fetch(`${cfg.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature: cfg.temperature,
        max_tokens: cfg.maxOutputTokens,
        ...(tools && tools.length ? { tools } : {}),
      }),
      signal: AbortSignal.timeout(cfg.requestTimeoutMs),
    });

    if (!res.ok) {
      let safeError = `Provider returned status ${res.status}`;
      try {
        const body = (await res.json()) as { error?: { message?: string } };
        if (body?.error?.message) {
          safeError = body.error.message.slice(0, 300);
        }
      } catch {
        /* keep generic message */
      }
      this.logger.warn(`AI provider error: ${safeError}`);
      throw new Error(safeError);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string | null; tool_calls?: ProviderToolCall[] } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };

    const message = data.choices?.[0]?.message;
    return {
      content: message?.content ?? "",
      toolCalls: message?.tool_calls ?? [],
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
    };
  }

  async testConnection(
    cfg: Pick<ProviderConfig, "baseUrl" | "apiKey" | "model" | "requestTimeoutMs">
  ): Promise<{ ok: boolean; model: string; latencyMs: number; error?: string }> {
    const started = Date.now();
    try {
      const res = await fetch(`${cfg.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify({
          model: cfg.model,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1,
        }),
        signal: AbortSignal.timeout(Math.min(cfg.requestTimeoutMs, 20000)),
      });
      const latencyMs = Date.now() - started;
      if (!res.ok) {
        let safeError = `Provider returned status ${res.status}`;
        try {
          const body = (await res.json()) as { error?: { message?: string } };
          if (body?.error?.message) safeError = body.error.message.slice(0, 200);
        } catch {
          /* generic */
        }
        return { ok: false, model: cfg.model, latencyMs, error: safeError };
      }
      return { ok: true, model: cfg.model, latencyMs };
    } catch (err) {
      return {
        ok: false,
        model: cfg.model,
        latencyMs: Date.now() - started,
        error: err instanceof Error ? err.message.slice(0, 200) : "Connection failed",
      };
    }
  }
}
