import { NextResponse } from 'next/server';

function okJson() {
  return NextResponse.json({ ok: true, reset: true });
}

export async function GET() {
  return okJson();
}

export async function POST() {
  return okJson();
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
