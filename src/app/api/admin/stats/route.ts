import { NextResponse } from 'next/server';
import { getAdminRealtimeStats, verifyAdminToken } from '@/lib/admin-service';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const stats = await getAdminRealtimeStats();
    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admin stats.' }, { status: 500 });
  }
}
