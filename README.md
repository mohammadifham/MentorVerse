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

Security notes:

- Never commit `.env.local`.
- Store production secrets in your deployment platform settings.
- Rotate credentials immediately if exposed.

## Deployment

This repository is configured for Hugging Face Spaces with Docker (`app_port: 7860`).

Primary deployment URL:

- `https://ifham69-mentorverse.hf.space`
