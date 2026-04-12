---
title: MentorVerse
emoji: "🚀"
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# MentorVerse

MentorVerse is a multi-agent AI learning platform built with Next.js 14, TypeScript, Tailwind CSS, Supabase, Firebase Authentication, Hugging Face Inference API, and face-api.js.

## Highlights

- Learning and dashboard workspaces with adaptive feedback
- Agent-driven teaching, mentoring, evaluation, and analysis flows
- AI-assisted coding practice and response feedback
- Supabase-backed session and profile persistence
- Firebase authentication integration
- Optional webcam-based attention monitoring

## Project Structure

- `src/app` - App Router pages and API routes
- `src/components` - Reusable UI and workspace components
- `src/lib` - Integrations, business logic, and agent modules
- `src/types` - Shared TypeScript types
- `public/models` - face-api.js model manifests and optional artifacts
- `supabase/migrations` - SQL migrations

## Local Setup

1. Install dependencies:
	`npm install`
2. Copy environment template:
	`cp .env.example .env.local`
3. Fill required values in `.env.local`.
4. Start development server:
	`npm run dev`

## Scripts

- `npm run dev` - Start local development server
- `npm run build` - Create production build
- `npm run start` - Run production server
- `npm run lint` - Run lint checks

## Environment Variables

Use `.env.example` as the source of truth for required keys.

For Vercel deployments, add these variables in Project Settings -> Environment Variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `HUGGINGFACE_API_KEY` or (`HF_TOKEN`, `API_BASE_URL`, `MODEL_NAME` for OpenAI-compatible inference)

After adding/updating environment variables, redeploy so Next.js rebuilds with the correct `NEXT_PUBLIC_*` values.

Security notes:

- Never commit `.env.local`.
- Store production secrets in your deployment platform settings.
- Rotate credentials immediately if exposed.

## Deployment

This repository is configured for Hugging Face Spaces with Docker (`app_port: 7860`).

Primary deployment URL:

- `https://ifham69-mentorverse.hf.space`
