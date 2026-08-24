import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { encryptSecret, decryptSecret, maskSecret } from "../../common/crypto/encryption.util";
import { AiProviderService } from "./ai-provider.service";
import { TestConnectionDto, UpdateAiSettingsDto } from "./dto/ai.dto";

@Injectable()
export class AiSettingsService {
  constructor(
    private prisma: PrismaService,
    private provider: AiProviderService
  ) {}

  async get() {
    const row = await this.getOrCreate();
    return {
      enabled: row.enabled,
      provider: row.provider,
      baseUrl: row.baseUrl,
      model: row.model,
      temperature: row.temperature,
      maxOutputTokens: row.maxOutputTokens,
      requestTimeoutMs: row.requestTimeoutMs,
      monthlyTokenLimit: row.monthlyTokenLimit,
      perUserMonthlyTokenLimit: row.perUserMonthlyTokenLimit,
      allowedRoles: row.allowedRoles,
      writeActionsEnabled: row.writeActionsEnabled,
      hasApiKey: Boolean(row.apiKeyEncrypted) || Boolean(process.env.AI_API_KEY),
      apiKeyMasked: row.apiKeyLast4
        ? `...${row.apiKeyLast4}`
        : process.env.AI_API_KEY
          ? `${maskSecret(process.env.AI_API_KEY)} (env)`
          : null,
      credentialSource: row.apiKeyEncrypted ? "database" : process.env.AI_API_KEY ? "environment" : "none",
    };
  }

  async update(dto: UpdateAiSettingsDto) {
    const row = await this.getOrCreate();
    const data: Record<string, unknown> = {};
    const copy = [
      "enabled",
      "provider",
      "baseUrl",
      "model",
      "temperature",
      "maxOutputTokens",
      "requestTimeoutMs",
      "monthlyTokenLimit",
      "perUserMonthlyTokenLimit",
      "allowedRoles",
      "writeActionsEnabled",
    ] as const;
    for (const key of copy) {
      if (dto[key] !== undefined) data[key] = dto[key];
    }
    if (dto.apiKey !== undefined && dto.apiKey !== "") {
      data.apiKeyEncrypted = encryptSecret(dto.apiKey);
      data.apiKeyLast4 = dto.apiKey.slice(-4);
    }
    await this.prisma.aiSetting.update({ where: { id: row.id }, data });
    return this.get();
  }

  async removeApiKey() {
    const row = await this.getOrCreate();
    await this.prisma.aiSetting.update({
      where: { id: row.id },
      data: { apiKeyEncrypted: null, apiKeyLast4: null },
    });
    return this.get();
  }

  async testConnection(dto: TestConnectionDto) {
    const row = await this.getOrCreate();
    const apiKey = dto.apiKey || (row.apiKeyEncrypted ? decryptSecret(row.apiKeyEncrypted) : process.env.AI_API_KEY);
    if (!apiKey) throw new BadRequestException("No API key configured");
    const baseUrl = dto.baseUrl || row.baseUrl || process.env.AI_BASE_URL || "https://openrouter.ai/api/v1";
    const model = dto.model || row.model || process.env.AI_MODEL || "openai/gpt-4o-mini";
    return this.provider.testConnection({ baseUrl, apiKey, model, requestTimeoutMs: 20000 });
  }

  private async getOrCreate() {
    const existing = await this.prisma.aiSetting.findFirst();
    if (existing) return existing;
    return this.prisma.aiSetting.create({ data: {} });
  }
}
