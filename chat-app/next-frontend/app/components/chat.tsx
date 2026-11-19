"use client";

import { useEffect, useRef, useState } from "react";
import { MessageView } from "./message";
import { applyEvent, createSSEParser } from "@/app/lib/sse";
import type { ChatMessage, StreamEvent } from "@/app/lib/types";

const ENDPOINT = process.env.NEXT_PUBLIC_CHAT_ENDPOINT ?? "/api/chat";
const STORAGE_KEY = "agent-chat:v1";

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [debug, setDebug] = useState(false);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const stickToBottom = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          conversationId: string | null;
          messages: ChatMessage[];
        };
        setConversationId(saved.conversationId);
        setMessages(saved.messages.map((m) => ({ ...m, streaming: false })));
      }
    } catch {
      // Unreadable storage is not worth a crash; start a fresh thread.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ conversationId, messages }),
    );
  }, [hydrated, conversationId, messages]);

  useEffect(() => {
    if (stickToBottom.current) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    const user: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text }],
    };
    const assistant: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      parts: [],
      streaming: true,
    };

    setInput("");
    setMessages((prev) => [...prev, user, assistant]);
    setBusy(true);
    stickToBottom.current = true;

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: text }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (
        !response.headers.get("content-type")?.includes("text/event-stream")
      ) {
        // shortcut: plain-JSON backend (Express), not the SSE contract in sse.ts.
        const data = (await response.json()) as { reply?: string };
        const replyEvents: StreamEvent[] = [
          { type: "token", text: data.reply ?? "" },
          { type: "message_end", messageId: crypto.randomUUID() },
        ];
        for (const event of replyEvents) {
          setMessages((prev) => applyEvent(prev, event));
          setEvents((prev) => [...prev, event].slice(-200));
        }
        return;
      }

      const parse = createSSEParser();
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        for (const event of parse(decoder.decode(value, { stream: true }))) {
          if (event.type === "conversation") setConversationId(event.id);
          setMessages((prev) => applyEvent(prev, event));
          setEvents((prev) => [...prev, event].slice(-200));
        }
      }
    } catch (error) {
      const aborted =
        error instanceof DOMException && error.name === "AbortError";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistant.id
            ? {
                ...m,
                streaming: false,
                error: aborted
                  ? undefined
                  : error instanceof Error
                    ? error.message
                    : String(error),
              }
            : m,
        ),
      );
    } finally {
      setMessages((prev) =>
        prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
      );
      setBusy(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function newChat() {
    abortRef.current?.abort();
    setMessages([]);
    setConversationId(null);
    setEvents([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  const last = messages.at(-1);
  const waiting = busy && last?.role === "assistant" && last.parts.length === 0;

  return (
    <div className="flex h-dvh flex-col bg-canvas font-sans text-ink">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-white shadow-sm">
            ?
          </div>
          <div className="mr-auto leading-tight">
            <h1 className="text-[15px] font-semibold tracking-tight">
              Q & A Bot
            </h1>
            {/* <p className="text-[11px] text-muted">
              MCP tools · RAG sources
              {conversationId && (
                <span className="ml-2 font-mono text-[10px]">
                  #{conversationId.slice(0, 8)}
                </span>
              )}
            </p> */}
          </div>
          <button
            type="button"
            aria-pressed={debug}
            onClick={() => setDebug((value) => !value)}
            className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-muted transition hover:border-accent/40 hover:text-ink aria-pressed:border-accent aria-pressed:bg-accent-soft aria-pressed:text-accent"
          >
            Debug
          </button>
          <button
            type="button"
            onClick={newChat}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition hover:bg-canvas hover:text-ink"
          >
            New chat
          </button>
        </div>
      </header>

      <div
        ref={listRef}
        onScroll={() => {
          const el = listRef.current;
          if (!el) return;
          stickToBottom.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        role="log"
        aria-live="polite"
        aria-busy={busy}
        className="flex-1 overflow-y-auto"
      >
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-2 pt-24 text-center">
              <div className="flex size-10 items-center justify-center rounded-full border border-line bg-surface text-accent shadow-sm">
                ✦
              </div>
              <p className="text-sm font-medium">Ready when you are</p>
              <p className="max-w-sm text-sm leading-relaxed text-muted">
                Ask something. Tool calls and retrieved sources show up inline
                so you can watch the agent work.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <MessageView key={message.id} message={message} />
          ))}

          {waiting && (
            <p className="flex items-center gap-2 text-sm text-muted">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
              Thinking…
            </p>
          )}
        </div>
      </div>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto w-full max-w-3xl space-y-2 p-3">
          {debug && (
            <pre className="max-h-40 overflow-auto rounded-lg bg-ink p-2.5 font-mono text-[11px] whitespace-pre-wrap break-all text-white/75">
              {events.length
                ? events.map((event) => JSON.stringify(event)).join("\n")
                : "(no events yet)"}
            </pre>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
            className="rounded-xl border border-line bg-surface p-2 shadow-sm transition focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/10"
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              rows={2}
              aria-label="Message"
              placeholder="Ask the agent…"
              className="max-h-40 w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none placeholder:text-muted/70"
            />
            <div className="flex items-center justify-between px-1 pt-1">
              <span className="text-[11px] text-muted">
                Enter to send · Shift+Enter for a new line
              </span>
              {busy ? (
                <button
                  type="button"
                  onClick={stop}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-canvas"
                >
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-accent-hover disabled:opacity-40"
                >
                  Send
                </button>
              )}
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
}
