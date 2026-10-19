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
import { evaluateStudentAnswer } from '@/lib/ai-engine';
import { getRecentLearningSessions, saveLearningSession } from '@/lib/supabase';
import type { AnswerEvaluation, TeachingMode } from '@/lib/types';

const requestSchema = z.object({
  topic: z.string().trim().min(1),
  answer: z.string().trim().optional().default(''),
  responseTime: z.number().positive().optional(),
  question: z.string().trim().optional(),
  userId: z.string().trim().optional(),
  mode: z.enum(['standard', 'eli5', 'hands_on', 'quick']).optional(),
  followUp: z.string().trim().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string()
      })
    )
    .optional()
});

export async function POST(request: Request) {
  try {
    const { uid } = await verifyRequestAuth(request);
    const body = requestSchema.parse(await request.json());

    const mode: TeachingMode = body.mode ?? 'standard';
    const teacherResult = await teacherAgent(body.topic, mode, body.followUp, body.history);
    const question = body.question?.trim() || teacherResult.question;
    const answer = body.answer?.trim() || '';
    const hasAnswer = answer.length > 0;

    let answerEvaluation: AnswerEvaluation | undefined = undefined;
    if (hasAnswer) {
      answerEvaluation = await evaluateStudentAnswer({
        topic: body.topic,
        question,
        answer,
        responseTime: body.responseTime
      });
    }

    const cognitiveResult = hasAnswer
      ? cognitiveAgent({
          topic: body.topic,
          question,
          answer,
          responseTime: body.responseTime
        })
      : {
          correctness: 0.5,
          confidence: 0.5,
          understandingLevel: 'medium' as const,
          reasoning: 'No answer submitted yet, so the system is waiting for your response.'
        };

    const effectiveConfidence = answerEvaluation ? answerEvaluation.score / 100 : cognitiveResult.confidence;
    const adaptiveResult = adaptiveAgent(effectiveConfidence);
    const mentorResult = await mentorAgent({
      topic: body.topic,
      confidence: effectiveConfidence,
      level: adaptiveResult.level,
      answer,
      question
    });
    const evaluationResult = evaluationAgent({ confidence: effectiveConfidence });
    const finalScore = answerEvaluation ? answerEvaluation.score : evaluationResult.score;
    const recentHistory = await getRecentLearningSessions(uid);
    const analysisResult = analysisAgent({
      topic: body.topic,
      confidence: effectiveConfidence,
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
      confidence: effectiveConfidence,
      score: finalScore,
      responseTime: body.responseTime,
      weakTopics: analysisResult.weakTopics,
      strongTopics: analysisResult.strongTopics,
      question,
      feedback: answerEvaluation ? answerEvaluation.teacherAdvice : mentorResult.feedback,
      level: adaptiveResult.level,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      explanation: teacherResult.explanation,
      example: teacherResult.example,
      question,
      misconceptions: teacherResult.misconceptions,
      keyTakeaways: teacherResult.keyTakeaways,
      mode: teacherResult.mode || mode,
      confidence: effectiveConfidence,
      level: adaptiveResult.level,
      feedback: answerEvaluation ? answerEvaluation.teacherAdvice : hasAnswer ? mentorResult.feedback : 'Generate an answer to receive personalized mentor feedback.',
      weak_topics: analysisResult.weakTopics,
      evaluation: answerEvaluation,
      meta: {
        correctness: answerEvaluation ? answerEvaluation.score / 100 : cognitiveResult.correctness,
        understanding: cognitiveResult.understandingLevel,
        score: finalScore,
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
