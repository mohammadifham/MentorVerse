/**
 * MentorVerse AI Engine
 * 
 * Provides intelligent, domain-aware educational reasoning and generative AI
 * capabilities for teaching, mentoring, and code evaluation.
 * Seamlessly integrates cloud LLM inference when credentials exist, and
 * provides a deep built-in pedagogical knowledge engine otherwise.
 */

import { runInference } from './inference';

export interface ConceptKnowledge {
  topic: string;
  summary: string;
  analogy: string;
  details: string;
  keyQuestion: string;
  coreKeywords: string[];
}

const KNOWLEDGE_BASE: Record<string, ConceptKnowledge> = {
  'binary search': {
    topic: 'Binary Search',
    summary:
      'Binary Search is an efficient O(log n) search algorithm designed for sorted collections. Instead of inspecting each item sequentially, it repeatedly divides the search interval in half by comparing the target value against the middle element.',
    analogy:
      'Imagine finding a word in a physical dictionary: you flip directly to the middle, check if your target word comes alphabetically before or after that page, and immediately discard half of the book with each flip.',
    details:
      'The algorithm maintains two pointers, typically low and high, computing mid = low + Math.floor((high - low) / 2) to prevent arithmetic overflow. If target equals mid, the search succeeds; if target is smaller, the search continues in the left subarray (high = mid - 1); otherwise, it moves right (low = mid + 1).',
    keyQuestion:
      'Why does Binary Search require the data collection to be sorted beforehand, and what happens to the pointer boundary conditions when duplicate elements exist?',
    coreKeywords: ['sorted', 'divide', 'half', 'log n', 'middle', 'pointer', 'low', 'high', 'binary', 'search']
  },
  'recursion': {
    topic: 'Recursion',
    summary:
      'Recursion is a foundational programming technique where a function solves a complex problem by calling itself with smaller instances of the exact same problem until reaching a termination condition.',
    analogy:
      'Think of Russian nesting dolls (Matryoshka): to reach the tiny prize in the center, you open one outer doll at a time, each looking identical to the last but slightly smaller, until you hit the solid core.',
    details:
      'Every recursive function requires two core components: a base case that stops execution and prevents stack overflow, and a recursive step that reduces the problem size. Each recursive invocation creates a new frame on the call stack.',
    keyQuestion:
      'What is a call stack overflow in recursive programming, and how does tail-call optimization or memoization mitigate it?',
    coreKeywords: ['base case', 'call stack', 'function', 'self', 'subproblem', 'stack overflow', 'terminat']
  },
  'dynamic programming': {
    topic: 'Dynamic Programming',
    summary:
      'Dynamic Programming (DP) is an optimization technique that solves complex problems by breaking them down into simpler, overlapping subproblems and caching their results to avoid redundant computations.',
    analogy:
      'Imagine someone writes 1 + 1 + 1 + 1 on a chalkboard and asks what it equals (4). If they add another + 1 at the end, you do not recalculate from scratch—you remember it was 4, add 1, and instantly say 5.',
    details:
      'A problem is suitable for DP if it exhibits two key properties: optimal substructure and overlapping subproblems. Solutions can be implemented using top-down recursion with memoization, or bottom-up iterative tabulation.',
    keyQuestion:
      'How do you distinguish whether a problem should be solved using Greedy approach versus Dynamic Programming?',
    coreKeywords: ['memoization', 'tabulation', 'subproblem', 'overlapping', 'optimal', 'cache', 'state', 'transition']
  },
  'linked list': {
    topic: 'Linked List',
    summary:
      'A Linked List is a linear data structure where elements are not stored in contiguous memory locations. Instead, each node consists of data and a pointer reference directing to the next node in sequence.',
    analogy:
      'Picture a scavenger hunt or a treasure trail: each clue you find contains a message along with precise directions to where the next clue is hidden.',
    details:
      'Unlike standard arrays, linked lists allow efficient O(1) insertions and deletions once the target node position is reached, without needing array resizing or element shifting. However, indexing takes O(n) time.',
    keyQuestion:
      'How does Floyd’s Cycle Detection algorithm (Tortoise and Hare) identify a loop in a linked list using two pointers?',
    coreKeywords: ['node', 'pointer', 'next', 'head', 'memory', 'insert', 'traverse', 'cycle', 'contiguous']
  },
  'tree': {
    topic: 'Tree Data Structures',
    summary:
      'A Tree is a hierarchical non-linear data structure consisting of nodes connected by edges, starting from a single root node with no cycles.',
    analogy:
      'Consider a family tree or an organizational chart at a company: the CEO sits at the root, department managers branch downward, and individual contributors form leaf nodes.',
    details:
      'Common tree variations include Binary Search Trees (BST), AVL Trees, and Red-Black Trees. Traversal algorithms include Depth-First Search (Pre-order, In-order, Post-order) and Breadth-First Search (Level-order).',
    keyQuestion:
      'What makes a self-balancing binary search tree (like an AVL or Red-Black tree) maintain O(log n) lookups compared to a degenerated unbalanced BST?',
    coreKeywords: ['root', 'child', 'leaf', 'subtree', 'height', 'traversal', 'depth', 'balance', 'node', 'hierarchy']
  },
  'graph': {
    topic: 'Graph Algorithms',
    summary:
      'A Graph is a versatile data structure composed of a finite set of vertices (or nodes) interconnected by edges, representing pairwise relationships.',
    analogy:
      'Think of flight routes connecting cities or social networks where people are vertices and friendships are edges linking them together.',
    details:
      'Graphs can be directed or undirected, weighted or unweighted. Foundational traversal algorithms include Breadth-First Search (BFS) for shortest paths in unweighted graphs and Depth-First Search (DFS) for cycle detection and topological sorting.',
    keyQuestion:
      'When would you choose Dijkstra’s algorithm over Breadth-First Search (BFS) for finding shortest paths, and what are Dijkstra’s limitations with negative edge weights?',
    coreKeywords: ['vertex', 'edge', 'bfs', 'dfs', 'adjacency', 'dijkstra', 'cycle', 'path', 'shortest']
  },
  'hash table': {
    topic: 'Hash Table / Hash Map',
    summary:
      'A Hash Table is an associative data structure that maps unique keys to values using a mathematical hash function, providing average O(1) time complexity for lookup, insertion, and deletion.',
    analogy:
      'Think of a coat check at an auditorium: you hand over your jacket, receive a numbered ticket token, and later retrieve your exact jacket in seconds without searching through the entire coat rack.',
    details:
      'A good hash function distributes keys uniformly across internal buckets. Collision resolution strategies typically include Separate Chaining (linked lists or balanced trees per bucket) or Open Addressing (linear probing, quadratic probing).',
    keyQuestion:
      'What happens to a Hash Table when many keys collide on the same hash bucket, and how does dynamic resizing (rehashing) restore average O(1) performance?',
    coreKeywords: ['hash', 'bucket', 'collision', 'key', 'value', 'lookup', 'o(1)', 'chaining', 'probing']
  },
  'rest api': {
    topic: 'RESTful APIs',
    summary:
      'REST (Representational State Transfer) is an architectural style for designing networked applications that use standard stateless HTTP methods to perform operations on resources identified by URIs.',
    analogy:
      'Imagine ordering food at a restaurant counter: you read the menu (GET), submit an order slip (POST), update your drink choice (PUT/PATCH), or cancel the order (DELETE), while the kitchen operates statelessly.',
    details:
      'Key REST constraints include statelessness, client-server separation, uniform interface, and cacheability. Standard HTTP status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error) communicate outcome states.',
    keyQuestion:
      'What is the architectural difference between PUT and PATCH when updating a resource, and why is idempotency important in distributed systems?',
    coreKeywords: ['http', 'get', 'post', 'put', 'delete', 'stateless', 'resource', 'endpoint', 'json', 'status code']
  },
  'react': {
    topic: 'React & Component Architecture',
    summary:
      'React is a declarative, component-based frontend library for building modern user interfaces using reusable components, stateful hooks, and a Virtual DOM reconciliation engine.',
    analogy:
      'Think of building structures with LEGO bricks: each brick is a self-contained component with its own shape and purpose, and you compose them together to build complex, responsive castles.',
    details:
      'React handles UI updates through unidirectional data flow, component state (useState, useReducer), and side-effects (useEffect). The reconciliation algorithm (Fiber) compares virtual DOM trees to compute minimal real DOM mutations.',
    keyQuestion:
      'Why should you never mutate React state directly, and how does immutability enable React’s shallow comparison and re-rendering optimizations?',
    coreKeywords: ['component', 'state', 'props', 'hook', 'virtual dom', 'render', 'lifecycle', 'effect', 'jsx']
  },
  'database index': {
    topic: 'Database Indexing',
    summary:
      'A Database Index is a data structure (commonly a B-Tree or B+Tree) that significantly improves the speed of data retrieval operations on database tables at the cost of additional storage and slower write times.',
    analogy:
      'Imagine reading a 1,000-page textbook without an index in the back: finding every mention of "Distributed Systems" would require scanning every page. The index lists the exact page numbers instantly.',
    details:
      'Indexes avoid full table scans by organizing column values in sorted, tree-based leaf pages. While SELECT queries with filtering (WHERE, JOIN, ORDER BY) accelerate dramatically, INSERT, UPDATE, and DELETE operations must maintain the index trees.',
    keyQuestion:
      'Why does adding too many indexes to a database table degrade write performance, and how do composite indexes depend on the leftmost prefix rule?',
    coreKeywords: ['index', 'b-tree', 'scan', 'query', 'performance', 'lookup', 'table', 'write', 'select', 'cost']
  }
};

