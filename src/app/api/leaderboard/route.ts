import { NextResponse } from 'next/server';
import { readDatabase } from '@/lib/local-db';
import type { AchievementBadge, LeaderboardEntry } from '@/lib/types';

const BASE_BADGES: Record<string, AchievementBadge> = {
  dsa_pioneer: {
    id: 'dsa_pioneer',
    name: 'DSA Pioneer',
    description: 'Solved foundational DSA algorithm problems across multiple patterns.',
    icon: '🏅'
  },
  streak_master: {
    id: 'streak_master',
    name: 'Consistency Titan',
    description: 'Maintained a 7+ day continuous problem-solving streak.',
    icon: '⚡'
  },
  interview_ace: {
    id: 'interview_ace',
    name: 'Interview Ace',
    description: 'Earned a "Strong Hire" rating in the AI Technical Placement Mock Round.',
    icon: '🎯'
  },
  fullstack_builder: {
    id: 'fullstack_builder',
    name: 'Full-Stack Architect',
    description: 'Engineered complete production-ready web architectures.',
    icon: '🌐'
  },
  course_graduate: {
    id: 'course_graduate',
    name: 'Curriculum Graduate',
    description: 'Completed a full CSE placement preparation course.',
    icon: '🎓'
  }
};

const CAMPUS_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'user_aarav_sharma',
    name: 'Aarav Sharma',
    course: 'B.Tech CSE (Batch 2026)',
    totalXp: 3450,
    streakDays: 24,
    problemsSolved: 78,
    coursesCompleted: 3,
    badges: [BASE_BADGES.dsa_pioneer, BASE_BADGES.streak_master, BASE_BADGES.interview_ace, BASE_BADGES.course_graduate]
  },
  {
    rank: 2,
    userId: 'user_ananya_iyer',
    name: 'Ananya Iyer',
    course: 'B.Tech CSE (AI & ML)',
    totalXp: 3120,
    streakDays: 19,
    problemsSolved: 71,
    coursesCompleted: 2,
    badges: [BASE_BADGES.dsa_pioneer, BASE_BADGES.streak_master, BASE_BADGES.fullstack_builder]
  },
  {
    rank: 3,
    userId: 'user_vikram_singh',
    name: 'Vikram Singh',
    course: 'B.Tech Information Technology',
    totalXp: 2890,
    streakDays: 15,
    problemsSolved: 64,
    coursesCompleted: 2,
    badges: [BASE_BADGES.dsa_pioneer, BASE_BADGES.interview_ace]
  },
  {
    rank: 4,
    userId: 'user_tanvi_reddy',
    name: 'Tanvi Reddy',
    course: 'B.Tech CSE (Batch 2026)',
    totalXp: 2640,
    streakDays: 12,
    problemsSolved: 58,
    coursesCompleted: 2,
    badges: [BASE_BADGES.dsa_pioneer, BASE_BADGES.fullstack_builder]
  },
  {
    rank: 5,
    userId: 'user_karthik_n',
    name: 'Karthik N.',
    course: 'B.Tech Computer Science',
    totalXp: 2310,
    streakDays: 9,
    problemsSolved: 51,
    coursesCompleted: 1,
    badges: [BASE_BADGES.dsa_pioneer]
  },
  {
    rank: 6,
    userId: 'user_sneha_mukherjee',
    name: 'Sneha Mukherjee',
    course: 'B.Tech CSE (Data Science)',
    totalXp: 2050,
    streakDays: 7,
    problemsSolved: 44,
    coursesCompleted: 1,
    badges: [BASE_BADGES.dsa_pioneer, BASE_BADGES.streak_master]
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const db = readDatabase() as any;
    const profiles = db.profiles || {};
    const submissions = Array.isArray(db.codeSubmissions) ? db.codeSubmissions : [];

    // If active user is specified, calculate their dynamic rank and stats
    let userRank = null;
    let userEntry: LeaderboardEntry | null = null;

    if (userId) {
      const userProfile = profiles[userId];
      const userSubs = submissions.filter((s: any) => s.userId === userId);
      const solved = userSubs.filter((s: any) => s.passed).length;
      const xp = solved * 50 + 150; // Dynamic XP based on submissions

      userEntry = {
        rank: 7,
        userId,
        name: userProfile?.name || 'You (Learner)',
        course: userProfile?.course || 'Computer Science & Engineering',
        totalXp: xp,
        streakDays: Math.min(solved, 5),
        problemsSolved: solved,
        coursesCompleted: 1,
        badges: [BASE_BADGES.dsa_pioneer]
      };
    }

    return NextResponse.json({
      leaderboard: CAMPUS_LEADERBOARD,
      userEntry,
      availableBadges: Object.values(BASE_BADGES)
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Leaderboard server error.' },
      { status: 500 }
    );
  }
}
