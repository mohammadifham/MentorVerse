import { getDashboardSummary } from '@/lib/dashboard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const maxValue = Math.max(...summary.trend.map((entry) => entry.value), 100);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-violet-900/20 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Learner dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Progress and performance overview</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Track your score, identify weak and strong topics, and monitor the trend of recent study sessions.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Score" value={`${summary.score}`} helper="Average mastery score" />
        <MetricCard title="Sessions" value={`${summary.sessionCount}`} helper="Recorded study sessions" />
        <MetricCard title="Weak Topics" value={`${summary.weakTopics.length}`} helper={summary.weakTopics.join(', ') || 'No weak topics'} />
        <MetricCard title="Strong Topics" value={`${summary.strongTopics.length}`} helper={summary.strongTopics.join(', ') || 'No strong topics'} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Learning trend</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Recent performance trend</h2>
            </div>
            <p className="text-sm text-slate-400">Improving over time</p>
          </div>
          <div className="mt-6 space-y-4">
            {summary.trend.map((entry) => (
              <div key={entry.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{entry.label}</span>
                  <span>{entry.value}</span>
                </div>
                <div className="h-3 rounded-full bg-white/5">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all"
                    style={{ width: `${Math.max(12, Math.round((entry.value / maxValue) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Topic insights</p>
          <div className="mt-5 space-y-5">
            <InsightBlock title="Weak topics" items={summary.weakTopics} tone="amber" />
            <InsightBlock title="Strong topics" items={summary.strongTopics} tone="emerald" />
          </div>
        </article>
      </section>
    </div>
  );
}

function MetricCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
    </div>
  );
}

function InsightBlock({ title, items, tone }: { title: string; items: string[]; tone: 'amber' | 'emerald' }) {
  const toneClasses = tone === 'amber' ? 'border-amber-400/20 bg-amber-400/10 text-amber-100' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100';
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span key={item} className={`rounded-full border px-3 py-1 text-sm ${toneClasses}`}>
              {item}
            </span>
          ))
        ) : (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">No items yet</span>
        )}
      </div>
    </div>
  );
}
