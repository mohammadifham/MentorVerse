export type LearningLevel = 'easy' | 'medium' | 'hard';
export type UnderstandingLevel = 'low' | 'medium' | 'high';
export type AttentionStatus = 'Focused' | 'Distracted' | 'Preparing';
export type TeachingMode = 'standard' | 'eli5' | 'hands_on' | 'quick';
export type AnswerVerdict = 'correct' | 'partially_correct' | 'incorrect';

export interface AnswerEvaluation {
  verdict: AnswerVerdict;
  score: number;
  verdictTitle: string;
  whatYouGotRight: string;
  whatWasMissing: string;
  teacherAdvice: string;
}

export interface LearningRequestInput {
  topic: string;
  answer?: string;
  responseTime?: number;
  question?: string;
  userId?: string;
  mode?: TeachingMode;
  followUp?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface TeacherResult {
  explanation: string;
  example?: string;
  question: string;
  misconceptions?: string;
  keyTakeaways?: string[];
  mode?: TeachingMode;
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
  example?: string;
  question: string;
  misconceptions?: string;
  keyTakeaways?: string[];
  mode?: TeachingMode;
  confidence: number;
  level: LearningLevel;
  feedback: string;
  weak_topics: string[];
  evaluation?: AnswerEvaluation;
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

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  topicQuery: string;
  durationMinutes: number;
  practiceProblemPrompt?: string;
  keyConcepts: string[];
  starterCode?: {
    python?: string;
    javascript?: string;
    cpp?: string;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  level: 'Beginner' | 'Moderate' | 'Pro' | 'Full-Stack';
  targetAudience: string;
  overview: string;
  badge: string;
  accentColor: string;
  gradient: string;
  estimatedHours: number;
  totalProblems: number;
  companyTags: string[];
  modules: CourseModule[];
}

// Enterprise EdTech: AI Technical Mock Interview
export type InterviewTrack = 'dsa' | 'core_cs' | 'system_design' | 'fullstack';
export type HiringVerdict = 'Strong Hire' | 'Hire' | 'Leaning Hire' | 'No Hire';

export interface InterviewMessage {
  id: string;
  sender: 'interviewer' | 'candidate';
  text: string;
  code?: string;
  timestamp: string;
}

export interface InterviewScorecard {
  verdict: HiringVerdict;
  score: number;
  problemSolvingScore: number;
  codeQualityScore: number;
  csFundamentalsScore: number;
  communicationScore: number;
  strengths: string[];
  improvements: string[];
  overallFeedback: string;
}

export interface MockInterviewSession {
  id: string;
  userId: string;
  track: InterviewTrack;
  durationSeconds: number;
  messages: InterviewMessage[];
  scorecard?: InterviewScorecard;
  createdAt: string;
}

// Enterprise EdTech: Official Course Certificates
export interface CourseCertificate {
  id: string;
  userId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  level: string;
  issueDate: string;
  scorePercentage: number;
  skills: string[];
  verificationUrl: string;
}

// Enterprise EdTech: Community Doubt Resolution Forum
export interface CommunityReply {
  id: string;
  authorName: string;
  isAiTeacher: boolean;
  content: string;
  codeSnippet?: string;
  upvotes: number;
  createdAt: string;
}

export interface CommunityThread {
  id: string;
  title: string;
  category: 'DSA & Coding' | 'Web Development' | 'Core CS' | 'Placement Experiences';
  authorName: string;
  authorCourse: string;
  content: string;
  codeSnippet?: string;
  upvotes: number;
  replies: CommunityReply[];
  tags: string[];
  createdAt: string;
}

// Enterprise EdTech: Gamification & Leaderboard
export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  course: string;
  totalXp: number;
  streakDays: number;
  problemsSolved: number;
  coursesCompleted: number;
  badges: AchievementBadge[];
}

// Enterprise EdTech: Core CS & Placement Cheat Sheets
export interface CheatSheetSection {
  id: string;
  title: string;
  category: 'Top 75 DSA Patterns' | 'Operating Systems' | 'DBMS & SQL' | 'Computer Networks' | 'System Design';
  summary: string;
  keyPoints: string[];
  codeSnippet?: {
    language: string;
    code: string;
  };
  complexity?: {
    time: string;
    space: string;
  };
  interviewTip?: string;
}

