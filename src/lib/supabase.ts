import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CodeSubmissionRecord, CodeSubmissionSummary, DashboardSummary, LearnerProfile, LearningRecord } from '@/lib/types';

type LearningSessionRow = {
  topic?: string | null;
  confidence?: number | null;
  score?: number | null;
};

type LearnerProfileRow = {
  user_id: string;
  name: string;
  phone: string;
  email: string;
  course: string;
  profile_dp?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type CodeSubmissionRow = {
  problem_id: string;
  problem_title: string;
  topic: string;
  language: string;
  version: string;
  score: number;
  passed: boolean;
  created_at: string;
};

function isValidHttpUrl(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  if (value.includes('your_supabase_') || value.includes('placeholder')) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function createSupabaseAdminClient(): SupabaseClient | null {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isValidHttpUrl(supabaseUrl) || !supabaseKey || supabaseKey.includes('your_supabase_') || supabaseKey.includes('placeholder')) {
    return null;
  }

  try {
    return createClient(supabaseUrl as string, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  } catch {
    return null;
  }
}

export async function saveLearningSession(record: LearningRecord): Promise<void> {
  const client = createSupabaseAdminClient();
  if (!client) {
    return;
  }

  try {
    await client.from('mentorverse_sessions').insert({
      user_id: record.userId ?? null,
      topic: record.topic,
      answer: record.answer ?? null,
      confidence: record.confidence,
      score: record.score,
      response_time: record.responseTime ?? null,
      weak_topics: record.weakTopics,
      strong_topics: record.strongTopics,
      question: record.question ?? null,
      feedback: record.feedback ?? null,
      level: record.level,
      created_at: record.createdAt ?? new Date().toISOString()
    });
  } catch {
    return;
  }
}

export async function getRecentLearningSessions(userId?: string): Promise<Array<{ topic: string; confidence: number }>> {
  const client = createSupabaseAdminClient();
  if (!client) {
    return [];
  }

  let query = client.from('mentorverse_sessions').select('topic, confidence').order('created_at', { ascending: false }).limit(20);
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error || !data) {
    return [];
  }

  return (data as LearningSessionRow[]).map((entry) => ({
    topic: entry.topic ?? 'General',
    confidence: typeof entry.confidence === 'number' ? entry.confidence : 0
  }));
}

export async function getDashboardSummary(userId?: string): Promise<DashboardSummary> {
  const client = createSupabaseAdminClient();
  if (!client) {
    return {
      score: 78,
      weakTopics: ['Binary Search'],
      strongTopics: ['Recursion', 'Data Structures'],
      trend: [
        { label: 'Mon', value: 55 },
        { label: 'Tue', value: 63 },
        { label: 'Wed', value: 68 },
        { label: 'Thu', value: 74 },
        { label: 'Fri', value: 78 }
      ],
      sessionCount: 12
    };
  }

  let query = client
    .from('mentorverse_sessions')
    .select('topic, confidence, score, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    return {
      score: 78,
      weakTopics: ['Binary Search'],
      strongTopics: ['Recursion', 'Data Structures'],
      trend: [
        { label: 'Mon', value: 55 },
        { label: 'Tue', value: 63 },
        { label: 'Wed', value: 68 },
        { label: 'Thu', value: 74 },
        { label: 'Fri', value: 78 }
      ],
      sessionCount: 12
    };
  }

  const rows = data as LearningSessionRow[];
  const averageScore = Math.round(rows.reduce<number>((sum, entry) => sum + (typeof entry.score === 'number' ? entry.score : 0), 0) / rows.length);
  const topicMap = new Map<string, Array<number>>();

  for (const entry of rows) {
    const topic = entry.topic ?? 'General';
    const history = topicMap.get(topic) ?? [];
    history.push(typeof entry.confidence === 'number' ? entry.confidence : 0);
    topicMap.set(topic, history);
  }

  const topicAverages = Array.from(topicMap.entries()).map(([topic, values]) => ({
    topic,
    average: values.reduce((sum, value) => sum + value, 0) / values.length
  }));

  const weakTopics = topicAverages.filter((entry) => entry.average < 0.55).map((entry) => entry.topic).slice(0, 4);
  const strongTopics = topicAverages.filter((entry) => entry.average >= 0.75).map((entry) => entry.topic).slice(0, 4);
  const trend = rows.slice(0, 5).reverse().map((entry: LearningSessionRow, index: number) => ({
    label: ['A', 'B', 'C', 'D', 'E'][index] ?? `S${index + 1}`,
    value: Math.max(10, Math.round((typeof entry.score === 'number' ? entry.score : 0) || 10))
  }));

  return {
    score: averageScore || 78,
    weakTopics: weakTopics.length > 0 ? weakTopics : ['Review current lessons'],
    strongTopics: strongTopics.length > 0 ? strongTopics : ['Consistent practice'],
    trend: trend.length > 0 ? trend : [
      { label: 'Mon', value: 55 },
      { label: 'Tue', value: 63 },
      { label: 'Wed', value: 68 },
      { label: 'Thu', value: 74 },
      { label: 'Fri', value: 78 }
    ],
    sessionCount: data.length
  };
}

