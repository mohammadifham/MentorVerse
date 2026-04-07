'use client';

import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { CheckCircle2, Code2, Play, TerminalSquare } from 'lucide-react';
import { getFirebaseAuth } from '@/lib/firebase';

type RuntimeOption = {
  language: string;
  version: string;
};

type PracticeProblem = {
  id: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  statement: string;
  sampleInput: string;
  expectedOutput: string;
};

const fallbackProblems: PracticeProblem[] = [
  {
    id: 'sum-two',
    topic: 'DSA Basics',
    difficulty: 'easy',
    title: 'Sum of Two Numbers',
    statement: 'Read two integers and print their sum.',
    sampleInput: '10 15',
    expectedOutput: '25'
  }
];

const starterCode: Record<string, string> = {
  javascript: 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim();\n\n// Write your solution here\nconsole.log(input);',
  typescript: 'import * as fs from "fs";\nconst input = fs.readFileSync(0, "utf8").trim();\n\n// Write your solution here\nconsole.log(input);',
  python: 'import sys\ninput_data = sys.stdin.read().strip()\n\n# Write your solution here\nprint(input_data)',
  java: 'import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    String input = sc.hasNextLine() ? sc.nextLine() : "";\n\n    // Write your solution here\n    System.out.println(input);\n  }\n}',
  c: '#include <stdio.h>\n\nint main() {\n  // Write your solution here\n  return 0;\n}',
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  // Write your solution here\n  return 0;\n}',
  go: 'package main\n\nimport (\n  "bufio"\n  "fmt"\n  "os"\n)\n\nfunc main() {\n  in := bufio.NewReader(os.Stdin)\n  var s string\n  fmt.Fscan(in, &s)\n\n  // Write your solution here\n  fmt.Println(s)\n}',
  rust: 'use std::io::{self, Read};\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n\n    // Write your solution here\n    println!("{}", input.trim());\n}',
  csharp: 'using System;\n\nclass Program\n{\n    static void Main()\n    {\n        var input = Console.ReadLine() ?? string.Empty;\n\n        // Write your solution here\n        Console.WriteLine(input);\n    }\n}'
};

