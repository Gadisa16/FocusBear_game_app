FocusBear – Vite + Serverless API (Vercel)

Overview

- React app (Vite) in `src/`.
- Serverless endpoint at `api/generate-tasks.ts`.
- The client calls `/api/generate-tasks` and never sees secrets.

Environment variables (server-only)

- GROQ_API_KEY: Your Groq key.
- Optional: GROQ_MODEL or VERCEL_GROQ_MODEL (default: llama-3.1-8b-instant).

Local development

- Run the client: npm run dev
- Without GROQ_API_KEY, the API returns safe fallback tasks (suitable for dev/testing).

Build

- npm run build
- npm run preview (optional, static preview of the built app)

Deploy (Vercel)

- Push to GitHub and import the repo in Vercel.
- In Project Settings → Environment Variables, set GROQ_API_KEY (and optional GROQ_MODEL).
- Vercel will build and deploy the client; the `api/generate-tasks.ts` function runs server-side.

Security

- Never commit secrets. .gitignore excludes .env files.
- Do not use VITE\_\* env vars for AI keys; only set server-side env vars in your host.
