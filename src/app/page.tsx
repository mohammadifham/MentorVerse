import Link from 'next/link';
import type { ComponentType } from 'react';
import { ArrowRight, Bot, Brain, LineChart, ShieldCheck } from 'lucide-react';

const highlights = [
  {
    title: 'Teacher, cognitive, and mentor agents',
    description: 'Each lesson is explained, evaluated, and reinforced by specialized AI roles.'
  },
  {
    title: 'Supabase-backed persistence',
    description: 'Progress, confidence, weak topics, and session history are stored for analysis.'
  },
  {
    title: 'Firebase authentication',
    description: 'Learners can sign in with Google to keep sessions tied to a user identity.'
  }
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-hero-radial px-6 py-16 shadow-2xl shadow-violet-900/20 sm:px-10 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-100">
              <ShieldCheck className="h-4 w-4" />
              Production-ready learning platform
            </span>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-white md:text-6xl">
              MentorVerse
            </h1>
            <p className="max-w-2xl text-xl text-slate-300">Multi-Agent AI Learning Ecosystem for adaptive study, live feedback, and attention-aware tutoring.</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 font-medium text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01]"
              >
                Start Learning
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition hover:border-cyan-400/50 hover:bg-white/10"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 backdrop-blur">
            <FeatureRow icon={Bot} title="Teacher Agent" text="Generates explanations and questions." />
            <FeatureRow icon={Brain} title="Cognitive Agent" text="Estimates confidence and understanding." />
            <FeatureRow icon={LineChart} title="Analysis Agent" text="Identifies weak and strong topics." />
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {highlights.map((item) => (
          <article key={item.title} className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-black/10 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function FeatureRow({ icon: Icon, title, text }: { icon: ComponentType<{ className?: string }>; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-200">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-300">{text}</p>
      </div>
    </div>
  );
}
