import type { Course } from '@/lib/types';

export const PLACEMENT_COURSES: Course[] = [
  {
    id: 'beginner-dsa',
    title: 'Beginner DSA: Foundational Data Structures',
    subtitle: 'Master the fundamental building blocks of DSA required for all technical placement screenings.',
    level: 'Beginner',
    targetAudience: '1st & 2nd Year CSE students, beginners starting on coding & placement prep.',
    overview:
      'Designed to take you from writing basic code to confidently understanding memory, time complexity, and core array/string manipulation. Includes step-by-step logic tracing, pointer intuition, and interactive practice.',
    badge: 'Semester 1-3 Essential',
    accentColor: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    estimatedHours: 35,
    totalProblems: 45,
    companyTags: ['TCS Digital', 'Infosys DSE', 'Wipro Turbo', 'Accenture', 'Cognizant GenC'],
    modules: [
      {
        id: 'mod-beg-1',
        title: 'Module 1: Time & Space Complexity Analysis',
        description: 'Understand Big-O, Big-Omega, Big-Theta, and how to analyze loop efficiency before writing code.',
        lessons: [
          {
            id: 'time-complexity-basics',
            title: 'Big-O Notation & Asymptotic Analysis',
            description: 'Why time complexity matters in placement rounds and how to calculate Big-O for nested loops.',
            topicQuery: 'Time and Space Complexity Analysis with Big O Notation in Data Structures',
            durationMinutes: 40,
            keyConcepts: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)', 'Space Overhead'],
            practiceProblemPrompt:
              'Given a loop that increments `i` by doubling (`i *= 2`), determine its exact time complexity and explain why with a mathematical proof.',
            starterCode: {
              python: 'def analyze_complexity(n):\n    i = 1\n    count = 0\n    while i < n:\n        count += 1\n        i *= 2\n    return count\n\nprint("Steps for n=64:", analyze_complexity(64))',
              javascript: 'function analyzeComplexity(n) {\n  let i = 1, count = 0;\n  while (i < n) {\n    count++;\n    i *= 2;\n  }\n  return count;\n}\nconsole.log("Steps for n=64:", analyzeComplexity(64));'
            }
          },
          {
            id: 'space-complexity-memory',
            title: 'Auxiliary Space vs Input Space',
            description: 'Learn memory allocation, stack frames in recursion, and in-place algorithmic requirements.',
            topicQuery: 'Auxiliary Space vs Input Space Complexity and Memory Allocation',
            durationMinutes: 35,
            keyConcepts: ['Auxiliary Space', 'In-Place Algorithms', 'Call Stack Frames', 'Memory Leaks']
          }
        ]
      },
      {
        id: 'mod-beg-2',
        title: 'Module 2: Arrays & Memory Manipulation',
        description: 'Deep dive into contiguous memory, 1D/2D arrays, prefix sums, and element traversal.',
        lessons: [
          {
            id: 'array-basics-traversal',
            title: '1D Arrays & Memory Addressing',
            description: 'How arrays store data contiguously in RAM and fundamental traversal algorithms.',
            topicQuery: 'Arrays Data Structure, Memory Layout, and In-Place Operations',
            durationMinutes: 45,
            keyConcepts: ['Contiguous Memory', 'Pointer Arithmetic', 'Index Boundary Conditions', 'Element Shifting'],
            practiceProblemPrompt:
              'Write a function that reverses an array in-place using two pointers without allocating a second array.',
            starterCode: {
              python: 'def reverse_array_inplace(arr):\n    left, right = 0, len(arr) - 1\n    while left < right:\n        arr[left], arr[right] = arr[right], arr[left]\n        left += 1\n        right -= 1\n    return arr\n\nprint(reverse_array_inplace([10, 20, 30, 40, 50]))',
              javascript: 'function reverseArrayInplace(arr) {\n  let left = 0, right = arr.length - 1;\n  while (left < right) {\n    [arr[left], arr[right]] = [arr[right], arr[left]];\n    left++;\n    right--;\n  }\n  return arr;\n}\nconsole.log(reverseArrayInplace([10, 20, 30, 40, 50]));'
            }
          },
          {
            id: 'prefix-sum-technique',
            title: 'Prefix Sum & Range Sum Queries',
            description: 'Master the O(1) range sum query pattern widely asked in technical screening assessments.',
            topicQuery: 'Prefix Sum Array Algorithm and Range Sum Query Optimization',
            durationMinutes: 50,
            keyConcepts: ['Prefix Sum Array', 'O(1) Range Queries', 'Subarray Sums', 'Precomputation']
          }
        ]
      },
      {
        id: 'mod-beg-3',
        title: 'Module 3: Strings & Character Array Patterns',
        description: 'String immutability, ASCII tables, palindromes, and sliding character counters.',
        lessons: [
          {
            id: 'strings-palindromes',
            title: 'String Manipulation & Palindrome Verification',
            description: 'Efficient string reversal, alphanumeric normalization, and two-pointer verification.',
            topicQuery: 'String Manipulation, Character Arrays, and Two-Pointer Palindromes in Coding Interviews',
            durationMinutes: 45,
            keyConcepts: ['Two Pointers', 'String Immutability', 'Alphanumeric Filtering', 'Space Efficiency'],
            practiceProblemPrompt:
              'Write a function that checks if a string is a valid palindrome, ignoring casing and non-alphanumeric characters.',
            starterCode: {
              python: 'def is_palindrome(s):\n    cleaned = [c.lower() for c in s if c.isalnum()]\n    return cleaned == cleaned[::-1]\n\nprint(is_palindrome("A man, a plan, a canal: Panama")) # True',
              javascript: 'function isPalindrome(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return clean === clean.split("").reverse().join("");\n}\nconsole.log(isPalindrome("A man, a plan, a canal: Panama"));'
            }
          },
          {
            id: 'anagram-frequency-maps',
            title: 'Valid Anagrams & Frequency Array Technique',
            description: 'Using constant O(26) character frequency buckets to compare strings in linear O(N) time.',
            topicQuery: 'Valid Anagram Algorithm using Character Frequency Buckets',
            durationMinutes: 40,
            keyConcepts: ['Frequency Array', 'O(1) Space', 'ASCII Subtraction', 'Linear Scan']
          }
        ]
      },
      {
        id: 'mod-beg-4',
        title: 'Module 4: Searching & Basic Sorting Algorithms',
        description: 'Linear Search, Binary Search boundary conditions, and elementary comparison sorts.',
        lessons: [
          {
            id: 'binary-search-foundations',
            title: 'Binary Search & The Half-Interval Rule',
            description: 'Detailed analysis of mid = low + (high - low) // 2 and sorted array requirements.',
            topicQuery: 'Binary Search Algorithm, Integer Overflow Prevention, and Boundary Conditions',
            durationMinutes: 55,
            keyConcepts: ['Divide and Conquer', 'O(log n)', 'Upper/Lower Bound', 'Mid Calculation'],
            practiceProblemPrompt:
              'Implement Binary Search in sorted array. Return index if target exists, or -1 if not found.',
            starterCode: {
              python: 'def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = low + (high - low) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\nprint(binary_search([2, 5, 8, 12, 16, 23, 38], 16)) # Output: 4',
              javascript: 'function binarySearch(arr, target) {\n  let low = 0, high = arr.length - 1;\n  while (low <= high) {\n    const mid = low + Math.floor((high - low) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return -1;\n}\nconsole.log(binarySearch([2, 5, 8, 12, 16, 23, 38], 16));'
            }
          },
          {
            id: 'selection-bubble-insertion',
            title: 'Elementary Sorting: Selection, Bubble, and Insertion Sort',
            description: 'Learn in-place comparison sorts, stability, and when Insertion Sort performs in O(n) for nearly-sorted data.',
            topicQuery: 'Elementary Sorting Algorithms Comparison: Bubble Sort, Selection Sort, Insertion Sort and Stability',
            durationMinutes: 50,
            keyConcepts: ['In-Place Sorting', 'Algorithm Stability', 'Best-case O(n)', 'Swap Mechanics']
          }
        ]
      },
      {
        id: 'mod-beg-5',
        title: 'Module 5: Recursion & Mathematical Fundamentals',
        description: 'Call stacks, termination criteria, recursion trees, and fundamental math for placements.',
        lessons: [
          {
            id: 'recursion-base-cases',
            title: 'Recursive Functions & Call Stack Frames',
            description: 'Mastering the base case and recurrence relations to solve complex problems recursively.',
            topicQuery: 'Recursion Fundamentals, Call Stack Execution Frames, and Stack Overflow Mitigation',
            durationMinutes: 50,
            keyConcepts: ['Base Case', 'Recursive Step', 'Call Stack Memory', 'Recurrence Relations']
          },
          {
            id: 'gcd-euclidean-prime',
            title: 'Sieve of Eratosthenes & Euclidean GCD',
            description: 'Essential mathematical algorithms frequently appearing in online assessment rounds.',
            topicQuery: 'Euclidean GCD Algorithm and Sieve of Eratosthenes for Prime Numbers',
            durationMinutes: 45,
            keyConcepts: ['Euclidean Algorithm', 'Sieve of Eratosthenes', 'Prime Factorization', 'Modulo Arithmetic']
          }
        ]
      }
    ]
  },
  {
    id: 'moderate-dsa',
    title: 'Moderate DSA: Core Concepts & Placement Practice',
    subtitle: 'Comprehensive coverage of Linked Lists, Trees, Stacks, Queues, Hashing & placement problem patterns.',
    level: 'Moderate',
    targetAudience: 'Pre-final & Final year CSE students preparing for SDE-1 placement interviews.',
    overview:
      'Master the standard data structures and algorithmic patterns asked by top hiring partners (Amazon, Capgemini, Dell, Oracle, Zoho, Walmart). Features deep dive into pointers, tree traversals, sliding windows, and greedy techniques.',
    badge: 'Placement Core',
    accentColor: 'emerald',
    gradient: 'from-emerald-500 to-teal-700',
    estimatedHours: 55,
    totalProblems: 85,
    companyTags: ['Amazon SDE-1', 'Zoho', 'Walmart', 'Oracle', 'JPMorgan', 'Capgemini'],
    modules: [
      {
        id: 'mod-med-1',
        title: 'Module 1: Linked Lists (Singly, Doubly & Circular)',
        description: 'Dynamic node allocation, pointer redirection, fast & slow pointers, and cycle detection.',
        lessons: [
          {
            id: 'linked-list-reversal',
            title: 'Reversing a Singly Linked List (Iterative & Recursive)',
            description: 'Master the 3-pointer technique (prev, curr, next) to reverse linked lists in O(n) time and O(1) space.',
            topicQuery: 'Reverse a Singly Linked List Iterative and Recursive Implementation',
            durationMinutes: 45,
            keyConcepts: ['Prev Pointer', 'Curr Pointer', 'Next Pointer', 'In-Place Pointer Swap'],
            practiceProblemPrompt:
              'Implement the reversal of a singly linked list. Explain the step-by-step state of all three pointers.',
            starterCode: {
              python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head):\n    prev = None\n    curr = head\n    while curr:\n        next_node = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_node\n    return prev',
              javascript: 'class ListNode {\n  constructor(val, next = null) {\n    this.val = val;\n    this.next = next;\n  }\n}\nfunction reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}'
            }
          },
          {
            id: 'floyd-cycle-detection',
            title: "Floyd's Cycle Detection (Tortoise and Hare)",
            description: 'Mathematical proof and implementation of detecting loops in linked lists using two pointers moving at different speeds.',
            topicQuery: "Floyd's Cycle Detection Algorithm (Tortoise and Hare) in Linked Lists",
            durationMinutes: 50,
            keyConcepts: ['Slow Pointer', 'Fast Pointer', 'Cycle Intersection', 'Start of Cycle Proof']
          }
        ]
      },
      {
        id: 'mod-med-2',
        title: 'Module 2: Stacks, Queues & Monotonic Patterns',
        description: 'LIFO/FIFO mechanics, expression evaluation, Monotonic Stack, and sliding queue buffers.',
        lessons: [
          {
            id: 'valid-parentheses-stack',
            title: 'Balanced Parentheses & Stack Applications',
            description: 'Using stack frames to match opening and closing bracket types in linear time.',
            topicQuery: 'Valid Parentheses Problem using Stack Data Structure',
            durationMinutes: 40,
            keyConcepts: ['LIFO Order', 'Matching Delimiters', 'Stack Underflow', 'String Validation']
          },
          {
            id: 'monotonic-stack-nge',
            title: 'Monotonic Stack: Next Greater Element',
            description: 'Learn the O(n) monotonic stack pattern that replaces naive O(n^2) nested loops.',
            topicQuery: 'Monotonic Stack Pattern for Next Greater Element and Daily Temperatures',
            durationMinutes: 55,
            keyConcepts: ['Monotonically Increasing', 'Monotonically Decreasing', 'Nearest Smaller Element', 'Amortized O(n)']
          }
        ]
      },
      {
        id: 'mod-med-3',
        title: 'Module 3: Hashing, HashMaps & Sets',
        description: 'O(1) average lookup, hash functions, collision resolution, and frequency tracking patterns.',
        lessons: [
          {
            id: 'hash-table-collisions',
            title: 'Hash Tables, Hash Functions & Collisions',
            description: 'How HashMaps achieve O(1) performance and how chaining vs open addressing resolves collisions.',
            topicQuery: 'Hash Table Architecture, Hash Functions, Separate Chaining and Open Addressing Collisions',
            durationMinutes: 50,
            keyConcepts: ['Hash Code', 'Bucket Array', 'Separate Chaining', 'Linear Probing', 'Load Factor']
          },
          {
            id: 'two-sum-hashmap-pattern',
            title: 'Two Sum & Complement Lookup Pattern',
            description: 'Solving the classic Two Sum interview problem in single-pass O(n) using a hash map.',
            topicQuery: 'Two Sum Problem Optimal Solution with Hash Map',
            durationMinutes: 45,
            keyConcepts: ['Complement Lookup', 'Single Pass O(n)', 'Value-to-Index Mapping']
          }
        ]
      },
      {
        id: 'mod-med-4',
        title: 'Module 4: Advanced Sorting (Quicksort & Mergesort)',
        description: 'Divide-and-conquer sorting, recursion trees, in-place partitioning, and stability.',
        lessons: [
          {
            id: 'mergesort-dnc',
            title: 'Merge Sort: Guaranteed O(n log n) Divide & Conquer',
            description: 'Recursively dividing arrays in halves and merging sorted subarrays with stable ordering.',
            topicQuery: 'Merge Sort Algorithm Divide and Conquer with Time Complexity Analysis',
            durationMinutes: 50,
            keyConcepts: ['Divide and Conquer', 'Stable Sorting', 'Auxiliary Buffer O(n)', 'Recursion Tree']
          },
          {
            id: 'quicksort-partitions',
            title: 'Quicksort & In-Place Partitioning Strategies',
            description: 'Lomuto vs Hoare partition schemes, pivot selection strategies, and worst-case avoidance.',
            topicQuery: 'Quicksort Algorithm Partitioning Schemes (Lomuto vs Hoare) and Pivot Optimization',
            durationMinutes: 55,
            keyConcepts: ['Pivot Selection', 'In-Place Partition', 'Cache Locality', 'Median-of-Three']
          }
        ]
      },
      {
        id: 'mod-med-5',
        title: 'Module 5: Binary Trees & Tree Traversals',
        description: 'Tree hierarchies, Depth-First (Pre/In/Post) & Breadth-First (Level-Order BFS) traversals.',
        lessons: [
          {
            id: 'tree-traversals-dfs-bfs',
            title: 'Binary Tree Traversals (In-order, Pre-order, Post-order & Level-Order)',
            description: 'Mastering recursive DFS tree visits and queue-based BFS level-by-level processing.',
            topicQuery: 'Binary Tree Traversals: In-order, Pre-order, Post-order and Level-order BFS with Queue',
            durationMinutes: 60,
            keyConcepts: ['In-order', 'Pre-order', 'Post-order', 'Level-order BFS', 'Queue-based Traversal']
          },
          {
            id: 'bst-operations',
            title: 'Binary Search Tree (BST) Operations',
            description: 'Properties of BST (Left < Root < Right), search, insertion, deletion, and validation.',
            topicQuery: 'Binary Search Tree Properties, Search, Insert, and Validate BST',
            durationMinutes: 55,
            keyConcepts: ['BST Invariance', 'Search O(h)', 'Successor/Predecessor', 'BST Validation']
          }
        ]
      },
      {
        id: 'mod-med-6',
        title: 'Module 6: Sliding Window & Two-Pointer Patterns',
        description: 'Techniques for subarray problems, maximum sums, and substring constraints.',
        lessons: [
          {
            id: 'fixed-sliding-window',
            title: 'Fixed Size Sliding Window',
            description: 'Calculating maximum/minimum metrics across windows of size K in linear O(n) time.',
            topicQuery: 'Sliding Window Technique for Subarrays of Size K in Placement Interviews',
            durationMinutes: 45,
            keyConcepts: ['Window Expansion', 'Window Contraction', 'O(n) Linear Scan']
          },
          {
            id: 'dynamic-sliding-window',
            title: 'Dynamic Sliding Window: Longest Substring Without Repeating Characters',
            description: 'Two-pointer expanding and contracting window with frequency maps for variable constraints.',
            topicQuery: 'Longest Substring Without Repeating Characters Sliding Window Algorithm',
            durationMinutes: 55,
            keyConcepts: ['Variable Window', 'Character Map', 'Left Pointer Jump', 'Max Window Size']
          }
        ]
      }
    ]
  },
  {
    id: 'pro-dsa',
    title: 'Pro DSA: A-to-Z DSA & Hard FAANG / Placement Challenges',
    subtitle: 'Graph algorithms, 1D/2D Dynamic Programming, Tries, Segment Trees & Tier-1 technical round problems.',
    level: 'Pro',
    targetAudience: 'Students aiming for high-package CTC roles (Google, Microsoft, Amazon, Uber, Atlassian, Adobe).',
    overview:
      'The comprehensive masterclass for hard-difficulty coding interviews. Covers graph shortest path algorithms, topological sorting, state transitions in dynamic programming, prefix trees, and advanced problem decompositions.',
    badge: 'Dream Package CTC',
    accentColor: 'violet',
    gradient: 'from-violet-600 to-purple-800',
    estimatedHours: 75,
    totalProblems: 120,
    companyTags: ['Google', 'Microsoft', 'Atlassian', 'Uber', 'Directi', 'Goldman Sachs'],
    modules: [
      {
        id: 'mod-pro-1',
        title: 'Module 1: Advanced Graph Theory & Traversal',
        description: 'Adjacency structures, BFS/DFS, Cycle Detection, and Topological Sorting.',
        lessons: [
          {
            id: 'graph-bfs-dfs-cycle',
            title: 'Graph BFS, DFS & Cycle Detection in Directed/Undirected Graphs',
            description: 'Detecting cycles using visited arrays, parent pointers, and recursion path arrays.',
            topicQuery: 'Graph Traversal BFS and DFS, Cycle Detection in Directed and Undirected Graphs',
            durationMinutes: 65,
            keyConcepts: ['Adjacency List', 'Visited Set', 'Recursion Call Path', 'Bipartite Graph Check']
          },
          {
            id: 'topological-sort-kahns',
            title: "Topological Sort & Kahn's Algorithm (Course Schedule Pattern)",
            description: 'Ordering tasks with prerequisites using in-degrees and queue-based BFS in DAGs.',
            topicQuery: "Topological Sorting in Directed Acyclic Graphs and Kahn's Algorithm (In-degree BFS)",
            durationMinutes: 60,
            keyConcepts: ['In-degree Array', 'DAG (Directed Acyclic Graph)', 'Dependency Resolution', 'Cycle in DAG']
          }
        ]
      },
      {
        id: 'mod-pro-2',
        title: 'Module 2: Shortest Paths & Minimum Spanning Trees',
        description: "Dijkstra's Algorithm, Bellman-Ford, Disjoint Set Union (DSU), and Kruskal's MST.",
        lessons: [
          {
            id: 'dijkstra-shortest-path',
            title: "Dijkstra's Algorithm with Min-Heap Priority Queue",
            description: 'Single-source shortest path algorithm for non-negative weighted graphs in O((V + E) log V).',
            topicQuery: "Dijkstra's Shortest Path Algorithm using Min-Heap Priority Queue",
            durationMinutes: 65,
            keyConcepts: ['Min-Heap', 'Relaxation Step', 'Greedy Choice', 'Negative Weight Limitation']
          },
          {
            id: 'dsu-kruskals-mst',
            title: 'Disjoint Set Union (Union-Find by Rank) & Kruskals MST',
            description: 'Near O(1) union-find operations with path compression and rank optimization for network connectivity.',
            topicQuery: 'Disjoint Set Union (DSU) Union-Find by Rank and Path Compression with Kruskal Algorithm',
            durationMinutes: 65,
            keyConcepts: ['Path Compression', 'Union by Rank', 'Minimum Spanning Tree', 'Cycle Detection in Kruskal']
          }
        ]
      },
      {
        id: 'mod-pro-3',
        title: 'Module 3: Dynamic Programming (1D & 2D State Transitions)',
        description: 'Overlapping subproblems, optimal substructure, memoization, and bottom-up tabulation.',
        lessons: [
          {
            id: 'dp-1d-knapsack',
            title: '0/1 Knapsack Problem (Memoization & Tabulation)',
            description: 'Master the foundational 2D-to-1D state compression pattern for constrained optimization.',
            topicQuery: '0/1 Knapsack Problem Dynamic Programming Memoization and Space-Optimized Tabulation',
            durationMinutes: 70,
            keyConcepts: ['State Definition dp[i][w]', 'Optimal Substructure', 'Space Compression to 1D', 'Include/Exclude Choice']
          },
          {
            id: 'dp-lcs-lis',
            title: 'Longest Common Subsequence (LCS) & Longest Increasing Subsequence (LIS)',
            description: 'Solving string comparison and sequence ordering problems with dynamic programming.',
            topicQuery: 'Longest Common Subsequence (LCS) and Longest Increasing Subsequence (LIS) Dynamic Programming',
            durationMinutes: 70,
            keyConcepts: ['String Matching Matrix', 'Subsequence vs Subarray', 'O(n log n) Patient Sorting for LIS', 'Backtracking Reconstruction']
          }
        ]
      },
      {
        id: 'mod-pro-4',
        title: 'Module 4: Advanced Trees, Tries & String Data Structures',
        description: 'Trie (Prefix Tree) implementation, Bitwise Trie, and Lowest Common Ancestor (LCA).',
        lessons: [
          {
            id: 'trie-prefix-tree',
            title: 'Trie (Prefix Tree) Implementation for Autocomplete & Search',
            description: 'Building multi-way tree structures for fast O(L) prefix searches and dictionary checks.',
            topicQuery: 'Trie Data Structure (Prefix Tree) Insertion, Search, and StartsWith Implementation',
            durationMinutes: 60,
            keyConcepts: ['Node Array / Map', 'isEndOfWord Flag', 'Prefix Search', 'Autocomplete Engine']
          },
          {
            id: 'lowest-common-ancestor',
            title: 'Lowest Common Ancestor (LCA) in Binary Trees & BSTs',
            description: 'Finding the lowest shared ancestor node using post-order tree recursion and binary lifting.',
            topicQuery: 'Lowest Common Ancestor (LCA) in Binary Tree and Binary Search Tree',
            durationMinutes: 55,
            keyConcepts: ['Post-Order Traversal', 'Subtree Convergence', 'Binary Lifting Intuition', 'Parent Pointer Comparison']
          }
        ]
      },
      {
        id: 'mod-pro-5',
        title: 'Module 5: Hard Interview Problem Patterns',
        description: 'Trapping rain water, alien dictionary, and multi-concept problem syntheses.',
        lessons: [
          {
            id: 'trapping-rain-water',
            title: 'Trapping Rain Water (Two-Pointer & Dynamic Programming)',
            description: 'Detailed walkthrough of the famous hard interview challenge using left_max and right_max bounds.',
            topicQuery: 'Trapping Rain Water Problem Optimal Solution using Two Pointers',
            durationMinutes: 60,
            keyConcepts: ['Elevation Map', 'Two Pointers', 'Water Trapped Formula', 'O(1) Space Optimization']
          },
          {
            id: 'word-ladder-bfs',
            title: 'Word Ladder (Shortest Word Transformation via BFS)',
            description: 'Modeling shortest word mutation sequences as an unweighted graph and exploring levels via BFS.',
            topicQuery: 'Word Ladder Problem Shortest Transformation Sequence using Graph BFS',
            durationMinutes: 65,
            keyConcepts: ['Breadth-First Search', 'Character Permutations', 'HashSet Lookup', 'Shortest Transformation Path']
          }
        ]
      }
    ]
  },
  {
    id: 'fullstack-web-dev',
    title: 'Full-Stack Web Development: Placement & Production',
    subtitle: 'HTML5, Modern CSS, ES6+ JavaScript, React, Node.js, Express, MongoDB & full-stack project building.',
    level: 'Full-Stack',
    targetAudience: 'Students preparing for Full-Stack, Frontend, or Backend Software Engineer roles.',
    overview:
      'Learn complete modern web engineering from ground zero to production-grade applications. Covers semantic HTML5, modern flexbox/grid styling, asynchronous JavaScript, React hooks, REST APIs with Express, and MongoDB NoSQL database modeling.',
    badge: 'Job Ready 2026',
    accentColor: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    estimatedHours: 65,
    totalProblems: 60,
    companyTags: ['Full-Stack SDE', 'Frontend Engineer', 'Backend Engineer', 'MERN Stack Developer', 'Fintech Startups'],
    modules: [
      {
        id: 'mod-web-1',
        title: 'Module 1: HTML5 Modern Semantic Architecture',
        description: 'Semantic tags, forms, accessibility, SEO, and document structure.',
        lessons: [
          {
            id: 'html5-semantics-seo',
            title: 'Semantic HTML5, Document Structure & SEO Best Practices',
            description: 'Why semantic tags (<header>, <nav>, <main>, <article>, <section>) matter for browser parsing and SEO.',
            topicQuery: 'Semantic HTML5 Elements, Document Hierarchy, Accessibility a11y, and Technical SEO',
            durationMinutes: 45,
            keyConcepts: ['Semantic Markup', 'Accessibility (ARIA)', 'Meta Tags', 'Heading Hierarchy']
          },
          {
            id: 'html5-forms-validation',
            title: 'Modern Forms, Input Types & Native Validation',
            description: 'Building accessible, secure forms with built-in client-side constraints and input types.',
            topicQuery: 'HTML5 Form Controls, Validation Attributes (pattern, required), and Form Submission Flow',
            durationMinutes: 40,
            keyConcepts: ['Form Controls', 'Constraint Validation', 'FormData API', 'Security Basics']
          }
        ]
      },
      {
        id: 'mod-web-2',
        title: 'Module 2: CSS3, Flexbox, Grid & Modern UI Styling',
        description: 'CSS Box Model, Flexbox layout, CSS Grid, media queries, and responsive design systems.',
        lessons: [
          {
            id: 'css-box-model-flexbox',
            title: 'CSS Box Model & Flexbox Layout Mechanics',
            description: 'Master margins, paddings, borders, flex-direction, justify-content, and align-items.',
            topicQuery: 'CSS Box Model and Flexbox Complete Layout Guide with Flex Containers and Flex Items',
            durationMinutes: 50,
            keyConcepts: ['Box Model', 'Flex Direction', 'Justify Content', 'Align Items', 'Flex Grow & Shrink']
          },
          {
            id: 'css-grid-responsive',
            title: 'CSS Grid & Responsive Design with Media Queries',
            description: 'Building modern responsive dashboard layouts using grid-template-columns and mobile-first media queries.',
            topicQuery: 'CSS Grid Layout Architecture, fr units, grid-template-areas, and Responsive Media Queries',
            durationMinutes: 55,
            keyConcepts: ['CSS Grid', 'Fractional Units (fr)', 'Mobile-First Design', 'Media Queries', 'Glassmorphism']
          }
        ]
      },
      {
        id: 'mod-web-3',
        title: 'Module 3: Modern JavaScript (ES6+ Deep Dive)',
        description: 'Scope, closures, event loop, promises, async/await, and DOM manipulation.',
        lessons: [
          {
            id: 'js-scope-closures',
            title: 'Execution Context, Lexical Scope & Closures',
            description: 'How the JavaScript engine executes code, call stacks, variable hoisting, and closure data privacy.',
            topicQuery: 'JavaScript Execution Context, Call Stack, Lexical Scope, Hoisting, and Closures Explained',
            durationMinutes: 55,
            keyConcepts: ['Execution Context', 'Lexical Scope', 'Closures', 'Data Privacy', 'Hoisting']
          },
          {
            id: 'js-async-promises-eventloop',
            title: 'Asynchronous JavaScript: Event Loop, Promises & Async/Await',
            description: 'Mastering the JavaScript event loop, microtask vs macrotask queues, Promise chaining, and async/await error handling.',
            topicQuery: 'JavaScript Event Loop, Microtask Queue, Promises, and Async Await Error Handling',
            durationMinutes: 60,
            keyConcepts: ['Event Loop', 'Microtasks vs Macrotasks', 'Promises', 'Async/Await', 'Fetch API']
          }
        ]
      },
      {
        id: 'mod-web-4',
        title: 'Module 4: React & Component Architecture',
        description: 'Declarative UI, JSX, Props, State, Hooks, Virtual DOM, and component lifecycles.',
        lessons: [
          {
            id: 'react-components-state-hooks',
            title: 'React Components, Props & useState / useEffect Hooks',
            description: 'Building interactive reusable components with reactive state and side-effect lifecycles.',
            topicQuery: 'React Component Architecture, useState Hook, useEffect Hook Lifecycles and Dependencies',
            durationMinutes: 60,
            keyConcepts: ['JSX', 'Props', 'useState', 'useEffect', 'Dependency Array', 'Unidirectional Data Flow']
          },
          {
            id: 'react-custom-hooks-performance',
            title: 'Custom Hooks, Context API & Performance Optimization',
            description: 'Extracting reusable business logic into custom hooks and preventing unnecessary re-renders.',
            topicQuery: 'React Custom Hooks, Context API Global State, useMemo, and useCallback Optimization',
            durationMinutes: 65,
            keyConcepts: ['Custom Hooks', 'Context API', 'useMemo', 'useCallback', 'Virtual DOM Reconciliation']
          }
        ]
      },
      {
        id: 'mod-web-5',
        title: 'Module 5: Backend with Node.js & Express REST APIs',
        description: 'Server architectures, HTTP methods, Express middleware, routing, and controllers.',
        lessons: [
          {
            id: 'nodejs-express-rest-api',
            title: 'RESTful API Architecture with Node.js & Express',
            description: 'Creating production-grade REST endpoints (GET, POST, PUT, DELETE) with status codes and JSON payloads.',
            topicQuery: 'Node.js and Express RESTful API Architecture, HTTP Status Codes, and Route Controllers',
            durationMinutes: 60,
            keyConcepts: ['Express Router', 'Middleware Pipeline', 'HTTP Status Codes', 'Request / Response Lifecycle']
          },
          {
            id: 'express-middleware-auth-jwt',
            title: 'Express Middleware & JWT Authentication Flow',
            description: 'Securing API endpoints using JSON Web Tokens (JWT), Authorization headers, and error middleware.',
            topicQuery: 'Express Middleware Architecture, Authentication with JWT Tokens, and Global Error Handling',
            durationMinutes: 60,
            keyConcepts: ['JWT Authentication', 'Bearer Token', 'Auth Middleware', 'Error Handling Middleware']
          }
        ]
      },
      {
        id: 'mod-web-6',
        title: 'Module 6: Database with MongoDB & Mongoose NoSQL',
        description: 'NoSQL document databases, schemas, CRUD operations, indexing, and aggregations.',
        lessons: [
          {
            id: 'mongodb-mongoose-crud',
            title: 'MongoDB Collections, Documents & Mongoose Schema Modeling',
            description: 'Connecting to MongoDB Atlas, defining typed Mongoose schemas, and executing CRUD queries.',
            topicQuery: 'MongoDB Document Database, Collections, Mongoose Schema Modeling, and CRUD Operations',
            durationMinutes: 60,
            keyConcepts: ['NoSQL Documents', 'BSON', 'Mongoose Schemas', 'CRUD Queries', 'Database Indexing']
          },
          {
            id: 'fullstack-mern-deployment',
            title: 'Connecting Frontend to Backend (MERN Stack) & Deployment',
            description: 'Configuring CORS, environment variables, frontend API client fetch/axios, and cloud deployment.',
            topicQuery: 'Full Stack MERN Architecture: Connecting React Frontend to Express MongoDB Backend with CORS',
            durationMinutes: 65,
            keyConcepts: ['Full-Stack Integration', 'CORS Configuration', 'Environment Variables', 'Production Build']
          }
        ]
      }
    ]
  }
];

export function getPlacementCourses(): Course[] {
  return PLACEMENT_COURSES;
}

export function getCourseById(courseId: string): Course | undefined {
  return PLACEMENT_COURSES.find((c) => c.id === courseId);
}

export function getLessonById(courseId: string, lessonId: string) {
  const course = getCourseById(courseId);
  if (!course) return null;
  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) return { course, module: mod, lesson };
  }
  return null;
}
