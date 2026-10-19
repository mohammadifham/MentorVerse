import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/local-db';
import type { CourseCertificate } from '@/lib/types';
import { getCourseById } from '@/lib/courses-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const certId = searchParams.get('id');
    const userId = searchParams.get('userId');

    const db = readDatabase() as any;
    const certs: CourseCertificate[] = Array.isArray(db.certificates) ? db.certificates : [];

    if (certId) {
      const match = certs.find((c) => c.id.toLowerCase() === certId.toLowerCase());
      if (!match) {
        return NextResponse.json({ error: 'Certificate not found.' }, { status: 404 });
      }
      return NextResponse.json({ certificate: match });
    }

    if (userId) {
      const userCerts = certs.filter((c) => c.userId === userId);
      return NextResponse.json({ certificates: userCerts });
    }

    return NextResponse.json({ certificates: certs });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to query certificates.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, studentName, courseId, scorePercentage = 92 } = body;

    if (!userId || !studentName || !courseId) {
      return NextResponse.json(
        { error: 'userId, studentName, and courseId are required.' },
        { status: 400 }
      );
    }

    const course = getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    const db = readDatabase() as any;
    if (!Array.isArray(db.certificates)) {
      db.certificates = [];
    }

    // Check if certificate already issued for this user & course
    const existing = db.certificates.find(
      (c: CourseCertificate) => c.userId === userId && c.courseId === courseId
    );
    if (existing) {
      return NextResponse.json({ certificate: existing, alreadyIssued: true });
    }

    const certId = `GUIDELY-CERT-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Extract key skills from course
    const skills = course.modules.flatMap((m) => m.lessons.flatMap((l) => l.keyConcepts)).slice(0, 8);

    const newCert: CourseCertificate = {
      id: certId,
      userId,
      studentName: studentName.trim(),
      courseId: course.id,
      courseTitle: course.title,
      level: course.level,
      issueDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      scorePercentage: typeof scorePercentage === 'number' ? scorePercentage : 92,
      skills: skills.length > 0 ? skills : ['Data Structures', 'Algorithmic Optimization', 'System Analysis'],
      verificationUrl: `https://guidely.ai/certificates/${certId}`
    };

    db.certificates.unshift(newCert);
    writeDatabase(db);

    return NextResponse.json({ certificate: newCert, success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Certificate generation failed.' },
      { status: 500 }
    );
  }
}
