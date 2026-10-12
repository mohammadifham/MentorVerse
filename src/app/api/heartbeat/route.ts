import { NextResponse } from 'next/server';
import { recordUserHeartbeat } from '@/lib/admin-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userName, userEmail } = body;
    if (userId) {
      recordUserHeartbeat(userId, userName, userEmail);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
