"use client";

import * as React from "react";
import Markdown from "react-markdown";
import {
  Bot,
  Copy,
  Loader2,
  MessageSquarePlus,
  Search,
  Send,
  Square,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

const SUGGESTED_PROMPTS = [
  "Show employees whose contracts or probation end soon",
  "Which employees were late more than 3 times this month?",
  "What leave requests are pending my approval?",
  "Summarize the payroll for this year",
  "How many employees are in each department?",
];

export default function AssistantPage() {
  const [conversations, setConversations] = React.useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [error, setError] = React.useState("");
  const abortRef = React.useRef<AbortController | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const loadConversations = React.useCallback(async () => {
    try {
      const { api } = await import("@/lib/api");
      const rows = await api.get<ConversationSummary[]>("/ai/conversations");
      setConversations(rows);
    } catch {
      /* sidebar is non-critical */
    }
  }, []);

  React.useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const openConversation = React.useCallback(async (id: string) => {
    setActiveId(id);
    setError("");
    try {
      const { api } = await import("@/lib/api");
      const rows = await api.get<ChatMessage[]>(`/ai/conversations/${id}/messages`);
      setMessages(rows);
    } catch {
      setError("Could not load this conversation.");
    }
  }, []);

  const send = React.useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || sending) return;
      setInput("");
      setError("");
      setSending(true);
      const userMsg: ChatMessage = { id: `local-${Date.now()}`, role: "user", content };
      setMessages((m) => [...m, userMsg]);

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const { api } = await import("@/lib/api");
        const res = await api.post<{
          conversationId: string;
          reply: string;
        }>("/ai/chat", { message: content, conversationId: activeId ?? undefined }, { signal: controller.signal });
        setMessages((m) => [
          ...m,
          { id: res.conversationId + "-" + m.length, role: "assistant", content: res.reply },
        ]);
        if (!activeId) setActiveId(res.conversationId);
        void loadConversations();
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setMessages((m) => [
            ...m,
            { id: `stopped-${Date.now()}`, role: "assistant", content: "_Generation stopped._" },
          ]);
        } else {
          const msg = err instanceof Error ? err.message : "The assistant could not respond.";
          setError(msg);
        }
      } finally {
        setSending(false);
        abortRef.current = null;
      }
    },
    [activeId, input, sending, loadConversations]
  );

  const stop = () => abortRef.current?.abort();

  const newConversation = () => {
    setActiveId(null);
    setMessages([]);
    setError("");
  };

  const deleteConversation = async (id: string) => {
    try {
      const { api } = await import("@/lib/api");
      await api.del(`/ai/conversations/${id}`);
      if (activeId === id) newConversation();
      void loadConversations();
      toast.success("Conversation deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const copyMessage = (content: string) => {
    void navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-[1400px] flex-col space-y-4 animate-fade-up">
      <PageHeader
        title="AI Assistant"
        description="Ask questions and run HR actions in natural language. The assistant only shows data you are allowed to see."
      />

      <div className="flex min-h-0 flex-1 gap-4">
        <aside className="hidden w-64 shrink-0 flex-col rounded-[16px] border border-border bg-card p-3 shadow-sm md:flex">
          <Button onClick={newConversation} className="mb-3 w-full justify-start" variant="outline">
            <MessageSquarePlus className="h-4 w-4" /> New conversation
          </Button>
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history..."
              className="h-8 pl-8 text-xs"
            />
          </div>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
            {filtered.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "group flex items-center gap-1 rounded-[10px] px-2 py-2 text-sm transition-colors",
                  activeId === c.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                )}
              >
                <button
                  onClick={() => void openConversation(c.id)}
                  className="min-w-0 flex-1 truncate text-left"
                  title={c.title}
                >
                  {c.title}
                </button>
                <button
                  onClick={() => void deleteConversation(c.id)}
                  aria-label="Delete conversation"
                  className="hidden shrink-0 rounded p-1 text-muted-foreground hover:text-destructive group-hover:block"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {!filtered.length && (
              <p className="px-2 py-4 text-xs text-muted-foreground">No conversations yet.</p>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col rounded-[16px] border border-border bg-card shadow-sm">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {!messages.length && !sending && (
              <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Bot className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">How can I help you today?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ask about employees, leave, attendance or payroll — in English or Arabic.
                  </p>
                </div>
                <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => void send(p)}
                      className="rounded-[12px] border border-border px-3.5 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex items-start gap-3", m.role === "user" && "flex-row-reverse")}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    m.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
                  )}
                >
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={cn(
                    "group max-w-[85%] rounded-[14px] px-4 py-3 text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background"
                  )}
                >
                  {m.role === "assistant" ? (
                    <div className="prose-sm space-y-2 [&_table]:w-full [&_table]:text-xs [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-2 [&_th]:py-1 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_li]:ml-4 [&_li]:list-disc">
                      <Markdown>{m.content}</Markdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                  {m.role === "assistant" && m.content !== "_Generation stopped._" && (
                    <button
                      onClick={() => copyMessage(m.content)}
                      aria-label="Copy response"
                      className="mt-2 hidden text-muted-foreground hover:text-foreground group-hover:block"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-[14px] border border-border px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-[12px] bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-center gap-2 border-t border-border p-3 sm:p-4"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything, e.g. Show employees who were late more than three times this month"
              disabled={sending}
              className="flex-1"
            />
            {sending ? (
              <Button type="button" variant="destructive" onClick={stop}>
                <Square className="h-4 w-4" /> Stop
              </Button>
            ) : (
              <Button type="submit" disabled={!input.trim()}>
                <Send className="h-4 w-4" /> Send
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
