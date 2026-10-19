import { NextResponse } from 'next/server';
import { getCourses, upsertCourse } from '@/lib/supabase';
import type { Course } from '@/lib/types';

export async function GET() {
  try {
    const courses = await getCourses();
    return NextResponse.json({ courses, total: courses.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch courses from database.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Course;
    if (!body || !body.id || !body.title) {
      return NextResponse.json({ error: 'Invalid course payload.' }, { status: 400 });
    }
    await upsertCourse(body);
    return NextResponse.json({ success: true, course: body });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save course to database.' },
      { status: 500 }
    );
  }
}
