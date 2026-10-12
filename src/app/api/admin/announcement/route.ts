import { NextResponse } from 'next/server';
import { getSystemAnnouncement, updateSystemAnnouncement, verifyAdminToken } from '@/lib/admin-service';

export async function GET() {
  const announcement = getSystemAnnouncement();
  return NextResponse.json({ announcement });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const body = await request.json();
    const updated = updateSystemAnnouncement({
      text: body.text || '',
      type: body.type || 'info',
      active: Boolean(body.active)
    });

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update announcement.' }, { status: 500 });
  }
}
