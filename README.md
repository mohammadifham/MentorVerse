# MentorVerse

MentorVerse is a multi-agent AI learning ecosystem built with Next.js 14, TypeScript, Tailwind CSS, Supabase, Firebase Authentication, Hugging Face Inference API, and face-api.js attention tracking.

## Features

- Home, learning, and dashboard pages
- Teacher, cognitive, adaptive, mentor, evaluation, attendance, analysis, and attention agents
- Hugging Face integration for explanations, questions, and feedback
- Supabase-backed learning session storage
- Firebase Google sign-in
- Webcam attention detection with face-api.js

## Environment Variables

Copy `.env.example` to `.env.local` and set:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `HUGGINGFACE_API_KEY`
- `NEXT_PUBLIC_HUGGINGFACE_MODEL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Notes

- The attention detector expects face-api.js models to be available in `public/models`.
- The app falls back to safe local behavior if Hugging Face or Supabase credentials are missing.
- Run the Supabase migration in `supabase/migrations/0001_mentorverse_sessions.sql` to create the `mentorverse_sessions` table, indexes, and base RLS policies.
fix contributor graph
final fix now works
