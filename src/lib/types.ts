export type LearningLevel = 'easy' | 'medium' | 'hard';
export type UnderstandingLevel = 'low' | 'medium' | 'high';
export type AttentionStatus = 'Focused' | 'Distracted' | 'Preparing';

export interface LearningRequestInput {
  topic: string;
  answer?: string;
  responseTime?: number;
  question?: string;
  userId?: string;
}

export interface TeacherResult {
  explanation: string;
  question: string;
}

export interface CognitiveResult {
  correctness: number;
  confidence: number;
  understandingLevel: UnderstandingLevel;
  reasoning: string;
}

export interface AdaptiveResult {
  level: LearningLevel;
  message: string;
}

export interface MentorResult {
  feedback: string;
}

export interface EvaluationResult {
  score: number;
  trend: 'improving' | 'steady' | 'needs reinforcement';
}

export interface AnalysisResult {
  weakTopics: string[];
  strongTopics: string[];
}

export interface AttendanceResult {
  sessionCount: number;
  activityScore: number;
}

export interface LearningResponse {
  explanation: string;
  question: string;
  confidence: number;
  level: LearningLevel;
  feedback: string;
  weak_topics: string[];
}

export interface LearningRecord {
  userId?: string;
  topic: string;
  answer?: string;
  confidence: number;
  score: number;
  responseTime?: number;
  weakTopics: string[];
  strongTopics: string[];
  question?: string;
  feedback?: string;
  level: LearningLevel;
  createdAt?: string;
}

export interface DashboardSummary {
  score: number;
  weakTopics: string[];
  strongTopics: string[];
  trend: Array<{ label: string; value: number }>;
  sessionCount: number;
}

export interface LearnerProfile {
  userId: string;
  name: string;
  phone: string;
  email: string;
  course: string;
  profileDp?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CodeSubmissionRecord {
  userId: string;
  problemId: string;
  problemTitle: string;
  topic: string;
  language: string;
  version: string;
  score: number;
  passed: boolean;
  output?: string;
  error?: string;
  aiFeedback?: string;
  createdAt?: string;
}

export interface CodeSubmissionSummary {
  totalSubmissions: number;
  solvedCount: number;
  averageScore: number;
  currentStreak: number;
  recentSubmissions: Array<{
    problemTitle: string;
    topic: string;
    language: string;
    score: number;
    passed: boolean;
    createdAt: string;
  }>;
}
