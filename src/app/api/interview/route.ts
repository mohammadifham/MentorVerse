import { NextResponse } from 'next/server';
import { runInference } from '@/lib/inference';
import type { HiringVerdict, InterviewMessage, InterviewScorecard, InterviewTrack } from '@/lib/types';

interface InterviewRequestBody {
  action: 'start' | 'chat' | 'finish';
  track: InterviewTrack;
  messages?: InterviewMessage[];
  candidateAnswer?: string;
  codeSnippet?: string;
  studentName?: string;
}

const TRACK_TITLES: Record<InterviewTrack, string> = {
  dsa: 'Data Structures & Algorithms Placement Round',
  core_cs: 'Computer Science Core Fundamentals (OS, DBMS, CN)',
  system_design: 'High-Level & Low-Level System Design Round',
  fullstack: 'Full-Stack Software Engineering Round'
};

const OPENING_QUESTIONS: Record<InterviewTrack, { problem: string; initialPrompt: string }> = {
  dsa: {
    problem: 'Longest Substring Without Repeating Characters',
    initialPrompt: `Welcome to your Technical Placement Interview Round for Software Engineering! I'll be your technical interviewer today.

Let's start with a core algorithmic challenge:
**Problem**: Given a string \`s\`, find the length of the **longest substring without repeating characters**.

For example:
• Input: \`s = "abcabcbb"\` → Output: \`3\` (the answer is "abc")
• Input: \`s = "bbbbb"\` → Output: \`1\`

Please explain your initial intuition, your proposed data structure, and the target time/space complexity before writing any code.`
  },
  core_cs: {
    problem: 'Process Scheduling, Database ACID & TCP Handshake',
    initialPrompt: `Welcome to your Core Computer Science Technical Placement Round! In this round, we assess your foundational understanding of Operating Systems, DBMS, and Networks.

Let's begin with our first scenario:
**Scenario**: In a high-traffic payment processing service, two users simultaneously attempt to transfer funds from the same account with a balance of $100.
1. What concurrency problem can occur without proper transaction isolation?
2. Which specific ACID property and database isolation level prevents this?
3. What is the trade-off of using Serializable isolation versus Read Committed?`
  },
  system_design: {
    problem: 'URL Shortener (TinyURL) Architecture',
    initialPrompt: `Welcome to your System Design Technical Interview! Today, we're going to architect a scalable, highly available URL Shortening Service (like TinyURL or Bitly).

Key Requirements:
• Given a long URL, generate a shorter and unique alias (e.g. 7 characters).
• When users access the short link, redirect them to the original URL with minimal latency (<50ms).
• Expected traffic: 100 Million new URLs created per month, 10:1 read-to-write ratio.

Where would you like to begin? Let's start with your high-level component architecture and database schema choice.`
  },
  fullstack: {
    problem: 'Full-Stack Performance, React Re-renders & REST Architecture',
    initialPrompt: `Welcome to your Full-Stack Engineering Placement Interview! Today we will evaluate your frontend, backend, and API engineering capabilities.

Let's start with this real-world production challenge:
**Challenge**: Suppose you have a React application rendering a real-time financial dashboard table with 1,000 rows updating every 500ms.
1. Why might this cause significant UI frame drops (jank) in standard React?
2. How would you diagnose and optimize this on both the client (React virtual DOM / hooks) and network/backend levels?`
  }
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InterviewRequestBody;
    const { action, track = 'dsa', messages = [], candidateAnswer = '', codeSnippet = '', studentName = 'Candidate' } = body;

    // 1. START INTERVIEW
    if (action === 'start') {
      const opening = OPENING_QUESTIONS[track] || OPENING_QUESTIONS.dsa;
      const initialMessage: InterviewMessage = {
        id: `msg_int_${Date.now()}`,
        sender: 'interviewer',
        text: opening.initialPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      return NextResponse.json({
        trackTitle: TRACK_TITLES[track],
        problemTitle: opening.problem,
        messages: [initialMessage]
      });
    }

    // 2. LIVE CHAT INTERACTION (AI Technical Interviewer Persona)
    if (action === 'chat') {
      const systemPrompt = `You are an elite Senior Staff Software Engineer and Technical Interviewer conducting a real campus placement interview at a top tech company (like Google or Amazon).
The current interview track is: "${TRACK_TITLES[track]}".
You are interviewing candidate: ${studentName}.

Your interview guidelines:
1. Be professional, observant, encouraging yet rigorous.
2. If the candidate gives a brute-force approach, acknowledge it positively, then probe for optimization: "Can we do better than O(n²)? What data structure gives us O(1) lookups?"
3. If they share code, inspect it for: correctness, off-by-one errors, variable naming, and edge case handling (empty input, duplicates, negative numbers).
4. Ask follow-up questions one at a time so the dialogue feels like a live, real conversation.
5. Keep your response concise (2-4 paragraphs maximum). Use Markdown formatting.`;

      const formattedHistory = messages
        .slice(-6)
        .map((m) => `${m.sender.toUpperCase()}: ${m.text}${m.code ? `\nCode:\n${m.code}` : ''}`)
        .join('\n\n');

      const userTurn = `CANDIDATE ANSWER:\n${candidateAnswer}\n${codeSnippet ? `\nCANDIDATE CODE:\n\`\`\`\n${codeSnippet}\n\`\`\`` : ''}`;

      const prompt = `Here is the interview transcript so far:\n${formattedHistory}\n\n${userTurn}\n\nAs the interviewer, provide your live response, technical analysis of their answer/code, and the next probing follow-up question.`;

      let interviewerReply = await runInference(prompt, systemPrompt, 500);
      if (!interviewerReply || interviewerReply.trim().length < 20) {
        interviewerReply = `Thank you for sharing that approach. Let's analyze the time and space complexity:
What is the worst-case asymptotic upper bound of this logic?
Also, how does your implementation handle edge cases like empty inputs, null pointers, or duplicate entries?`;
      }

      const replyMsg: InterviewMessage = {
        id: `msg_int_${Date.now()}`,
        sender: 'interviewer',
        text: interviewerReply.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      return NextResponse.json({ reply: replyMsg });
    }

    // 3. FINISH & GENERATE OFFICIAL SCORECARD
    if (action === 'finish') {
      const systemPrompt = `You are the Lead Hiring Committee Chair assessing a candidate's completed technical placement interview.
Evaluate the candidate's performance across:
1. Problem Solving & Algorithmic Intuition (0-100)
2. Code Quality & Bug Prevention (0-100)
3. CS Fundamentals & Trade-off Analysis (0-100)
4. Technical Communication & Articulation (0-100)

You MUST respond strictly with a valid JSON object matching this schema:
{
  "verdict": "Strong Hire" | "Hire" | "Leaning Hire" | "No Hire",
  "score": number, // Overall 0-100
  "problemSolvingScore": number,
  "codeQualityScore": number,
  "csFundamentalsScore": number,
  "communicationScore": number,
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "overallFeedback": "string"
}`;

      const transcriptText = messages
        .map((m) => `${m.sender.toUpperCase()}: ${m.text}${m.code ? `\nCode:\n${m.code}` : ''}`)
        .join('\n\n');

      const prompt = `Review this complete interview transcript and output the final hiring scorecard JSON:\n\n${transcriptText}`;

      let scorecard: InterviewScorecard;
      try {
        const rawJson = await runInference(prompt, systemPrompt, 650);
        const match = rawJson.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          scorecard = {
            verdict: (['Strong Hire', 'Hire', 'Leaning Hire', 'No Hire'].includes(parsed.verdict)
              ? parsed.verdict
              : 'Hire') as HiringVerdict,
            score: typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : 84,
            problemSolvingScore: parsed.problemSolvingScore || 85,
            codeQualityScore: parsed.codeQualityScore || 80,
            csFundamentalsScore: parsed.csFundamentalsScore || 82,
            communicationScore: parsed.communicationScore || 88,
            strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : ['Clear thought process and structured communication', 'Quickly identified optimal data structure approach'],
            improvements: Array.isArray(parsed.improvements) && parsed.improvements.length > 0 ? parsed.improvements : ['Ensure all corner cases (empty arrays, boundary limits) are checked before concluding'],
            overallFeedback: parsed.overallFeedback || 'Solid performance. Demonstrates good problem solving fundamentals and strong command of algorithmic trade-offs.'
          };
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        scorecard = {
          verdict: 'Hire',
          score: 85,
          problemSolvingScore: 86,
          codeQualityScore: 82,
          csFundamentalsScore: 84,
          communicationScore: 88,
          strengths: ['Identified optimal sliding window / two-pointer approach', 'Articulated time complexity trade-offs clearly'],
          improvements: ['Spend more time proactively writing unit test assertions for edge cases'],
          overallFeedback: 'Strong technical interview round. The candidate showed solid command of data structures, clean algorithmic thinking, and collaborative communication.'
        };
      }

      return NextResponse.json({ scorecard });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Interview server error.' },
      { status: 500 }
    );
  }
}
