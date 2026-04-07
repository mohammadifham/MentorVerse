export type CodeTopicSheet =
  | 'DSA Basics'
  | 'Strings'
  | 'Math and Logic'
  | 'CSE Core'
  | 'Engineering Aptitude';

export interface HiddenTestCase {
  input: string;
  output: string;
}

export interface CodePracticeProblem {
  id: string;
  topic: CodeTopicSheet;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  statement: string;
  sampleInput: string;
  expectedOutput: string;
  hiddenTests: HiddenTestCase[];
}

const problemBank: CodePracticeProblem[] = [
  {
    id: 'sum-two',
    topic: 'DSA Basics',
    title: 'Sum of Two Numbers',
    difficulty: 'easy',
    statement: 'Read two integers and print their sum.',
    sampleInput: '10 15',
    expectedOutput: '25',
    hiddenTests: [
      { input: '3 9', output: '12' },
      { input: '-5 10', output: '5' },
      { input: '100 200', output: '300' }
    ]
  },
  {
    id: 'reverse-string',
    topic: 'Strings',
    title: 'Reverse String',
    difficulty: 'easy',
    statement: 'Read a string and print the reversed string.',
    sampleInput: 'mentor',
    expectedOutput: 'rotnem',
    hiddenTests: [
      { input: 'abc', output: 'cba' },
      { input: 'racecar', output: 'racecar' },
      { input: 'engineer', output: 'reenigne' }
    ]
  },
  {
    id: 'fizzbuzz',
    topic: 'Math and Logic',
    title: 'FizzBuzz (1 to N)',
    difficulty: 'medium',
    statement: 'Read N. Print numbers from 1 to N, but print Fizz for multiples of 3, Buzz for multiples of 5, and FizzBuzz for both.',
    sampleInput: '5',
    expectedOutput: '1\n2\nFizz\n4\nBuzz',
    hiddenTests: [
      { input: '3', output: '1\n2\nFizz' },
      { input: '10', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz' },
      { input: '15', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz' }
    ]
  },
  {
    id: 'count-vowels',
    topic: 'CSE Core',
    title: 'Count Vowels',
    difficulty: 'medium',
    statement: 'Read a lowercase string and print the count of vowels (a,e,i,o,u).',
    sampleInput: 'database',
    expectedOutput: '4',
    hiddenTests: [
      { input: 'network', output: '2' },
      { input: 'aeiou', output: '5' },
      { input: 'rhythm', output: '0' }
    ]
  },
  {
    id: 'max-three',
    topic: 'Engineering Aptitude',
    title: 'Maximum of Three Numbers',
    difficulty: 'easy',
    statement: 'Read three integers and print the maximum value.',
    sampleInput: '5 18 9',
    expectedOutput: '18',
    hiddenTests: [
      { input: '1 2 3', output: '3' },
      { input: '-1 -5 -2', output: '-1' },
      { input: '10 10 2', output: '10' }
    ]
  }
];

export function getCodeProblemBank(): CodePracticeProblem[] {
  return problemBank;
}

export function getPublicCodeProblems() {
  return problemBank.map((problem) => ({
    id: problem.id,
    topic: problem.topic,
    title: problem.title,
    difficulty: problem.difficulty,
    statement: problem.statement,
    sampleInput: problem.sampleInput,
    expectedOutput: problem.expectedOutput
  }));
}

export function findCodeProblemById(problemId: string): CodePracticeProblem | undefined {
  return problemBank.find((problem) => problem.id === problemId);
}
