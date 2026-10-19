'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Code2,
  ExternalLink,
  Filter,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Tag,
  ThumbsUp,
  User,
  Users,
  X
} from 'lucide-react';
import { getCurrentUnifiedUser } from '@/lib/firebase';
import type { CommunityReply, CommunityThread } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';

const CATEGORIES = ['All', 'DSA & Coding', 'Web Development', 'Core CS', 'Placement Experiences'] as const;

export default function CommunityPage() {
  const [threads, setThreads] = useState<CommunityThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);

  // New doubt modal state
  const [showAskModal, setShowAskModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<string>('DSA & Coding');
  const [newContent, setNewContent] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newTags, setNewTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/community');
      if (!res.ok) throw new Error('Failed to load community threads.');
      const data = await res.json();
      setThreads(data.threads || []);
      if (data.threads?.length > 0 && !expandedThreadId) {
        setExpandedThreadId(data.threads[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchThreads();
  }, []);

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCat;
      const matchesText =
        t.title.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query));
      return matchesCat && matchesText;
    });
  }, [threads, selectedCategory, searchQuery]);

  const handleUpvote = async (threadId: string) => {
    try {
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, upvotes: t.upvotes + 1 } : t))
      );
      await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote', threadId })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setError('Please provide a title and detailed question.');
      return;
    }

    setSubmitting(true);
    setError(null);
    const user = getCurrentUnifiedUser();

    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          title: newTitle.trim(),
          category: newCategory,
          authorName: user?.displayName || 'Student Learner',
          authorCourse: 'Computer Science & Engineering',
          content: newContent.trim(),
          codeSnippet: newCode.trim() || undefined,
          tags: newTags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        })
      });

      if (!res.ok) throw new Error('Failed to post doubt.');
      const data = await res.json();
      if (data.thread) {
        setThreads((prev) => [data.thread, ...prev]);
        setExpandedThreadId(data.thread.id);
        setShowAskModal(false);
        setNewTitle('');
        setNewContent('');
        setNewCode('');
        setNewTags('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit question.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl shadow-cyan-950/20">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                <Users className="h-3.5 w-3.5" />
                Peer & Professor Q&A
              </span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Instant AI Solution Generation
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Placement Doubt Resolution Forum
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 leading-relaxed">
              Ask coding doubts, discuss placement test cases, and explore interview experiences.
              Every posted question is immediately answered by our live AI Professor with step-by-step logic.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAskModal(true)}
            className="btn-primary rounded-2xl px-6 py-3.5 text-sm font-semibold shadow-lg shadow-cyan-500/25 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Ask a Doubt
          </button>
        </div>

        {/* Search */}
        <div className="relative z-10 mt-6 max-w-xl">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search community doubts, algorithms, or topics (e.g. 'Sliding Window', 'React hooks')..."
              className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/60 placeholder:text-slate-500"
            />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-md shadow-violet-500/20'
                : 'border border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Threads List */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-12 text-center text-slate-400">
            <LoadingSpinner />
            <p className="mt-3 text-xs">Loading community discussion threads...</p>
          </div>
        ) : filteredThreads.length > 0 ? (
          filteredThreads.map((thread) => {
            const isExpanded = expandedThreadId === thread.id;
            return (
              <motion.article
                key={thread.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 backdrop-blur transition hover:border-white/20"
              >
                {/* Thread Header */}
                <div
                  onClick={() => setExpandedThreadId(isExpanded ? null : thread.id)}
                  className="cursor-pointer p-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-3 py-0.5 text-[11px] font-semibold text-cyan-300">
                        {thread.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        Asked by <strong className="text-slate-200">{thread.authorName}</strong> ({thread.authorCourse})
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white hover:text-cyan-200 transition">
                      {thread.title}
                    </h2>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {thread.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {thread.tags.map((t) => (
                        <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleUpvote(thread.id);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-cyan-500/15 hover:border-cyan-400/40 hover:text-cyan-200 transition"
                    >
                      <ThumbsUp className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{thread.upvotes}</span>
                    </button>

                    <span className="inline-flex items-center gap-1 rounded-xl bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                      <MessageSquare className="h-3.5 w-3.5 text-violet-400" />
                      <span>{thread.replies.length} replies</span>
                    </span>
                  </div>
                </div>

                {/* Expanded Thread Body & Replies */}
                <AnimatePresence>
                  {isExpanded ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/10 bg-slate-900/40 px-6 py-5 space-y-4"
                    >
                      {/* Full question details */}
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs text-slate-200 leading-relaxed space-y-3">
                        <p className="whitespace-pre-wrap">{thread.content}</p>
                        {thread.codeSnippet ? (
                          <pre className="overflow-x-auto rounded-xl bg-black/60 p-3 font-mono text-xs text-emerald-300 border border-white/10">
                            {thread.codeSnippet}
                          </pre>
                        ) : null}
                      </div>

                      {/* Verified AI Professor Replies */}
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          Verified Professor Solutions & Discussion
                        </p>

                        {thread.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`rounded-2xl p-4 text-xs leading-relaxed ${
                              reply.isAiTeacher
                                ? 'border border-cyan-500/30 bg-cyan-950/20 text-slate-100 shadow-md'
                                : 'border border-white/10 bg-slate-950/60 text-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                              <span className="font-bold flex items-center gap-1.5 text-cyan-200">
                                {reply.isAiTeacher ? <Bot className="h-3.5 w-3.5 text-cyan-400" /> : <User className="h-3.5 w-3.5" />}
                                {reply.authorName}
                                {reply.isAiTeacher ? (
                                  <span className="rounded-full bg-cyan-400/20 px-2 py-0.2 text-[9px] font-semibold text-cyan-300">
                                    Verified Faculty AI
                                  </span>
                                ) : null}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="whitespace-pre-wrap leading-relaxed">{reply.content}</div>

                            {reply.codeSnippet ? (
                              <pre className="mt-2 overflow-x-auto rounded-xl bg-black/60 p-3 font-mono text-xs text-emerald-300 border border-white/10">
                                {reply.codeSnippet}
                              </pre>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.article>
            );
          })
        ) : (
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-12 text-center text-slate-400">
            No discussion threads found. Click &quot;Ask a Doubt&quot; to submit your question and receive an instant AI Professor solution!
          </div>
        )}
      </div>

      {/* Ask Doubt Modal */}
      <AnimatePresence>
        {showAskModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl rounded-[2.5rem] border border-cyan-500/40 bg-slate-950 p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setShowAskModal(false)}
                className="absolute top-6 right-6 h-8 w-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="border-b border-white/10 pb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Community Q&A
                </span>
                <h2 className="mt-1 text-2xl font-bold text-white">Ask a Technical Doubt</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Our live AI Professor will automatically formulate an authoritative, step-by-step verified solution!
                </p>
              </div>

              <form onSubmit={handlePostDoubt} className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wider">
                    Doubt Title / Core Question
                  </span>
                  <input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Why does my QuickSort hit O(n²) worst-case on already sorted arrays?"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wider">
                      Category
                    </span>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                    >
                      <option value="DSA & Coding">DSA & Coding</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Core CS">Core CS (OS, DBMS, CN)</option>
                      <option value="Placement Experiences">Placement Experiences</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wider">
                      Tags (Comma separated)
                    </span>
                    <input
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="e.g. QuickSort, Recursion, Big-O"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wider">
                    Detailed Explanation of your Doubt
                  </span>
                  <textarea
                    required
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Describe your confusion, what you have tried, and where you are getting stuck..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 p-3 text-xs text-white outline-none focus:border-cyan-400/60 resize-none"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wider">
                    Code Snippet (Optional)
                  </span>
                  <textarea
                    rows={4}
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Paste your implementation here..."
                    className="w-full rounded-xl border border-white/15 bg-black/60 p-3 font-mono text-xs text-emerald-300 outline-none focus:border-cyan-400/60 resize-none"
                  />
                </label>

                {error ? <p className="text-xs text-rose-300">{error}</p> : null}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAskModal(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary rounded-xl px-6 py-2.5 text-xs font-semibold shadow-lg shadow-cyan-500/25"
                  >
                    {submitting ? 'Generating AI Professor Solution...' : 'Post Question'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
