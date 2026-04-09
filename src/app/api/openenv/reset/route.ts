import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ ok: true, reset: true });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
