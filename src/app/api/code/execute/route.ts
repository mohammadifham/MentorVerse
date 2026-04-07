import { NextResponse } from 'next/server';
import { z } from 'zod';
import { findCodeProblemById } from '@/lib/code-practice';
import { verifyRequestAuth } from '@/lib/firebase-admin';
import { generateWithHuggingFace } from '@/lib/huggingface';
import { saveCodeSubmission } from '@/lib/supabase';

const PISTON_EXECUTE_URL = 'https://emkc.org/api/v2/piston/execute';

const requestSchema = z.object({
  userId: z.string().trim().optional(),
  problemId: z.string().trim().min(1),
  language: z.string().trim().min(1),
  version: z.string().trim().min(1),
  code: z.string().min(1),
  stdin: z.string().optional().default(''),
  problemTitle: z.string().trim().optional().default('Coding problem')
});

function normalizeOutput(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

async function runOnce(input: {
  language: string;
  version: string;
  code: string;
  stdin: string;
}) {
  const response = await fetch(PISTON_EXECUTE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: input.language,
      version: input.version,
      files: [{ content: input.code }],
      stdin: input.stdin,
      compile_timeout: 12000,
      run_timeout: 4000
    })
  });

  if (!response.ok) {
    throw new Error('Compiler service failed.');
  }

  const payload = (await response.json()) as {
    run?: {
      stdout?: string;
      stderr?: string;
      output?: string;
      code?: number;
      signal?: string;
    };
    compile?: {
      stdout?: string;
      stderr?: string;
      code?: number;
    };
  };

  const compileStdErr = payload.compile?.stderr ?? '';
  const compileStdOut = payload.compile?.stdout ?? '';
  const runStdOut = payload.run?.stdout ?? '';
  const runStdErr = payload.run?.stderr ?? '';
  const runOutput = payload.run?.output ?? '';

  return {
    output: [compileStdOut, runStdOut, runOutput].filter(Boolean).join('\n').trim(),
    errorText: [compileStdErr, runStdErr].filter(Boolean).join('\n').trim(),
    compileCode: payload.compile?.code ?? null,
    runCode: payload.run?.code ?? null,
    signal: payload.run?.signal ?? null
  };
}

export async function POST(request: Request) {
  try {
    const { uid } = await verifyRequestAuth(request);
    const body = requestSchema.parse(await request.json());

    const problem = findCodeProblemById(body.problemId);
    if (!problem) {
      throw new Error('Problem not found.');
    }

    const visibleRun = await runOnce({
      language: body.language,
      version: body.version,
      code: body.code,
      stdin: body.stdin
    });

    const hiddenResults: Array<{ input: string; expected: string; actual: string; passed: boolean }> = [];
    let globalError = visibleRun.errorText;

    for (const testCase of problem.hiddenTests) {
      const run = await runOnce({
        language: body.language,
        version: body.version,
        code: body.code,
        stdin: testCase.input
      });

      if (run.errorText) {
        globalError = run.errorText;
      }

      const didPass = !run.errorText && normalizeOutput(run.output) === normalizeOutput(testCase.output);
      hiddenResults.push({
        input: testCase.input,
        expected: testCase.output,
        actual: run.output,
        passed: didPass
      });

      if (run.errorText) {
        break;
      }
    }

    const passCount = hiddenResults.filter((result) => result.passed).length;
    const totalTests = problem.hiddenTests.length;
    const score = totalTests > 0 ? Math.round((passCount / totalTests) * 100) : 0;
    const passed = passCount === totalTests && !globalError;

    const firstFailed = hiddenResults.find((result) => !result.passed);

    const aiPrompt = `
You are an expert coding mentor for CSE and engineering students.
Problem: ${problem.title}
Language: ${body.language}
Public Input Output: ${body.stdin || 'No input'} => ${visibleRun.output || 'No output'}
Hidden Tests Passed: ${passCount}/${totalTests}
First Failed Hidden Test: ${firstFailed ? `input(${firstFailed.input}) expected(${firstFailed.expected}) actual(${firstFailed.actual || 'No output'})` : 'None'}
Compiler/Runtime Error: ${globalError || 'None'}
Status: ${passed ? 'PASS' : 'NOT PASS'}

Give concise guidance with:
1) What is correct or wrong
2) One likely root cause
3) Next fix steps
Keep it within 6 lines.
`;

    const aiFeedback = await generateWithHuggingFace(aiPrompt, {
      systemPrompt: 'You are MentorVerse Code Mentor. Be practical, supportive, and specific.',
      maxNewTokens: 180
    });

    await saveCodeSubmission({
      userId: uid,
      problemId: problem.id,
      problemTitle: problem.title,
      topic: problem.topic,
      language: body.language,
      version: body.version,
      score,
      passed,
      output: visibleRun.output,
      error: globalError,
      aiFeedback
    });

    return NextResponse.json({
      output: visibleRun.output,
      error: globalError,
      passed,
      score,
      passCount,
      totalTests,
      aiFeedback,
      compileCode: visibleRun.compileCode,
      runCode: visibleRun.runCode,
      signal: visibleRun.signal
    });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message ?? 'Invalid request.' : error instanceof Error ? error.message : 'Unexpected error.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
