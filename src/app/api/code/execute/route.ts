import { NextResponse } from 'next/server';
import { z } from 'zod';
import { findCodeProblemById } from '@/lib/code-practice';
import { verifyRequestAuth } from '@/lib/firebase-admin';
import { generateWithHuggingFace } from '@/lib/huggingface';
import { generateIntelligentCodeGuidance } from '@/lib/ai-engine';
import { saveCodeSubmission } from '@/lib/supabase';

import { spawn } from 'node:child_process';

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

async function runLocally(input: { language: string; code: string; stdin: string }) {
  const lang = input.language.toLowerCase();
  let cmd = '';
  let args: string[] = [];

  if (lang.includes('python')) {
    cmd = 'python3';
    args = ['-c', input.code];
  } else if (lang.includes('javascript') || lang.includes('js') || lang.includes('node')) {
    cmd = 'node';
    args = ['-e', input.code];
  } else {
    return {
      output: '',
      errorText: `Execution for '${input.language}' requires local runtime or cloud compiler.`,
      compileCode: 1,
      runCode: 1,
      signal: null
    };
  }

  return new Promise<{
    output: string;
    errorText: string;
    compileCode: number | null;
    runCode: number | null;
    signal: string | null;
  }>((resolve) => {
    let stdout = '';
    let stderr = '';
    let killed = false;

    const proc = spawn(cmd, args);
    const timeout = setTimeout(() => {
      killed = true;
      proc.kill('SIGTERM');
    }, 5000);

    if (input.stdin) {
      proc.stdin.write(input.stdin);
    }
    proc.stdin.end();

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', (code, signal) => {
      clearTimeout(timeout);
      if (killed) {
        stderr = (stderr ? stderr + '\n' : '') + 'Execution timed out (5s limit).';
      }
      resolve({
        output: stdout.trim(),
        errorText: stderr.trim(),
        compileCode: 0,
        runCode: code ?? (killed ? 124 : 0),
        signal: signal ?? null
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      resolve({
        output: '',
        errorText: err.message,
        compileCode: null,
        runCode: 1,
        signal: null
      });
    });
  });
}

async function runOnce(input: {
  language: string;
  version: string;
  code: string;
  stdin: string;
}) {
  try {
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

    if (response.ok) {
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
  } catch {
    // Piston offline, fallback to local execution
  }

  return runLocally(input);
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

    let finalAiFeedback = '';
    if (process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || process.env.OPENAI_API_KEY) {
      try {
        finalAiFeedback = await generateWithHuggingFace(aiPrompt, {
          systemPrompt: 'You are MentorVerse Code Mentor. Be practical, supportive, and specific.',
          maxNewTokens: 180
        });
      } catch {
        // Fall back to domain guidance
      }
    }

    if (!finalAiFeedback || finalAiFeedback.trim().length === 0) {
      finalAiFeedback = await generateIntelligentCodeGuidance({
        problemTitle: problem.title,
        language: body.language,
        code: body.code,
        passed,
        score,
        passCount,
        totalTests,
        compilerError: globalError,
        firstFailed
      });
    }

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
      aiFeedback: finalAiFeedback
    });

    return NextResponse.json({
      output: visibleRun.output,
      error: globalError,
      passed,
      score,
      passCount,
      totalTests,
      aiFeedback: finalAiFeedback,
      compileCode: visibleRun.compileCode,
      runCode: visibleRun.runCode,
      signal: visibleRun.signal
    });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message ?? 'Invalid request.' : error instanceof Error ? error.message : 'Unexpected error.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
