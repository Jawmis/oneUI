# oneUI

A local-first AI chat workspace for organizing conversations by project folder and session. The React client talks to a Bun WebSocket service; MongoDB stores workspaces, sessions, and conversation events. The backend can run Anthropic's Claude Agent SDK or Gemini.

This is a working prototype, not a hosted service. [Watch the product recording](https://jamisbade.com/oneui-demo.mov).

## What it does

- Create and delete workspaces and chat sessions; select a model and send prompts from the chat UI.
- Keep the client and server message shapes in a shared `packages/commons` package with Zod validation on incoming events.
- Persist conversation events in MongoDB and return session acknowledgements over each client's WebSocket connection.

## Architecture

| Path | Responsibility |
| --- | --- |
| `apps/frontend` | React 19 chat UI, model settings, WebSocket client |
| `apps/backend` | Bun WebSocket server, session handling, Anthropic and Gemini adapters |
| `packages/commons` | Shared incoming/outgoing event contracts |
| `packages/db` | Mongoose workspace and session models |

The WebSocket path sends replies to the requesting client; it is not a multi-user broadcast system. The Gemini adapter returns a completed response after generation rather than streaming individual tokens into the UI. API keys entered in the UI are held in browser session storage and sent to the local backend with the prompt. Use this as a local development workspace, not a public multi-tenant deployment.

## Run locally

Requires Bun 1.4, Node.js 24+, and a local MongoDB instance.

```sh
bun install
```

Start the backend and frontend in separate terminals:

```sh
cd apps/backend
DB_URL=mongodb://127.0.0.1:27017/oneui bun index.ts
```

```sh
cd apps/frontend
bun dev
```

Open `http://localhost:5174`. The backend listens on `ws://localhost:3000`. Set `VITE_BACKEND_URL` in the frontend environment if the backend is elsewhere. For Anthropic, configure credentials expected by the Claude Agent SDK; for Gemini, add a key in Model settings or set `GEMINI_API_KEY` for the backend.

## Current limits

- Workspace paths and agent tool permissions assume a trusted local user. Do not expose the backend to untrusted clients.
- WebSocket responses are per-client; shared live collaboration is not implemented.
- The README makes no throughput or latency claims. Any load figures need a reproducible harness and environment details.