export function CodePracticeWorkspace() {
  const [runtimes, setRuntimes] = useState<RuntimeOption[]>([]);
  const [problems, setProblems] = useState<PracticeProblem[]>(fallbackProblems);
  const [topicFilter, setTopicFilter] = useState('All Sheets');
  const [language, setLanguage] = useState('javascript');
  const [version, setVersion] = useState('18.15.0');
  const [code, setCode] = useState(starterCode.javascript);
  const [stdin, setStdin] = useState(fallbackProblems[0].sampleInput);
  const [output, setOutput] = useState('');
  const [compilerError, setCompilerError] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState(fallbackProblems[0].id);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [score, setScore] = useState<number | null>(null);
  const [passCount, setPassCount] = useState<number | null>(null);
  const [totalTests, setTotalTests] = useState<number | null>(null);

  const topicSheets = useMemo(() => {
    const sheets = Array.from(new Set(problems.map((problem) => problem.topic)));
    return ['All Sheets', ...sheets];
  }, [problems]);

  const filteredProblems = useMemo(() => {
    if (topicFilter === 'All Sheets') {
      return problems;
    }
    return problems.filter((problem) => problem.topic === topicFilter);
  }, [problems, topicFilter]);

  const selectedProblem = useMemo(
    () => filteredProblems.find((item) => item.id === selectedProblemId) ?? filteredProblems[0] ?? fallbackProblems[0],
    [filteredProblems, selectedProblemId]
  );

  useEffect(() => {
    const loadRuntimes = async () => {
      try {
        const response = await fetch('/api/code/languages');
        const json = (await response.json()) as { runtimes: RuntimeOption[] };
        const list = json.runtimes ?? [];

        if (list.length > 0) {
          setRuntimes(list);

          const preferred = list.find((item) => item.language === 'javascript') ?? list[0];
          setLanguage(preferred.language);
          setVersion(preferred.version);
          setCode(starterCode[preferred.language] ?? '// Start coding here');
        }
      } catch {
        setRuntimes([{ language: 'javascript', version: '18.15.0' }]);
      }
    };

    void loadRuntimes();
  }, []);

  useEffect(() => {
    const loadProblems = async () => {
      try {
        const response = await fetch('/api/code/problems');
        if (!response.ok) {
          throw new Error('Unable to load problems.');
        }

        const json = (await response.json()) as { problems: PracticeProblem[] };
        const list = json.problems?.length ? json.problems : fallbackProblems;
        setProblems(list);
        setSelectedProblemId(list[0].id);
        setStdin(list[0].sampleInput);
      } catch {
        setProblems(fallbackProblems);
      }
    };

    void loadProblems();
  }, []);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUserId(user?.uid);
      });

      return () => unsubscribe();
    } catch {
      setUserId(undefined);
    }
  }, []);

  useEffect(() => {
    if (filteredProblems.length === 0) {
      return;
    }

    const existsInFilter = filteredProblems.some((problem) => problem.id === selectedProblemId);
    if (!existsInFilter) {
      setSelectedProblemId(filteredProblems[0].id);
      setStdin(filteredProblems[0].sampleInput);
    }
  }, [filteredProblems, selectedProblemId]);

  const handleLanguageChange = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    const found = runtimes.find((item) => item.language === nextLanguage);
    if (found) {
      setVersion(found.version);
    }

    const template = starterCode[nextLanguage];
    if (template) {
      setCode(template);
    }
  };

  const runCode = async () => {
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setCompilerError('Please sign in to run and evaluate code.');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setCompilerError('');
    setAiFeedback('');
    setScore(null);
    setPassCount(null);
    setTotalTests(null);

    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          userId,
          problemId: selectedProblem.id,
          language,
          version,
          code,
          stdin,
          problemTitle: selectedProblem.title
        })
      });

      const data = (await response.json()) as {
        output?: string;
        error?: string;
        aiFeedback?: string;
        score?: number;
        passCount?: number;
        totalTests?: number;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Execution failed.');
      }

      setOutput(data.output || 'No output');
      setCompilerError(data.error || '');
      setAiFeedback(data.aiFeedback || 'No AI guidance available for this run.');
      setScore(typeof data.score === 'number' ? data.score : null);
      setPassCount(typeof data.passCount === 'number' ? data.passCount : null);
      setTotalTests(typeof data.totalTests === 'number' ? data.totalTests : null);
    } catch (error) {
      setCompilerError(error instanceof Error ? error.message : 'Something went wrong while running code.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Code Practice Lab</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Practice, compile, and get AI code guidance</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">Use any available programming runtime, solve practice problems, run your code, and get actionable AI feedback.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Topic sheet</span>
          <select
            value={topicFilter}
            onChange={(event) => setTopicFilter(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
          >
            {topicSheets.map((sheet) => (
              <option key={sheet} value={sheet} className="bg-slate-900">
                {sheet}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Problem</span>
          <select
            value={selectedProblemId}
            onChange={(event) => {
              const id = event.target.value;
              setSelectedProblemId(id);
              const problem = filteredProblems.find((item) => item.id === id);
              if (problem) {
                setStdin(problem.sampleInput);
              }
            }}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
          >
            {filteredProblems.map((problem) => (
              <option key={problem.id} value={problem.id} className="bg-slate-900">
                {problem.title} [{problem.difficulty}]
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2 xl:col-span-1">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Language</span>
          <select
            value={language}
            onChange={(event) => handleLanguageChange(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
          >
            {runtimes.map((item) => (
              <option key={`${item.language}-${item.version}`} value={item.language} className="bg-slate-900">
                {item.language} ({item.version})
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2 xl:col-span-1">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Version</span>
          <input
            value={version}
            onChange={(event) => setVersion(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
          />
        </label>

        <div className="flex items-end md:col-span-2 xl:col-span-1">
          <button
            type="button"
            onClick={runCode}
            disabled={isRunning || code.trim().length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Compiling...' : 'Compile and Run'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Problem statement</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1">Sheet: {selectedProblem.topic}</span>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1">Difficulty: {selectedProblem.difficulty}</span>
            </div>
            <p className="mt-3 text-sm text-slate-200">{selectedProblem.statement}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Sample input</p>
                <pre className="mt-1 whitespace-pre-wrap rounded-lg border border-white/10 bg-slate-900/80 p-2 text-xs text-slate-100">{selectedProblem.sampleInput}</pre>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Expected output</p>
                <pre className="mt-1 whitespace-pre-wrap rounded-lg border border-white/10 bg-slate-900/80 p-2 text-xs text-slate-100">{selectedProblem.expectedOutput}</pre>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                <Code2 className="h-4 w-4" />
                Code editor
              </h3>
            </div>
            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="mt-3 min-h-[320px] w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100 outline-none focus:border-cyan-400/60"
              spellCheck={false}
            />
          </article>

          <article className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Custom input (stdin)</h3>
            <textarea
              value={stdin}
              onChange={(event) => setStdin(event.target.value)}
              className="mt-3 min-h-[100px] w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100 outline-none focus:border-cyan-400/60"
              spellCheck={false}
            />
          </article>
        </div>

        <div className="space-y-4">
          <article className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
            <h3 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <TerminalSquare className="h-4 w-4" />
              Output
            </h3>
            {score !== null ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-cyan-100">Score: {score}%</span>
                <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-emerald-100">Hidden tests: {passCount ?? 0}/{totalTests ?? 0}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-slate-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {score === 100 ? 'Accepted' : 'Keep improving'}
                </span>
              </div>
            ) : null}
            <pre className="mt-3 min-h-[140px] whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-900/70 p-3 font-mono text-xs text-emerald-200">
              {output || 'Run your code to see output here.'}
            </pre>
          </article>

          <article className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-100">Compiler / runtime errors</h3>
            <pre className="mt-3 min-h-[110px] whitespace-pre-wrap rounded-xl border border-rose-300/20 bg-black/20 p-3 font-mono text-xs text-rose-100">
              {compilerError || 'No compiler/runtime errors.'}
            </pre>
          </article>

          <article className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">AI mentor guidance</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-emerald-50">
              {aiFeedback || 'Run code to receive AI guidance based on your solution.'}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
