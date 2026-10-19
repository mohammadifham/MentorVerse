import type { CheatSheetSection } from '@/lib/types';

export const PLACEMENT_CHEAT_SHEETS: CheatSheetSection[] = [
  // 1. Top 75 DSA Patterns
  {
    id: 'dsa-two-pointers',
    title: 'Two Pointers (Opposite & Same Direction)',
    category: 'Top 75 DSA Patterns',
    summary: 'Using two pointers to reduce an O(n²) search space to O(n) on sorted arrays or sequences.',
    keyPoints: [
      'Opposite Direction: Left at 0, Right at n-1. Move inwards based on target comparison (e.g. Two Sum Sorted, 3Sum, Container With Most Water).',
      'Same Direction (Fast & Slow): Fast scans ahead while Slow maintains unique elements or finds middle of linked list.',
      'Saves memory by operating completely in-place with O(1) auxiliary space.'
    ],
    codeSnippet: {
      language: 'python',
      code: `def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        curr_sum = arr[left] + arr[right]
        if curr_sum == target:
            return [left, right]
        elif curr_sum < target:
            left += 1
        else:
            right -= 1
    return []`
    },
    complexity: { time: 'O(n)', space: 'O(1)' },
    interviewTip: 'Always check if the input array is already sorted or if sorting it first (O(n log n)) unlocks the two-pointer technique.'
  },
  {
    id: 'dsa-sliding-window',
    title: 'Sliding Window (Fixed & Dynamic)',
    category: 'Top 75 DSA Patterns',
    summary: 'Maintains a subset of contiguous elements as window boundaries expand and contract.',
    keyPoints: [
      'Fixed Window: Keep window size K constant. Add incoming element at right, subtract outgoing element at left.',
      'Dynamic Window: Expand right pointer until condition is violated, then shrink left pointer until valid again.',
      'Ideal for "Longest Substring Without Repeating Characters", "Minimum Size Subarray Sum", and "Fruit Into Baskets".'
    ],
    codeSnippet: {
      language: 'javascript',
      code: `function lengthOfLongestSubstring(s) {
  let seen = new Map();
  let maxLen = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (seen.has(char) && seen.get(char) >= left) {
      left = seen.get(char) + 1;
    }
    seen.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`
    },
    complexity: { time: 'O(n)', space: 'O(min(n, m))' },
    interviewTip: 'Whenever asked for "contiguous subarray/substring with maximum/minimum/longest condition", immediately think Sliding Window.'
  },
  {
    id: 'dsa-monotonic-stack',
    title: 'Monotonic Stack (Next Greater / Smaller Element)',
    category: 'Top 75 DSA Patterns',
    summary: 'A stack that maintains elements in strictly increasing or decreasing order to find nearest bounds in O(n).',
    keyPoints: [
      'Monotonic Decreasing: Elements decrease from bottom to top. Used to find Next Greater Element.',
      'Monotonic Increasing: Elements increase from bottom to top. Used for Daily Temperatures and Largest Rectangle in Histogram.',
      'Every element is pushed and popped at most once, making amortized time O(n).'
    ],
    codeSnippet: {
      language: 'python',
      code: `def next_greater_element(nums):
    res = [-1] * len(nums)
    stack = []  # stores indices
    for i, val in enumerate(nums):
        while stack and nums[stack[-1]] < val:
            prev_idx = stack.pop()
            res[prev_idx] = val
        stack.append(i)
    return res`
    },
    complexity: { time: 'O(n)', space: 'O(n)' },
    interviewTip: 'Crucial for Tier-1 interview questions: Largest Rectangle in Histogram, Trapping Rain Water, and Stock Spanner.'
  },
  {
    id: 'dsa-dp-knapsack',
    title: '0/1 Knapsack & Subset Sum Pattern',
    category: 'Top 75 DSA Patterns',
    summary: 'Decision tree where at each element we decide whether to pick or leave, maximizing value within constraint W.',
    keyPoints: [
      'State definition: dp[i][w] = max value considering first i items with remaining capacity w.',
      'Recurrence: dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]]) if wt[i-1] <= w else dp[i-1][w].',
      'Space optimization: Reduce 2D table to 1D array by iterating weight backwards from W down to wt[i].'
    ],
    codeSnippet: {
      language: 'python',
      code: `def knapsack_01(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for wt, val in zip(weights, values):
        for w in range(capacity, wt - 1, -1):
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[capacity]`
    },
    complexity: { time: 'O(n * W)', space: 'O(W)' },
    interviewTip: 'Subset Sum, Partition Equal Subset Sum, and Target Sum are all exact variations of 0/1 Knapsack.'
  },

  // 2. Operating Systems (OS)
  {
    id: 'os-process-vs-thread',
    title: 'Process vs Thread & Context Switching',
    category: 'Operating Systems',
    summary: 'Fundamental difference in memory isolation, execution units, and switching overhead.',
    keyPoints: [
      'Process: Program in execution with its own independent address space (Text, Data, Heap, Stack). Heavyweight context switch.',
      'Thread: Lightweight entity within a process. Shares Text, Data, and Heap with other threads of the same process, but possesses its own Register set and Stack.',
      'Context Switch: Saving state of current process/thread in PCB (Process Control Block) or TCB and loading next scheduled entity into CPU registers.'
    ],
    interviewTip: 'When asked why threads are preferred over processes for servers: lower creation overhead, faster context switching, and easier shared-memory communication.'
  },
  {
    id: 'os-deadlocks-handling',
    title: 'Deadlock Conditions & Prevention (Coffman Conditions)',
    category: 'Operating Systems',
    summary: 'A state where a set of processes are blocked because each process is holding a resource and waiting for another.',
    keyPoints: [
      '4 Necessary Conditions (Coffman): 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait.',
      'Deadlock Prevention: Invalidate at least one of the 4 conditions (e.g. impose total ordering on all resources to prevent Circular Wait).',
      'Deadlock Avoidance: Banker\'s Algorithm evaluates safe states before granting allocations.'
    ],
    interviewTip: 'State the 4 Coffman conditions crisply in interviews, then mention Banker\'s Algorithm for avoidance.'
  },
  {
    id: 'os-virtual-memory-paging',
    title: 'Virtual Memory, Paging & Page Faults',
    category: 'Operating Systems',
    summary: 'Memory management scheme allowing processes to execute without being completely placed in contiguous physical RAM.',
    keyPoints: [
      'Paging: Virtual address space split into fixed-size "Pages", physical memory divided into "Frames".',
      'MMU & Page Table: Hardware translates virtual address to physical address via Page Table; TLB (Translation Lookaside Buffer) caches recent translations.',
      'Page Fault: Hardware interrupt triggered when accessed page is not in physical RAM, causing OS to load it from disk swap space.',
      'Thrashing: Occurs when high page fault rate leads to CPU spending more time swapping pages than executing instructions.'
    ],
    interviewTip: 'Be prepared to explain LRU (Least Recently Used) page replacement algorithm and how TLB reduces memory access penalty.'
  },

  // 3. DBMS & SQL
  {
    id: 'dbms-acid-properties',
    title: 'ACID Properties in Relational Databases',
    category: 'DBMS & SQL',
    summary: 'Guarantees that database transactions are processed reliably.',
    keyPoints: [
      'Atomicity: "All or nothing" — transaction executes completely or rolls back entirely.',
      'Consistency: Data transitions only from one valid state to another, maintaining all schema constraints and foreign keys.',
      'Isolation: Concurrent transactions execute independently without interfering (Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable).',
      'Durability: Committed transactions persist permanently in non-volatile storage, even in the event of power outage or system crash (via WAL - Write-Ahead Logging).'
    ],
    interviewTip: 'Understand the phenomena prevented at each isolation level: Dirty Reads, Non-Repeatable Reads, and Phantom Reads.'
  },
  {
    id: 'dbms-indexes-b-trees',
    title: 'Database Indexing: B-Trees & Hash Indexes',
    category: 'DBMS & SQL',
    summary: 'Auxiliary data structures that speed up query search performance from O(N) linear scan to O(log N).',
    keyPoints: [
      'B+ Tree Index: Balanced N-ary search tree where all data/row pointers reside in leaf nodes, linked sequentially for ultra-fast range queries.',
      'Clustered Index: Determines the physical storage order of rows in a table (Primary Key default). Only 1 per table.',
      'Non-Clustered (Secondary) Index: Separate structure containing indexed column values and a pointer back to the actual row.',
      'Trade-off: Drastically speeds up SELECT/WHERE queries, but adds write overhead on INSERT, UPDATE, and DELETE.'
    ],
    interviewTip: 'Explain why B+ Trees are preferred over Binary Search Trees or Hash Tables: high fan-out minimizes slow disk I/O, and linked leaves make range scans O(k).'
  },
  {
    id: 'dbms-normalization',
    title: 'Database Normalization (1NF to BCNF)',
    category: 'DBMS & SQL',
    summary: 'Systematic approach of organizing fields and tables to minimize redundancy and prevent insertion, update, and deletion anomalies.',
    keyPoints: [
      '1NF (First Normal Form): Atomic values (no repeating groups or multi-valued attributes), unique rows with primary key.',
      '2NF (Second Normal Form): Must be in 1NF + No partial dependency (every non-key attribute fully dependent on whole primary key).',
      '3NF (Third Normal Form): Must be in 2NF + No transitive dependency (non-key attribute depending on another non-key attribute).',
      'BCNF (Boyce-Codd Normal Form): Strict 3NF where for every functional dependency X -> Y, X must be a candidate key.'
    ],
    interviewTip: 'Discuss the trade-off: Denormalization is often applied in analytics/data warehousing (OLAP) to avoid expensive multi-table JOINs.'
  },

  // 4. Computer Networks
  {
    id: 'cn-osi-vs-tcpip',
    title: 'OSI 7-Layer vs TCP/IP 4-Layer Model',
    category: 'Computer Networks',
    summary: 'Architectural reference frameworks for end-to-end network communication.',
    keyPoints: [
      'OSI 7 Layers: Physical (1) -> Data Link (2) -> Network (3) -> Transport (4) -> Session (5) -> Presentation (6) -> Application (7).',
      'TCP/IP 4 Layers: Network Interface -> Internet (IP, ICMP) -> Transport (TCP, UDP) -> Application (HTTP, DNS, SSH, TLS).',
      'Layer 3 (Network): Host-to-host packet routing using IP addresses (Routers operate here).',
      'Layer 4 (Transport): Process-to-process communication using port numbers (TCP for reliability, UDP for low latency).'
    ],
    interviewTip: 'Remember the memory device for OSI: "Please Do Not Throw Sausage Pizza Away" (Physical to Application).'
  },
  {
    id: 'cn-tcp-handshake',
    title: 'TCP 3-Way Handshake & 4-Way Teardown',
    category: 'Computer Networks',
    summary: 'Connection establishment and termination protocol guaranteeing reliable, ordered packet delivery.',
    keyPoints: [
      '3-Way Handshake: 1. Client sends SYN (seq=x) -> 2. Server replies SYN-ACK (seq=y, ack=x+1) -> 3. Client sends ACK (seq=x+1, ack=y+1).',
      'Connection established: Both sides have verified that their transmitter and receiver are operational and agreed on initial sequence numbers (ISN).',
      '4-Way Teardown: FIN -> ACK -> FIN -> ACK. Client enters TIME_WAIT state (2*MSL) to ensure final ACK was received by server.'
    ],
    interviewTip: 'When asked why 2 handshakes are not enough: prevents old duplicate connection requests from erroneously opening ghost sessions on the server.'
  },
  {
    id: 'cn-http-evolution',
    title: 'HTTP Evolution: HTTP/1.1 vs HTTP/2 vs HTTP/3',
    category: 'Computer Networks',
    summary: 'How web transfer protocols evolved to eliminate network latency and Head-of-Line (HoL) blocking.',
    keyPoints: [
      'HTTP/1.1: Persistent TCP connections and pipelining, but suffers from Head-of-Line blocking (subsequent requests queued if first is slow).',
      'HTTP/2: Binary protocol with Multiplexing over a single TCP connection, HPACK header compression, and Server Push. Still suffers from TCP-level packet loss stall.',
      'HTTP/3: Built on QUIC (Quick UDP Internet Connections). Completely eliminates TCP HoL blocking, incorporates zero-round-trip time (0-RTT) resumption, and switches networks seamlessly without reconnecting.'
    ],
    interviewTip: 'Crucial for modern full-stack and web infrastructure interview questions.'
  },

  // 5. System Design Core
  {
    id: 'sd-caching-patterns',
    title: 'Caching Strategies & Cache Invalidation',
    category: 'System Design',
    summary: 'Storing frequently accessed data in ultra-fast in-memory stores (Redis / Memcached) to reduce DB load.',
    keyPoints: [
      'Cache-Aside (Lazy Loading): App checks cache first; if miss, loads from DB and updates cache. (Safe, but initial cache miss latency).',
      'Write-Through: App writes data to cache, and cache synchronously updates DB before acknowledging. (Consistent, higher write latency).',
      'Write-Back (Write-Behind): App writes to cache, which asynchronously batches writes to DB. (Ultra fast, risk of data loss if cache dies).',
      'Eviction Policies: LRU (Least Recently Used), LFU (Least Frequently Used), FIFO.'
    ],
    interviewTip: 'Cite Phil Karlton\'s famous quote: "There are only two hard things in Computer Science: cache invalidation and naming things."'
  },
  {
    id: 'sd-load-balancing-scaling',
    title: 'Horizontal Scaling vs Vertical Scaling & Load Balancing',
    category: 'System Design',
    summary: 'Architecting systems to handle increasing traffic loads without single points of failure.',
    keyPoints: [
      'Vertical Scaling (Scale Up): Adding CPU/RAM/SSD to a single machine. Hard hardware ceiling and single point of failure (SPOF).',
      'Horizontal Scaling (Scale Out): Adding multiple commodity compute nodes. Infinite scalability, fault tolerant.',
      'Load Balancers: Reverse proxies distributing incoming client requests across pool of servers (Nginx, HAProxy, AWS ALB).',
      'Algorithms: Round Robin, Weighted Round Robin, Least Connections, IP Hash / Consistent Hashing.'
    ],
    interviewTip: 'Consistent Hashing is the go-to answer for distributed caching (like Redis Cluster) to avoid re-hashing all keys when a server node joins or leaves.'
  }
];

export function getCheatSheetsByCategory(category: string): CheatSheetSection[] {
  return PLACEMENT_CHEAT_SHEETS.filter((s) => s.category === category);
}
