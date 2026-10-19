'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  Layers,
  Lightbulb,
  Network,
  Search,
  Sparkles,
  Terminal,
  Zap
} from 'lucide-react';
import { PLACEMENT_CHEAT_SHEETS } from '@/lib/cheat-sheets-data';

const CATEGORIES = [
  { id: 'All', label: 'All Topics', icon: Sparkles },
  { id: 'Top 75 DSA Patterns', label: 'Top 75 DSA Patterns', icon: Code2 },
  { id: 'Operating Systems', label: 'Operating Systems (OS)', icon: Cpu },
  { id: 'DBMS & SQL', label: 'DBMS & SQL', icon: Database },
  { id: 'Computer Networks', label: 'Computer Networks (CN)', icon: Network },
  { id: 'System Design', label: 'System Design Core', icon: Layers }
];

export default function CheatSheetsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSheets = useMemo(() => {
    return PLACEMENT_CHEAT_SHEETS.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;
      const matchesText =
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.keyPoints.some((p) => p.toLowerCase().includes(query)) ||
        (item.interviewTip && item.interviewTip.toLowerCase().includes(query));
      return matchesCategory && matchesText;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl shadow-cyan-950/20">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <Zap className="h-3.5 w-3.5" />
              High-Yield Revision
            </span>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Tier-1 Placement Cheat Sheets
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Placement Roadmaps & CS Core Cheat Sheets
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Essential high-yield revision formulas, architectural trade-offs, and algorithms.
            Designed for quick review 24 hours before your campus coding rounds and technical interviews.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative z-10 mt-6 max-w-xl">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, patterns, algorithms (e.g. 'Sliding Window', 'Paging', 'ACID', 'TCP')..."
              className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/60 placeholder:text-slate-500"
            />
          </div>
        </div>
      </section>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Cheat Sheets Content Grid */}
      <div className="grid gap-6">
        {filteredSheets.length > 0 ? (
          filteredSheets.map((sheet, index) => (
            <motion.article
              key={sheet.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.35 }}
              className="group relative rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 backdrop-blur transition hover:border-cyan-400/30 hover:bg-slate-950/90"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 text-xs font-semibold text-cyan-300">
                    {sheet.category}
                  </span>
                  <h2 className="text-xl font-bold text-white group-hover:text-cyan-200 transition">
                    {sheet.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {sheet.complexity ? (
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="rounded-lg bg-emerald-500/15 border border-emerald-400/20 px-2 py-0.5 text-emerald-300">
                        Time: {sheet.complexity.time}
                      </span>
                      <span className="rounded-lg bg-blue-500/15 border border-blue-400/20 px-2 py-0.5 text-blue-300">
                        Space: {sheet.complexity.space}
                      </span>
                    </div>
                  ) : null}

                  <Link
                    href={`/learn?topic=${encodeURIComponent(sheet.title)}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-cyan-500/10 hover:border-cyan-400/30 hover:text-cyan-200 transition"
                  >
                    <span>Deep Dive with AI</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-300 leading-relaxed font-medium">
                {sheet.summary}
              </p>

              {/* Key Placement Points */}
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Key Technical Points:
                </p>
                <ul className="space-y-1.5 text-xs text-slate-200 leading-relaxed">
                  {sheet.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Code Snippet Box (if applicable) */}
              {sheet.codeSnippet ? (
                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/60">
                  <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2">
                    <span className="text-xs font-mono font-semibold text-cyan-300 uppercase">
                      Canonical {sheet.codeSnippet.language} Implementation
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(sheet.id, sheet.codeSnippet!.code)}
                      className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:text-white transition"
                    >
                      {copiedId === sheet.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-300">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                    {sheet.codeSnippet.code}
                  </pre>
                </div>
              ) : null}

              {/* Interview Tip */}
              {sheet.interviewTip ? (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
                  <Lightbulb className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-semibold uppercase tracking-wider text-amber-300 block mb-0.5">
                      Interview Placement Pro-Tip:
                    </span>
                    {sheet.interviewTip}
                  </div>
                </div>
              ) : null}
            </motion.article>
          ))
        ) : (
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-12 text-center text-slate-400">
            No cheat sheets matched your search &quot;{searchQuery}&quot;. Try searching for another topic or clear the filter.
          </div>
        )}
      </div>
    </div>
  );
}