function normalizeTopicString(topic: string): string {
  return topic.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

function findMatchingKnowledge(rawTopic: string): ConceptKnowledge | null {
  const normalized = normalizeTopicString(rawTopic);
  for (const [key, value] of Object.entries(KNOWLEDGE_BASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  return null;
}

function generateDynamicKnowledge(topic: string): ConceptKnowledge {
  const cleanTopic = topic.trim();
  return {
    topic: cleanTopic,
    summary: `${cleanTopic} is a core technical concept that empowers developers to build structured, reliable, and scalable software solutions. Understanding its fundamental principles, syntax patterns, and underlying operational mechanics is essential for technical mastery.`,
    analogy: `Think of ${cleanTopic} like an engineered modular component in a modern vehicle: each individual subsystem has clear input-output contracts, and when integrated properly, the entire architecture functions with efficiency and predictability.`,
    details: `When implementing ${cleanTopic}, pay close attention to input validation, state transitions, runtime complexity trade-offs, and edge case handling. Adhering to clean coding practices and modular design makes solutions straightforward to test, debug, and maintain.`,
    keyQuestion: `How would you explain the core operational flow of ${cleanTopic} to a peer, and what is one common mistake or edge case engineers must watch out for?`,
    coreKeywords: cleanTopic.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
  };
}

export async function generateIntelligentExplanation(topic: string): Promise<string> {
  const knowledge = findMatchingKnowledge(topic) ?? generateDynamicKnowledge(topic);
  return `${knowledge.summary}\n\n${knowledge.analogy} ${knowledge.details}`;
}

export async function generateIntelligentQuestion(topic: string): Promise<string> {
  const knowledge = findMatchingKnowledge(topic) ?? generateDynamicKnowledge(topic);
  return knowledge.keyQuestion;
}

export async function generateIntelligentMentorFeedback(input: {
  topic: string;
  confidence: number;
  level: string;
  answer?: string;
}): Promise<string> {
  const answer = input.answer?.trim() ?? '';
  const knowledge = findMatchingKnowledge(input.topic) ?? generateDynamicKnowledge(input.topic);

  if (!answer) {
    return `To get personalized feedback on ${knowledge.topic}, share your understanding or outline the steps in your own words. Focus on how it works and where you would apply it!`;
  }

  const answerLower = answer.toLowerCase();
  const matchedKeywords = knowledge.coreKeywords.filter((kw) => answerLower.includes(kw));
  const keywordRatio = knowledge.coreKeywords.length > 0 ? matchedKeywords.length / knowledge.coreKeywords.length : 0;

  if (keywordRatio >= 0.4 || input.confidence >= 0.7) {
    return `Outstanding explanation! You clearly grasped the core mechanisms of ${knowledge.topic}, especially regarding ${matchedKeywords.slice(0, 3).join(', ') || 'its foundational concepts'}. To push your understanding further, consider analyzing how edge cases, concurrency, or scale affect this pattern in production systems.`;
  }

  if (keywordRatio > 0.15 || input.confidence >= 0.45) {
    return `Solid effort! You demonstrated a good initial intuition for ${knowledge.topic}. To strengthen your answer, make sure to explicitly connect the key mechanics (${knowledge.coreKeywords.slice(0, 3).join(', ')}) with why this pattern is chosen over simpler alternatives. Keep building on this momentum!`;
  }

  return `Good try! You touched upon the question, but your explanation could be clearer regarding ${knowledge.topic}. Review the definition and try structuring your response with: 1) What it is, 2) Why we use it, and 3) A short concrete example. Give it another shot!`;
}

export async function generateIntelligentCodeGuidance(input: {
  problemTitle: string;
  language: string;
  code: string;
  passed: boolean;
  score: number;
  passCount: number;
  totalTests: number;
  compilerError?: string;
  firstFailed?: { input: string; expected: string; actual: string };
}): Promise<string> {
  if (input.passed) {
    return `Excellent job! All ${input.totalTests} test cases passed (Score: 100%). Your ${input.language} solution is clean, robust, and handles both standard and edge inputs effectively. Consider reviewing the time and space complexity to see if further memory or execution optimizations are possible!`;
  }

  if (input.compilerError) {
    const errorSnippet = input.compilerError.split('\n')[0] || 'Syntax/Type Error';
    return `Compiler/Runtime Diagnostic:
1. Issue: Your ${input.language} program encountered an execution error: "${errorSnippet}".
2. Likely Cause: Check for missing brackets, incorrect variable names, or unhandled null/undefined values.
3. Next Step: Test your logic locally with minimal inputs and verify correct I/O parsing.`;
  }

  if (input.firstFailed) {
    return `Test Evaluation Feedback (${input.passCount}/${input.totalTests} passed, Score: ${input.score}%):
1. Discrepancy: For input "${input.firstFailed.input}", expected "${input.firstFailed.expected}" but received "${input.firstFailed.actual || 'empty'}".
2. Likely Cause: Check edge cases such as empty inputs, negative numbers, or off-by-one index boundaries.
3. Fix: Review where your output differs and adjust conditional branches accordingly.`;
  }

  return `Feedback: Your solution passed ${input.passCount} of ${input.totalTests} tests. Double check your boundary conditions and ensure your output formatting strictly matches expected results.`;
}

/**
 * Universal text generation gateway
 * Tries cloud inference if tokens exist; otherwise falls back gracefully to domain engine
 */
export async function generateContent(
  prompt: string,
  options?: { systemPrompt?: string; maxNewTokens?: number }
): Promise<string> {
  // If HF_TOKEN or OPENAI_API_KEY is configured, try cloud LLM inference first
  if (process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || process.env.OPENAI_API_KEY) {
    try {
      const result = await runInference(
        prompt,
        options?.systemPrompt,
        options?.maxNewTokens ?? 220
      );
      if (result && result.trim().length > 0) {
        return result.trim();
      }
    } catch (err) {
      console.warn('Cloud inference call unsuccessful, using MentorVerse domain AI engine:', err);
    }
  }

  // Domain reasoning engine
  if (/Explain\s+(.+?)\s+in a clear/i.test(prompt)) {
    const match = prompt.match(/Explain\s+(.+?)\s+in a clear/i);
    const topic = match?.[1] || 'Technical Concepts';
    return generateIntelligentExplanation(topic);
  }

  if (/practice question about\s+(.+?)\./i.test(prompt)) {
    const match = prompt.match(/practice question about\s+(.+?)\./i);
    const topic = match?.[1] || 'this topic';
    return generateIntelligentQuestion(topic);
  }

  if (/feedback/i.test(prompt) || /mentor/i.test(prompt)) {
    const topicMatch = prompt.match(/learning\s+([^.]+)/i);
    const topic = topicMatch?.[1] || 'this subject';
    return generateIntelligentMentorFeedback({
      topic,
      confidence: 0.65,
      level: 'medium'
    });
  }

  return generateIntelligentExplanation('Software Engineering & Core CS Fundamentals');
}
