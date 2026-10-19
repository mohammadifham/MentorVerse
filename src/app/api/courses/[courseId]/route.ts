import { NextResponse } from 'next/server';
import { getCourseById } from '@/lib/supabase';

export async function GET(
  _request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    const course = await getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found in database.' }, { status: 404 });
    }
    return NextResponse.json({ course });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to query course.' },
      { status: 500 }
    );
  }
}
