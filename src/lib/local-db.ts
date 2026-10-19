import fs from 'fs';
import path from 'path';
import type {
  CodeSubmissionRecord,
  CodeSubmissionSummary,
  Course,
  DashboardSummary,
  LearnerProfile,
  LearningRecord
} from '@/lib/types';
import { PLACEMENT_COURSES } from '@/lib/courses-data';

interface LocalDatabaseSchema {
  sessions: LearningRecord[];
  profiles: Record<string, LearnerProfile>;
  codeSubmissions: CodeSubmissionRecord[];
  localUsers: Record<
    string,
    {
      id: string;
      email: string;
      name: string;
      course?: string;
      phone?: string;
      profileDp?: string;
      createdAt: string;
    }
  >;
  courses: Course[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'mentorverse-db.json');

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

function getInitialDatabase(): LocalDatabaseSchema {
  return {
    sessions: [],
    profiles: {},
    codeSubmissions: [],
    localUsers: {},
    courses: PLACEMENT_COURSES
  };
}

export function readDatabase(): LocalDatabaseSchema {
  ensureDataDir();
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDatabase();
      writeDatabase(initial);
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<LocalDatabaseSchema>;

    const sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
    const profiles = typeof parsed.profiles === 'object' && parsed.profiles ? parsed.profiles : {};
    const codeSubmissions = Array.isArray(parsed.codeSubmissions) ? parsed.codeSubmissions : [];
    const localUsers = typeof parsed.localUsers === 'object' && parsed.localUsers ? parsed.localUsers : {};
    const courses = Array.isArray(parsed.courses) && parsed.courses.length > 0 ? parsed.courses : PLACEMENT_COURSES;

    const db: LocalDatabaseSchema = {
      sessions,
      profiles,
      codeSubmissions,
      localUsers,
      courses
    };

    // If courses were not yet persisted on disk, save immediately
    if (!Array.isArray(parsed.courses) || parsed.courses.length === 0) {
      writeDatabase(db);
    }

    return db;
  } catch (error) {
    console.error('Error reading local database, resetting to default:', error);
    return getInitialDatabase();
  }
}

export const readLocalDb = readDatabase;

export function getLocalCourses(): Course[] {
  const db = readDatabase();
  return db.courses;
}

export function getLocalCourseById(id: string): Course | undefined {
  const db = readDatabase();
  return db.courses.find((c) => c.id === id);
}

export function upsertLocalCourse(course: Course): void {
  const db = readDatabase();
  const idx = db.courses.findIndex((c) => c.id === course.id);
  if (idx >= 0) {
    db.courses[idx] = course;
  } else {
    db.courses.push(course);
  }
  writeDatabase(db);
}

export function writeDatabase(db: LocalDatabaseSchema): void {
  ensureDataDir();
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (error) {
    console.error('Error writing local database:', error);
  }
}

export const writeLocalDb = writeDatabase;

export async function saveLocalSession(record: LearningRecord): Promise<void> {
  const db = readDatabase();
  const sessionToSave: LearningRecord = {
    ...record,
    createdAt: record.createdAt ?? new Date().toISOString()
  };
  db.sessions.unshift(sessionToSave);
  // Keep last 200 sessions
  if (db.sessions.length > 200) {
    db.sessions = db.sessions.slice(0, 200);
  }
  writeDatabase(db);
}

export async function getLocalRecentSessions(
  userId?: string
): Promise<Array<{ topic: string; confidence: number }>> {
  const db = readDatabase();
  let userSessions = db.sessions;
  if (userId) {
    userSessions = userSessions.filter((s) => s.userId === userId);
  }
  return userSessions.slice(0, 20).map((s) => ({
    topic: s.topic || 'General',
    confidence: typeof s.confidence === 'number' ? s.confidence : 0
  }));
}

