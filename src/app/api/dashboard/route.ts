import { NextResponse } from 'next/server';
import { verifyRequestAuth } from '@/lib/firebase-admin';
import { getDashboardSummary } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { uid } = await verifyRequestAuth(request);
    const summary = await getDashboardSummary(uid);
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
