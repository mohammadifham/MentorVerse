import { NextResponse } from 'next/server';
import { getAdminUsersList, deleteUserAccount, verifyAdminToken } from '@/lib/admin-service';
import { upsertLocalLearnerProfile } from '@/lib/local-db';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const users = await getAdminUsersList();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
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
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    await deleteUserAccount(userId);
    return NextResponse.json({ success: true, message: `User ${userId} deleted.` });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, course, phone } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const newId = `student_${Date.now().toString(36)}`;
    upsertLocalLearnerProfile({
      userId: newId,
      name,
      email,
      course: course || 'Computer Science Engineering',
      phone: phone || 'Not specified',
      profileDp: undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Student account created successfully.',
      userId: newId
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create student account.' }, { status: 500 });
  }
}
