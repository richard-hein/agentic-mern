import type { ChatMessage, Part, StreamEvent } from "./types.ts";

/**
 * Incremental SSE parser. Returns a function you feed decoded text chunks;
 * it returns the complete events found so far.
 *
 * shortcut: assumes frames end with "\n\n" (what our handlers write), no CRLF
 * or comment lines. Upgrade if you swap in a proxy that rewrites line endings.
 * 
 * 
 */
export function createSSEParser() {
  let buffer = "";

  return (chunk: string): StreamEvent[] => {
    buffer += chunk;
    const events: StreamEvent[] = [];
    let end: number;

    while ((end = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);

      const data = frame
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim())
        .join("\n");

      if (data) events.push(JSON.parse(data) as StreamEvent);
    }

    return events;
  };
}

/**
 * Folds one server event into the last assistant message.
 * Pure, so the streaming UI and the tests share the same logic.
 */
export function applyEvent(
  messages: ChatMessage[],
  event: StreamEvent,
): ChatMessage[] {
  const index = messages.length - 1;
  const message = messages[index];
  if (message?.role !== "assistant") return messages;

  const replace = (parts: Part[], patch: Partial<ChatMessage> = {}) =>
    messages.with(index, { ...message, ...patch, parts });

  switch (event.type) {
    case "token": {
      const last = message.parts.at(-1);
      if (last?.type === "text") {
        return replace(
          message.parts.with(-1, { ...last, text: last.text + event.text }),
        );
      }
      return replace([...message.parts, { type: "text", text: event.text }]);
    }

    case "sources":
      return replace([
        ...message.parts,
        { type: "sources", sources: event.chunks },
      ]);

    case "tool_call": {
      const { id, server, tool, args } = event;
      return replace([
        ...message.parts,
        { type: "tool", id, server, tool, args, state: "running" },
      ]);
    }

    case "tool_result":
      return replace(
        message.parts.map((part) =>
          part.type === "tool" && part.id === event.id
            ? {
              ...part,
              result: event.result,
              error: event.error,
              state: event.error ? "error" : "done",
            }
            : part,
        ),
      );

    case "message_end":
      return replace(message.parts, { streaming: false });

    case "error":
      return replace(message.parts, {
        streaming: false,
        error: event.message,
      });

    case "conversation":
      return messages;
  }
}