export async function getLocalDashboardSummary(userId?: string): Promise<DashboardSummary> {
  const db = readDatabase();
  const userSessions = userId ? db.sessions.filter((s) => s.userId === userId) : db.sessions;

  if (userSessions.length === 0) {
    // If no sessions yet, provide clean starting baseline
    return {
      score: 82,
      weakTopics: ['Practice a topic to discover focus areas'],
      strongTopics: ['Ready to begin your learning journey'],
      trend: [
        { label: 'Session 1', value: 80 },
        { label: 'Current', value: 82 }
      ],
      sessionCount: 0
    };
  }

  const scores = userSessions.map((s) => s.score).filter((s): s is number => typeof s === 'number');
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 75;

  const topicScores = new Map<string, { total: number; count: number }>();
  for (const s of userSessions) {
    const topic = s.topic || 'General';
    const entry = topicScores.get(topic) ?? { total: 0, count: 0 };
    entry.total += typeof s.confidence === 'number' ? s.confidence : 0.5;
    entry.count += 1;
    topicScores.set(topic, entry);
  }

  const topicAverages = Array.from(topicScores.entries()).map(([topic, stats]) => ({
    topic,
    avg: stats.count > 0 ? stats.total / stats.count : 0
  }));

  const weakTopics = topicAverages.filter((t) => t.avg < 0.6).map((t) => t.topic).slice(0, 4);
  const strongTopics = topicAverages.filter((t) => t.avg >= 0.75).map((t) => t.topic).slice(0, 4);

  // Compute 5-point trend progression from recent sessions
  const recentChronological = userSessions.slice(0, 5).reverse();
  const trend = recentChronological.map((s, idx) => ({
    label: `S${idx + 1}`,
    value: Math.max(10, Math.min(100, Math.round(s.score || s.confidence * 100 || 70)))
  }));

  return {
    score: averageScore,
    weakTopics: weakTopics.length > 0 ? weakTopics : ['Keep practicing to sharpen skills'],
    strongTopics: strongTopics.length > 0 ? strongTopics : ['Active participation and steady progress'],
    trend: trend.length > 0 ? trend : [{ label: 'Now', value: averageScore }],
    sessionCount: userSessions.length
  };
}

export async function getLocalLearnerProfile(userId: string): Promise<LearnerProfile | null> {
  const db = readDatabase();
  return db.profiles[userId] ?? null;
}

export async function upsertLocalLearnerProfile(profile: LearnerProfile): Promise<void> {
  const db = readDatabase();
  const now = new Date().toISOString();
  db.profiles[profile.userId] = {
    ...profile,
    createdAt: db.profiles[profile.userId]?.createdAt ?? now,
    updatedAt: now
  };
  writeDatabase(db);
}

export async function saveLocalCodeSubmission(record: CodeSubmissionRecord): Promise<void> {
  const db = readDatabase();
  const submission: CodeSubmissionRecord = {
    ...record,
    createdAt: record.createdAt ?? new Date().toISOString()
  };
  db.codeSubmissions.unshift(submission);
  if (db.codeSubmissions.length > 200) {
    db.codeSubmissions = db.codeSubmissions.slice(0, 200);
  }
  writeDatabase(db);
}

export async function getLocalCodeSubmissionSummary(userId: string): Promise<CodeSubmissionSummary> {
  const db = readDatabase();
  const userSubmissions = db.codeSubmissions.filter((s) => s.userId === userId);

  if (userSubmissions.length === 0) {
    return {
      totalSubmissions: 0,
      solvedCount: 0,
      averageScore: 0,
      currentStreak: 0,
      recentSubmissions: []
    };
  }

  const totalSubmissions = userSubmissions.length;
  const solvedCount = userSubmissions.filter((s) => s.passed).length;
  const averageScore = Math.round(
    userSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSubmissions
  );

  // Compute streak
  const solvedDates = new Set<string>();
  for (const s of userSubmissions) {
    if (s.passed && s.createdAt) {
      solvedDates.add(new Date(s.createdAt).toISOString().slice(0, 10));
    }
  }

  let currentStreak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (solvedDates.has(key)) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
  }

  return {
    totalSubmissions,
    solvedCount,
    averageScore,
    currentStreak,
    recentSubmissions: userSubmissions.slice(0, 8).map((s) => ({
      problemTitle: s.problemTitle,
      topic: s.topic,
      language: s.language,
      score: s.score,
      passed: s.passed,
      createdAt: s.createdAt ?? new Date().toISOString()
    }))
  };
}
