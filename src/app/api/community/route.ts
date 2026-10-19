import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/local-db';
import { runInference } from '@/lib/inference';
import type { CommunityReply, CommunityThread } from '@/lib/types';

const INITIAL_THREADS: CommunityThread[] = [
  {
    id: 'thread-dsa-1',
    title: 'How to intuitively recognize when to use Two Pointers vs Sliding Window in placement rounds?',
    category: 'DSA & Coding',
    authorName: 'Rohan Sharma',
    authorCourse: 'Computer Science & Engineering',
    content: 'In interview questions, I sometimes get confused between two pointers (opposite ends) and sliding window (same direction). What is the exact mental model to differentiate them within 30 seconds of reading a problem?',
    upvotes: 42,
    tags: ['Two Pointers', 'Sliding Window', 'Placement Interview', 'Optimization'],
    createdAt: '2026-10-17T14:30:00Z',
    replies: [
      {
        id: 'reply-ai-1',
        authorName: 'GUIDELY AI Professor',
        isAiTeacher: true,
        content: `Great question! Here is the 30-second rule used by top competitive coders:

1. **Two Pointers (Opposite Ends)**:
• **Clue**: The input is **already sorted** or can be sorted, and you need to find a **pair/triplet** meeting a condition.
• **Example**: Two Sum II, 3Sum, Container With Most Water, Trapping Rain Water.
• **Movement**: Left advances if sum < target; Right decrements if sum > target.

2. **Sliding Window (Same Direction)**:
• **Clue**: The problem asks about a **contiguous subarray or substring** with a property (e.g. "longest", "shortest", "at most K distinct elements").
• **Example**: Longest Substring Without Repeating Characters, Minimum Window Substring.
• **Movement**: Right pointer always expands the window. Left pointer only contracts when the window condition is violated.

**Summary**: Pairs in sorted array = Two Pointers. Contiguous range with boundary constraints = Sliding Window!`,
        upvotes: 68,
        createdAt: '2026-10-17T14:31:00Z'
      }
    ]
  },
  {
    id: 'thread-web-2',
    title: 'When should you use useMemo and useCallback in React to prevent re-renders?',
    category: 'Web Development',
    authorName: 'Priya Patel',
    authorCourse: 'Information Technology',
    content: 'In frontend interviews, interviewers always ask if wrapping every function in useCallback is good practice. What are the actual performance trade-offs?',
    upvotes: 35,
    tags: ['React', 'useMemo', 'useCallback', 'Performance', 'Virtual DOM'],
    createdAt: '2026-10-16T18:20:00Z',
    replies: [
      {
        id: 'reply-ai-2',
        authorName: 'GUIDELY AI Professor',
        isAiTeacher: true,
        content: `Short answer: **Do NOT wrap every function in useCallback.**

Here is why:
1. **Memory & Comparison Overhead**: Creating the hook and dependency array comparison itself costs memory and CPU cycles on every render.
2. **When to use useCallback**:
• When passing a callback function as a prop to a child component optimized with \`React.memo\`.
• When the callback is in the dependency array of a \`useEffect\`.
3. **When to use useMemo**:
• For computationally expensive loops (e.g. filtering/sorting 5,000 items in memory).
• To preserve referential identity of non-primitive objects passed to child dependencies.

If your component is lightweight, standard inline functions are actually faster and cleaner!`,
        upvotes: 54,
        createdAt: '2026-10-16T18:22:00Z'
      }
    ]
  },
  {
    id: 'thread-core-3',
    title: 'Operating Systems: What really happens during a Page Fault at the hardware level?',
    category: 'Core CS',
    authorName: 'Aditya V.',
    authorCourse: 'Computer Science & Engineering',
    content: 'I know page faults mean the page is not in RAM, but what is the exact step-by-step interrupt sequence between CPU, MMU, OS kernel, and disk storage?',
    upvotes: 28,
    tags: ['Operating Systems', 'Paging', 'Virtual Memory', 'MMU', 'Kernel Interrupt'],
    createdAt: '2026-10-15T11:15:00Z',
    replies: [
      {
        id: 'reply-ai-3',
        authorName: 'GUIDELY AI Professor',
        isAiTeacher: true,
        content: `Here is the precise 6-step sequence interviewers love to hear:

1. **MMU Lookup**: CPU issues a virtual address. The MMU checks the Page Table. The "valid-invalid" bit is 0 (invalid/not in RAM).
2. **Hardware Trap (Interrupt)**: MMU raises a hardware page fault trap to the OS kernel.
3. **Save Process State**: CPU saves the current process registers and program counter into the PCB.
4. **Locate on Disk Swap**: OS checks the swap space to locate the missing page on physical disk.
5. **Disk I/O to Free Frame**: OS schedules disk I/O to read the page into an available physical frame (if RAM is full, an LRU page replacement runs first).
6. **Update Page Table & Restart Instruction**: OS marks the valid bit = 1, updates frame address in Page Table, and restarts the exact CPU instruction that faulted.`,
        upvotes: 49,
        createdAt: '2026-10-15T11:17:00Z'
      }
    ]
  }
];

