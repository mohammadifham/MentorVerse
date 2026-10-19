import { generateLesson } from '@/lib/ai-engine';
import type { TeacherResult, TeachingMode } from '@/lib/types';

export async function teacherAgent(
  topic: string,
  mode: TeachingMode = 'standard',
  followUp?: string,
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<TeacherResult> {
  return generateLesson(topic, mode, followUp, history);
}