export async function getLearnerProfile(userId: string): Promise<LearnerProfile | null> {
  const client = createSupabaseAdminClient();
  if (!client || !userId) {
    return null;
  }

  const { data, error } = await client
    .from('mentorverse_learner_profiles')
    .select('user_id, name, phone, email, course, profile_dp, created_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as LearnerProfileRow;
  return {
    userId: row.user_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    course: row.course,
    profileDp: row.profile_dp ?? undefined,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined
  };
}

export async function upsertLearnerProfile(profile: LearnerProfile): Promise<void> {
  const client = createSupabaseAdminClient();
  if (!client) {
    return;
  }

  await client.from('mentorverse_learner_profiles').upsert(
    {
      user_id: profile.userId,
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
      course: profile.course,
      profile_dp: profile.profileDp ?? null,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id' }
  );
}

export async function saveCodeSubmission(record: CodeSubmissionRecord): Promise<void> {
  const client = createSupabaseAdminClient();
  if (!client) {
    return;
  }

  try {
    await client.from('mentorverse_code_submissions').insert({
      user_id: record.userId,
      problem_id: record.problemId,
      problem_title: record.problemTitle,
      topic: record.topic,
      language: record.language,
      version: record.version,
      score: record.score,
      passed: record.passed,
      output: record.output ?? null,
      error: record.error ?? null,
      ai_feedback: record.aiFeedback ?? null,
      created_at: record.createdAt ?? new Date().toISOString()
    });
  } catch {
    return;
  }
}

export async function getCodeSubmissionSummary(userId: string): Promise<CodeSubmissionSummary> {
  const client = createSupabaseAdminClient();
  if (!client || !userId) {
    return {
      totalSubmissions: 0,
      solvedCount: 0,
      averageScore: 0,
      currentStreak: 0,
      recentSubmissions: []
    };
  }

  const { data, error } = await client
    .from('mentorverse_code_submissions')
    .select('problem_id, problem_title, topic, language, version, score, passed, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !data || data.length === 0) {
    return {
      totalSubmissions: 0,
      solvedCount: 0,
      averageScore: 0,
      currentStreak: 0,
      recentSubmissions: []
    };
  }

  const rows = data as CodeSubmissionRow[];
  const totalSubmissions = rows.length;
  const solvedCount = rows.filter((row) => row.passed).length;
  const averageScore = Math.round(rows.reduce((sum, row) => sum + row.score, 0) / totalSubmissions);

  const solvedDays = new Set<string>();
  for (const row of rows) {
    if (row.passed) {
      solvedDays.add(new Date(row.created_at).toISOString().slice(0, 10));
    }
  }

  let currentStreak = 0;
  const cursor = new Date();
  for (let i = 0; i < 365; i += 1) {
    const day = new Date(cursor);
    day.setDate(cursor.getDate() - i);
    const dayKey = day.toISOString().slice(0, 10);
    if (solvedDays.has(dayKey)) {
      currentStreak += 1;
      continue;
    }
    if (i === 0) {
      continue;
    }
    break;
  }

  return {
    totalSubmissions,
    solvedCount,
    averageScore,
    currentStreak,
    recentSubmissions: rows.slice(0, 8).map((row) => ({
      problemTitle: row.problem_title,
      topic: row.topic,
      language: row.language,
      score: row.score,
      passed: row.passed,
      createdAt: row.created_at
    }))
  };
}
