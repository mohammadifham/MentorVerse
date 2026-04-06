import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { DashboardSummary, LearningRecord } from '@/lib/types';

type LearningSessionRow = {
  topic?: string | null;
  confidence?: number | null;
  score?: number | null;
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

export async function getDashboardSummary(): Promise<DashboardSummary> {
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

  const { data, error } = await client
    .from('mentorverse_sessions')
    .select('topic, confidence, score, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

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
