export type Source = {
  docId: string;
  title: string;
  snippet: string;
  score: number;
};

export type Part =
  | { type: "text"; text: string }
  | { type: "sources"; sources: Source[] }
  | {
      type: "tool";
      id: string;
      server: string;
      tool: string;
      args: unknown;
      result?: unknown;
      error?: string;
      state: "running" | "done" | "error";
    };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  /** Ordered so tool calls and citations interleave with the generated text. */
  parts: Part[];
  streaming?: boolean;
  error?: string;
};

/** Wire contract: one JSON object per SSE `data:` line. */
export type StreamEvent =
  | { type: "conversation"; id: string }
  | { type: "token"; text: string }
  | { type: "sources"; chunks: Source[] }
  | {
      type: "tool_call";
      id: string;
      server: string;
      tool: string;
      args: unknown;
    }
  | { type: "tool_result"; id: string; result?: unknown; error?: string }
  | { type: "message_end"; messageId: string; usage?: unknown }
  | { type: "error"; message: string };
