import type { StreamEvent } from "@/app/lib/types";

/**
 * Temporary fake backend so the frontend can be built before Express exists.
 * Set NEXT_PUBLIC_CHAT_ENDPOINT (e.g. http://localhost:5000/api/chat) and the
 * browser calls Express directly; this route is then unused.
 */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const body = (await request.json()) as { message?: string };
  const question = body.message ?? "";

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const aborted = () => request.signal.aborted;
      const send = (event: StreamEvent) => {
        if (aborted()) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      const sleep = async (ms: number) => {
        await wait(ms);
        return !aborted();
      };

      const callId = crypto.randomUUID();

      send({ type: "conversation", id: crypto.randomUUID() });
      if (!(await sleep(400))) return controller.close();

      send({
        type: "tool_call",
        id: callId,
        server: "local-mcp",
        tool: "docs_search",
        args: { query: question, limit: 3 },
      });

      if (!(await sleep(700))) return controller.close();

      send({
        type: "sources",
        chunks: [
          {
            docId: "refund-policy",
            title: "Refund policy",
            snippet:
              "Refunds are accepted within 30 days of delivery, provided the item is unused.",
            score: 0.87,
          },
          {
            docId: "shipping-faq",
            title: "Shipping FAQ",
            snippet:
              "Return shipping is paid by the customer unless the item arrived damaged.",
            score: 0.62,
          },
        ],
      });

      send({
        type: "tool_result",
        id: callId,
        result: { hits: 2, tookMs: 42 },
      });

      const reply = `This is the fake streamer replying to "${question}". It exists only so the UI, the SSE parser and the MCP/RAG cards can be built and tested before your Express agent is ready. Point NEXT_PUBLIC_CHAT_ENDPOINT at your backend and this file stops being used.`;

      for (const word of reply.split(" ")) {
        send({ type: "token", text: `${word} ` });
        if (!(await sleep(25))) return controller.close();
      }

      send({ type: "message_end", messageId: crypto.randomUUID() });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
