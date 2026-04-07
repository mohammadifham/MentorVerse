import { NextResponse } from 'next/server';

const PISTON_RUNTIMES_URL = 'https://emkc.org/api/v2/piston/runtimes';

type PistonRuntime = {
  language: string;
  version: string;
};

export async function GET() {
  try {
    const response = await fetch(PISTON_RUNTIMES_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Unable to fetch runtimes.');
    }

    const runtimes = (await response.json()) as PistonRuntime[];
    const normalized = runtimes
      .filter((item) => item.language && item.version)
      .sort((a, b) => a.language.localeCompare(b.language))
      .map((item) => ({ language: item.language, version: item.version }));

    return NextResponse.json({ runtimes: normalized });
  } catch {
    return NextResponse.json(
      {
        runtimes: [
          { language: 'javascript', version: '18.15.0' },
          { language: 'typescript', version: '5.0.3' },
          { language: 'python', version: '3.10.0' },
          { language: 'java', version: '15.0.2' },
          { language: 'c', version: '10.2.0' },
          { language: 'cpp', version: '10.2.0' },
          { language: 'go', version: '1.16.2' },
          { language: 'rust', version: '1.68.2' },
          { language: 'csharp', version: '6.12.0' }
        ]
      },
      { status: 200 }
    );
  }
}
