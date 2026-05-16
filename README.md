# Sahayak Frontend

**Live:** https://sahayak-frontend-jade.vercel.app

Next.js frontend for the Sahayak AI assistant — a chat interface built for Mumbai gig workers to ask questions about their rights, wages, jobs, and government schemes.

---

## Features

- **Streaming responses** — answers appear word by word via Server-Sent Events
- **Agent transparency** — shows which tools are running before the answer arrives
- **Multilingual** — auto-detects language, supports English, Hindi, Marathi
- **Cached answers** — ⚡ badge on instant cached responses
- **Mobile first** — designed for smartphone users
- **Suggested questions** — quick-start prompts on empty state

---

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Deployed on Vercel

---

## Setup

```bash
git clone https://github.com/aarugit797/sahayak-frontend
cd sahayak-frontend
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=https://sahayak-1080882830155.us-central1.run.app
```

```bash
npm run dev
# visit http://localhost:3000
```

---

## Connecting to backend

The frontend calls two endpoints:

- `POST /api/query/stream` — streaming SSE endpoint (used by the chat UI)
- `POST /api/query` — standard JSON endpoint (for direct API access)

The streaming endpoint sends three event types:
```
{"type": "status", "content": "🔍 Analyzing..."}  → progress indicator
{"type": "token",  "content": "word "}             → append to answer
{"type": "done",   "cached": false}                → stream complete
```

---

## Deployment

Connected to GitHub — Vercel auto-deploys on every push to `main`.

Set `NEXT_PUBLIC_API_URL` in Vercel environment variables to point to your backend URL.

---

## Backend

The backend repo is at [Mumbai_Informal_Gig](https://github.com/aarugit797/Mumbai_Informal_Gig).