export async function GET() {
  try {
    const db = readDatabase() as any;
    const threads: CommunityThread[] = Array.isArray(db.communityThreads) && db.communityThreads.length > 0
      ? db.communityThreads
      : INITIAL_THREADS;

    return NextResponse.json({ threads });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to query community threads.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, threadId, title, category, authorName, authorCourse, content, codeSnippet, tags = [] } = body;

    const db = readDatabase() as any;
    if (!Array.isArray(db.communityThreads) || db.communityThreads.length === 0) {
      db.communityThreads = [...INITIAL_THREADS];
    }

    // 1. UPVOTE THREAD
    if (action === 'upvote') {
      const thread = db.communityThreads.find((t: CommunityThread) => t.id === threadId);
      if (thread) {
        thread.upvotes += 1;
        writeDatabase(db);
        return NextResponse.json({ success: true, upvotes: thread.upvotes });
      }
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // 2. CREATE NEW THREAD & INSTANTLY GENERATE AI TEACHER RESPONSE
    if (action === 'create' || !action) {
      if (!title || !content || !authorName) {
        return NextResponse.json({ error: 'Title, content, and author name are required.' }, { status: 400 });
      }

      const newThreadId = `thread-${Date.now()}`;
      const replies: CommunityReply[] = [];

      // Generate instant verified AI Teacher response
      try {
        const prompt = `A computer science engineering student posted this technical placement question in the community forum:
Title: "${title}"
Category: "${category || 'DSA & Coding'}"
Question: "${content}"
${codeSnippet ? `Code Snippet:\n\`\`\`\n${codeSnippet}\n\`\`\`` : ''}

Provide a verified, comprehensive, crystal-clear, and authoritative response with step-by-step intuition, code where relevant, and placement interview tips.`;

        const systemPrompt = `You are GUIDELY AI Professor, an authoritative Senior Technical Architect and Educator. Write a helpful, encouraging, technically accurate response formatted in markdown.`;

        const aiResponse = await runInference(prompt, systemPrompt, 650);
        if (aiResponse && aiResponse.trim().length > 30) {
          replies.push({
            id: `reply-ai-${Date.now()}`,
            authorName: 'GUIDELY AI Professor',
            isAiTeacher: true,
            content: aiResponse.trim(),
            upvotes: 1,
            createdAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('AI Community reply failed:', err);
      }

      const newThread: CommunityThread = {
        id: newThreadId,
        title: title.trim(),
        category: category || 'DSA & Coding',
        authorName: authorName.trim(),
        authorCourse: authorCourse?.trim() || 'Computer Science & Engineering',
        content: content.trim(),
        codeSnippet: codeSnippet?.trim() || undefined,
        upvotes: 1,
        replies,
        tags: Array.isArray(tags) && tags.length > 0 ? tags : ['Placement Prep', 'Q&A'],
        createdAt: new Date().toISOString()
      };

      db.communityThreads.unshift(newThread);
      writeDatabase(db);

      return NextResponse.json({ success: true, thread: newThread });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Community server error.' },
      { status: 500 }
    );
  }
}
