"use client";

import { useState } from "react";
import Markdown, { type Components } from "react-markdown";
import type { ChatMessage, Part, Source } from "@/app/lib/types";

type ToolPart = Extract<Part, { type: "tool" }>;

// shortcut: common blocks only; add heading/table mappings if answers start using them.
const markdown: Components = {
  p: ({ children }) => <p className="break-words">{children}</p>,
  ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="break-words">{children}</li>,
  code: ({ children }) => (
    <code className="rounded bg-white/60 px-1 py-0.5 font-mono text-[13px]">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-lg bg-white/60 p-3 font-mono text-[13px]">{children}</pre>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-accent underline">
      {children}
    </a>
  ),
};

export function MessageView({ message }: { message: ChatMessage }) {
  const fromUser = message.role === "user";

  return (
    <article className={fromUser ? "flex justify-end" : "flex"}>
      <div
        className={
          fromUser
            ? "max-w-[85%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-[15px] leading-relaxed text-white shadow-sm"
            : "min-w-0 flex-1 space-y-3 text-[15px] leading-relaxed"
        }
      >
        {message.parts.map((part, i) =>
          part.type === "text" ? (
            fromUser ? (
              <p key={i} className="whitespace-pre-wrap break-words">
                {part.text}
              </p>
            ) : (
              <div
                key={i}
                className="w-[90%] space-y-2 rounded-lg bg-slate-300 px-3 py-4"
              >
                <Markdown components={markdown}>{part.text}</Markdown>
              </div>
            )
          ) : part.type === "sources" ? (
            <Sources key={i} sources={part.sources} />
          ) : (
            <ToolCard key={part.id} part={part} />
          ),
        )}

        {message.streaming && (
          <span aria-hidden className="animate-pulse text-accent">
            ▍
          </span>
        )}
        {message.error && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {message.error}
          </p>
        )}
      </div>
    </article>
  );
}

function ToolCard({ part }: { part: ToolPart }) {
  const [open, setOpen] = useState(part.state === "running");

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group rounded-xl border border-line bg-surface text-xs shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 [&::-webkit-details-marker]:hidden">
        <StatePill state={part.state} />
        <span className="truncate font-mono text-[11px] text-ink">
          {part.server}
          <span className="text-muted"> / </span>
          {part.tool}
        </span>
        <span className="ml-auto text-[10px] text-muted transition group-open:rotate-180">
          ▾
        </span>
      </summary>

      <div className="space-y-2 border-t border-line bg-canvas/60 p-3 font-mono text-[11px] leading-relaxed">
        <div>
          <p className="mb-1 font-sans text-[10px] tracking-wide text-muted uppercase">
            args
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(part.args, null, 2)}
          </pre>
        </div>
        {part.state !== "running" && (
          <div className="border-t border-line pt-2">
            <p className="mb-1 font-sans text-[10px] tracking-wide text-muted uppercase">
              result
            </p>
            <pre className="overflow-x-auto whitespace-pre-wrap break-all text-muted">
              {part.error ?? JSON.stringify(part.result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </details>
  );
}

function StatePill({ state }: { state: ToolPart["state"] }) {
  const styles = {
    running: "bg-amber-50 text-amber-700 ring-amber-200",
    done: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    error: "bg-rose-50 text-rose-700 ring-rose-200",
  }[state];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${styles}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {state}
    </span>
  );
}

function Sources({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;

  return (
    <details className="group rounded-xl border border-line bg-surface text-xs shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 font-medium text-ink [&::-webkit-details-marker]:hidden">
        Sources
        <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent">
          {sources.length}
        </span>
        <span className="ml-auto text-[10px] text-muted transition group-open:rotate-180">
          ▾
        </span>
      </summary>

      <ul className="divide-y divide-line border-t border-line">
        {sources.map((source, i) => (
          <li key={`${source.docId}-${i}`} className="px-3 py-2">
            <div className="flex items-baseline gap-2">
              <span className="rounded bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-muted ring-1 ring-line">
                {source.score.toFixed(2)}
              </span>
              <span className="text-[13px] font-medium text-ink">
                {source.title}
              </span>
            </div>
            <p className="mt-1 leading-relaxed text-muted">{source.snippet}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}
