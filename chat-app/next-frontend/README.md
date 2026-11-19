This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Agent chat frontend

`npm run dev` works with no backend: `app/api/chat/route.ts` is a temporary
fake that streams a tool call, two sources and some text.

Point the UI at the real Express agent with one env var (`.env.local`):

```bash
NEXT_PUBLIC_CHAT_ENDPOINT=http://localhost:5000/api/chat
```

Express then needs CORS for the browser origin and must answer `POST` with
`Content-Type: text/event-stream`, one JSON object per `data:` frame:

| event | payload |
| --- | --- |
| `conversation` | `{ id }` — sent when the request had `conversationId: null` |
| `token` | `{ text }` |
| `sources` | `{ chunks: [{ docId, title, snippet, score }] }` |
| `tool_call` | `{ id, server, tool, args }` |
| `tool_result` | `{ id, result?, error? }` — same `id` as the call |
| `message_end` | `{ messageId, usage? }` |
| `error` | `{ message }` |

Where things live:

- `app/components/chat.tsx` — thread state, SSE consumption, stop button,
  localStorage persistence, debug event log.
- `app/components/message.tsx` — text, MCP tool card, RAG sources.
- `app/lib/sse.ts` — frame parser + the reducer that folds events into a
  message. This is the only place that knows the wire format.
- `app/lib/types.ts` — the contract above, as TypeScript.
- `test/sse.test.mts` — `npm test` covers frame splitting and reducer order.
