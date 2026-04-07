import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyRequestAuth } from '@/lib/firebase-admin';
import { adaptiveAgent } from '@/lib/agents/adaptive';
import { analysisAgent } from '@/lib/agents/analysis';
import { attendanceAgent } from '@/lib/agents/attendance';
import { cognitiveAgent } from '@/lib/agents/cognitive';
import { evaluationAgent } from '@/lib/agents/evaluation';
import { mentorAgent } from '@/lib/agents/mentor';
import { teacherAgent } from '@/lib/agents/teacher';
import { getRecentLearningSessions, saveLearningSession } from '@/lib/supabase';

const requestSchema = z.object({
  topic: z.string().trim().min(2),
  answer: z.string().trim().optional().default(''),
  responseTime: z.number().positive().optional(),
  question: z.string().trim().optional(),
  userId: z.string().trim().optional()
});

export async function POST(request: Request) {
  try {
    const { uid } = await verifyRequestAuth(request);
    const body = requestSchema.parse(await request.json());

    const teacherResult = await teacherAgent(body.topic);
    const question = body.question?.trim() || teacherResult.question;
    const answer = body.answer?.trim() || '';
    const hasAnswer = answer.length > 0;

    const cognitiveResult = hasAnswer
      ? cognitiveAgent({
          topic: body.topic,
          question,
          answer,
          responseTime: body.responseTime
        })
      : {
          correctness: 0.45,
          confidence: 0.5,
          understandingLevel: 'medium' as const,
          reasoning: 'No answer submitted yet, so the system is waiting for a response.'
        };

    const adaptiveResult = adaptiveAgent(cognitiveResult.confidence);
    const mentorResult = await mentorAgent({
      topic: body.topic,
      confidence: cognitiveResult.confidence,
      level: adaptiveResult.level,
      answer
    });
    const evaluationResult = evaluationAgent({ confidence: cognitiveResult.confidence });
    const recentHistory = await getRecentLearningSessions(uid);
    const analysisResult = analysisAgent({
      topic: body.topic,
      confidence: cognitiveResult.confidence,
      history: recentHistory
    });
    const attendanceResult = attendanceAgent({
      existingSessions: recentHistory.length,
      responseTime: body.responseTime,
      answerProvided: hasAnswer
    });

    await saveLearningSession({
      userId: uid,
      topic: body.topic,
      answer: hasAnswer ? answer : undefined,
      confidence: cognitiveResult.confidence,
      score: evaluationResult.score,
      responseTime: body.responseTime,
      weakTopics: analysisResult.weakTopics,
      strongTopics: analysisResult.strongTopics,
      question,
      feedback: mentorResult.feedback,
      level: adaptiveResult.level,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      explanation: teacherResult.explanation,
      question,
      confidence: cognitiveResult.confidence,
      level: adaptiveResult.level,
      feedback: hasAnswer ? mentorResult.feedback : 'Generate a response to receive personalized mentor feedback.',
      weak_topics: analysisResult.weakTopics,
      meta: {
        correctness: cognitiveResult.correctness,
        understanding: cognitiveResult.understandingLevel,
        score: evaluationResult.score,
        trend: evaluationResult.trend,
        sessionCount: attendanceResult.sessionCount,
        activityScore: attendanceResult.activityScore
      }
    });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message ?? 'Invalid request.' : error instanceof Error ? error.message : 'Unexpected error.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
