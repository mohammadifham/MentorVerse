import { NextResponse } from 'next/server';
import { getAdminSubmissionsList, deleteSubmissionRecord, verifyAdminToken } from '@/lib/admin-service';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const submissions = await getAdminSubmissionsList(100);
    return NextResponse.json({ submissions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch code submissions.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required.' }, { status: 400 });
    }

    await deleteSubmissionRecord(submissionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete submission.' }, { status: 500 });
  }
}
