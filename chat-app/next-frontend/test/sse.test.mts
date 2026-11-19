import assert from "node:assert/strict";
import test from "node:test";
import { applyEvent, createSSEParser } from "../app/lib/sse.ts";
import type { ChatMessage, StreamEvent } from "../app/lib/types.ts";

const frame = (event: StreamEvent) => `data: ${JSON.stringify(event)}\n\n`;

test("parser handles frames split across chunks", () => {
  const parse = createSSEParser();
  const wire = frame({ type: "token", text: "Hel" });

  assert.deepEqual(parse(wire.slice(0, 10)), []);
  assert.deepEqual(parse(wire.slice(10)), [{ type: "token", text: "Hel" }]);
});

test("parser returns every frame found in one chunk", () => {
  const parse = createSSEParser();
  const wire =
    frame({ type: "token", text: "a" }) +
    frame({ type: "tool_call", id: "t1", server: "s", tool: "x", args: {} }) +
    frame({ type: "message_end", messageId: "m1" });

  assert.equal(parse(wire).length, 3);
});

const assistant = (): ChatMessage => ({
  id: "a1",
  role: "assistant",
  parts: [],
  streaming: true,
});

test("reducer keeps one text part, starts a new one after a tool call", () => {
  let messages = [assistant()];
  messages = applyEvent(messages, { type: "token", text: "checking" });
  messages = applyEvent(messages, {
    type: "tool_call",
    id: "t1",
    server: "files",
    tool: "search",
    args: { q: "refund" },
  });
  messages = applyEvent(messages, { type: "token", text: " done" });

  const parts = messages[0].parts;
  assert.deepEqual(parts.map((p) => p.type), ["text", "tool", "text"]);
  assert.equal(parts[0].type === "text" && parts[0].text, "checking");
  assert.equal(parts[2].type === "text" && parts[2].text, " done");
});

test("reducer patches a tool card by id", () => {
  const messages = applyEvent(
    [
      {
        ...assistant(),
        parts: [
          {
            type: "tool",
            id: "t1",
            server: "files",
            tool: "search",
            args: {},
            state: "running",
          },
        ],
      },
    ],
    { type: "tool_result", id: "t1", result: { hits: 2 } },
  );

  const part = messages[0].parts[0];
  assert.equal(part.type === "tool" && part.state, "done");
  assert.equal(part.type === "tool" && part.error, undefined);
});

test("reducer marks errors and ends streaming", () => {
  const messages = applyEvent([assistant()], {
    type: "error",
    message: "backend down",
  });

  assert.equal(messages[0].streaming, false);
  assert.equal(messages[0].error, "backend down");
});

test("reducer ignores events that arrive without an assistant message", () => {
  assert.deepEqual(applyEvent([], { type: "token", text: "x" }), []);
});
