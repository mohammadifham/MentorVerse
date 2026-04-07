import { NextResponse } from 'next/server';
import { getPublicCodeProblems } from '@/lib/code-practice';

export async function GET() {
  return NextResponse.json({ problems: getPublicCodeProblems() });
}
