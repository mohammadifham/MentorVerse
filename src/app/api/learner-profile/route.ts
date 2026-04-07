import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyRequestAuth } from '@/lib/firebase-admin';
import { getLearnerProfile, upsertLearnerProfile } from '@/lib/supabase';

function isValidProfileDp(value: string): boolean {
  if (!value) {
    return true;
  }

  if (value.startsWith('data:image/')) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const profileSchema = z.object({
  userId: z.string().trim().min(1),
  name: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  email: z.string().trim().email(),
  course: z.string().trim().min(2),
  profileDp: z.string().trim().optional().refine((value) => isValidProfileDp(value ?? ''), {
    message: 'Profile DP must be an image URL or uploaded image data.'
  })
});

export async function GET(request: Request) {
  try {
    const { uid } = await verifyRequestAuth(request);
    const profile = await getLearnerProfile(uid);
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const { uid } = await verifyRequestAuth(request);
    const payload = profileSchema.parse(await request.json());

    await upsertLearnerProfile({
      userId: uid,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      course: payload.course,
      profileDp: payload.profileDp || undefined
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message ?? 'Invalid payload.' : 'Unable to save learner profile.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
