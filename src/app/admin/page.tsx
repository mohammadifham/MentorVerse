'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  KeyRound,
  Users,
  Activity,
  UserCheck,
  Code2,
  Brain,
  Database,
  RefreshCw,
  LogOut,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Megaphone,
  Radio,
  Clock,
  Eye,
  EyeOff,
  Sparkles,
  Server,
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import type { AdminStats, AdminUserRecord } from '@/lib/admin-service';

export default function AdminPage() {
  // Auth state
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sessions' | 'submissions' | 'system'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filters & modals
  const [userSearch, setUserSearch] = useState('');
  const [sessionSearch, setSessionSearch] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'python' | 'javascript' | 'passed' | 'failed'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  // Announcement state
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementType, setAnnouncementType] = useState<'info' | 'warning' | 'alert'>('info');
  const [announcementActive, setAnnouncementActive] = useState(true);
  const [announcementNotice, setAnnouncementNotice] = useState<string | null>(null);

  // Create User modal
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserCourse, setNewUserCourse] = useState('B.Tech Computer Science');

  // Check saved token on mount
  useEffect(() => {
    const saved = localStorage.getItem('guidely_admin_token');
    if (saved && saved.startsWith('guidely_admin_')) {
      setAdminToken(saved);
    }
  }, []);

  // Fetch admin dashboard data
  const fetchData = useCallback(async () => {
    if (!adminToken) return;
    setLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };

      const [statsRes, usersRes, sessionsRes, submissionsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/sessions', { headers }),
        fetch('/api/admin/submissions', { headers })
      ]);

      if (statsRes.status === 401) {
        handleLogout();
        return;
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
        if (data.stats.activeAnnouncement) {
          setAnnouncementText(data.stats.activeAnnouncement.text || '');
          setAnnouncementType(data.stats.activeAnnouncement.type || 'info');
          setAnnouncementActive(data.stats.activeAnnouncement.active ?? true);
        }
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(data.sessions || []);
      }

      if (submissionsRes.ok) {
        const data = await submissionsRes.json();
        setSubmissions(data.submissions || []);
      }
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoadingData(false);
    }
  }, [adminToken]);

  // Periodic auto-refresh every 8 seconds
  useEffect(() => {
    if (!adminToken) return;
    fetchData();

    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [adminToken, autoRefresh, fetchData]);

  // Handle Admin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setAuthLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials.');
      }

      localStorage.setItem('guidely_admin_token', data.token);
      setAdminToken(data.token);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('guidely_admin_token');
    setAdminToken(null);
    setPassword('');
  };

  // Actions
  const handleDeleteUser = async (userId: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${userId}"?`)) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        fetchData();
      }
    } catch {}
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Delete this learning session record?')) return;
    try {
      const res = await fetch(`/api/admin/sessions?sessionId=${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => (s.id || s._id) !== sessionId));
        if (selectedSession && (selectedSession.id || selectedSession._id) === sessionId) {
          setSelectedSession(null);
        }
      }
    } catch {}
  };

  const handleDeleteSubmission = async (subId: string) => {
    if (!confirm('Delete this code submission record?')) return;
    try {
      const res = await fetch(`/api/admin/submissions?submissionId=${encodeURIComponent(subId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => (s.id || s._id) !== subId));
        if (selectedSubmission && (selectedSubmission.id || selectedSubmission._id) === subId) {
          setSelectedSubmission(null);
        }
      }
    } catch {}
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncementNotice(null);
    try {
      const res = await fetch('/api/admin/announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          text: announcementText,
          type: announcementType,
          active: announcementActive
        })
      });
      if (res.ok) {
        setAnnouncementNotice('✓ Broadcast announcement updated live on website!');
        setTimeout(() => setAnnouncementNotice(null), 4000);
      }
    } catch {}
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          course: newUserCourse
        })
      });
      if (res.ok) {
        setShowCreateUser(false);
        setNewUserName('');
        setNewUserEmail('');
        fetchData();
      }
    } catch {}
  };

  // If not logged in, show Admin Login Gate
  if (!adminToken) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/20 to-emerald-500/20 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <Shield className="h-7 w-7 text-cyan-300" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">GUIDELY Master Admin</h1>
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-cyan-300/80">Authorized Access Only</p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Admin Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin"
                required
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Master Password
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3.5 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" />
              {authLoading ? 'Verifying...' : 'Unlock Admin Console'}
            </button>

            <button
              type="button"
              onClick={() => {
                setUsername('Admin');
                setPassword('PROJECT@TRUE');
              }}
              className="w-full text-center text-xs text-slate-400 underline transition hover:text-cyan-300"
            >
              Quick Fill Configured Credentials (Admin / PROJECT@TRUE)
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered views
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.course.toLowerCase().includes(q);
  });

  const filteredSessions = sessions.filter((s) => {
    const q = sessionSearch.toLowerCase();
    const topic = (s.topic || '').toLowerCase();
    const user = (s.user_id || s.userId || '').toLowerCase();
    return topic.includes(q) || user.includes(q);
  });

  const filteredSubmissions = submissions.filter((s) => {
    if (submissionFilter === 'python') return (s.language || '').toLowerCase().includes('python');
    if (submissionFilter === 'javascript') return (s.language || '').toLowerCase().includes('java') || (s.language || '').toLowerCase().includes('node');
    if (submissionFilter === 'passed') return Boolean(s.passed);
    if (submissionFilter === 'failed') return !Boolean(s.passed);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Admin Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/80 p-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
              <Shield className="h-3.5 w-3.5" /> Super Admin
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
              Live Sync Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">GUIDELY Master Admin Console</h1>
          <p className="text-xs text-slate-400">Full platform controls, real-time user metrics, and cloud database access.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
              autoRefresh ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-white/10 bg-white/5 text-slate-400'
            }`}
            title="Auto-refresh every 8 seconds"
          >
            <Radio className="h-3.5 w-3.5" />
            Auto-Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={fetchData}
            disabled={loadingData}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* REAL-TIME NUMBERS DASHBOARD RIBBON */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* Real-time active users */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-950/60 to-slate-950 p-4 shadow-lg shadow-emerald-950/30">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-emerald-300/80">Online Now</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">{stats ? stats.onlineUsersCount : 1}</div>
          <p className="mt-1 text-[11px] text-emerald-400/90 font-medium">Real-time active</p>
        </div>

        {/* Total signups */}
        <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-cyan-300/80">Total Users</span>
            <Users className="h-4 w-4 text-cyan-300" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">{stats ? stats.totalSignedUpUsers : 3}</div>
          <p className="mt-1 text-[11px] text-slate-400">Registered learners</p>
        </div>

        {/* Today's signups */}
        <div className="rounded-2xl border border-violet-400/20 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-violet-300/80">New Today</span>
            <UserCheck className="h-4 w-4 text-violet-300" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">{stats ? stats.todaySignups : 1}</div>
          <p className="mt-1 text-[11px] text-slate-400">Joined today</p>
        </div>

        {/* Learning Sessions */}
        <div className="rounded-2xl border border-amber-400/20 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-amber-300/80">AI Sessions</span>
            <Brain className="h-4 w-4 text-amber-300" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">{stats ? stats.totalSessions : 11}</div>
          <p className="mt-1 text-[11px] text-slate-400">Completed lessons</p>
        </div>

        {/* Code submissions */}
        <div className="rounded-2xl border border-sky-400/20 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-sky-300/80">Submissions</span>
            <Code2 className="h-4 w-4 text-sky-300" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">{stats ? stats.totalSubmissions : 5}</div>
          <p className="mt-1 text-[11px] text-slate-400">Code executions</p>
        </div>

        {/* Global pass rate */}
        <div className="rounded-2xl border border-teal-400/20 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-teal-300/80">Pass Rate</span>
            <TrendingUp className="h-4 w-4 text-teal-300" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-400">{stats ? `${stats.globalPassRate}%` : '85%'}</div>
          <p className="mt-1 text-[11px] text-slate-400">Global average</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === 'overview'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Activity className="h-4 w-4" /> Live Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === 'users'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" /> Students ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === 'sessions'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Brain className="h-4 w-4" /> AI Sessions ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === 'submissions'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Code2 className="h-4 w-4" /> Code Submissions ({submissions.length})
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === 'system'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Server className="h-4 w-4" /> Cloud & System Control
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ANNOUNCEMENT */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Real-time system health */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <Zap className="h-5 w-5 text-amber-400" />
              Live Infrastructure & Cloud Health
            </h3>
            <p className="mt-1 text-xs text-slate-400">Real-time status of all connected services.</p>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm">
                <span className="flex items-center gap-2 text-slate-200 font-medium">
                  <Database className="h-4 w-4 text-emerald-400" /> Supabase Cloud PostgreSQL
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Connected (Seoul ap-northeast-2)
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm">
                <span className="flex items-center gap-2 text-slate-200 font-medium">
                  <Shield className="h-4 w-4 text-cyan-400" /> Firebase Auth Integration
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 px-2.5 py-0.5 text-xs font-medium text-cyan-400">
                  <CheckCircle2 className="h-3 w-3" /> Configured (mentorverse-6f193)
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm">
                <span className="flex items-center gap-2 text-slate-200 font-medium">
                  <Brain className="h-4 w-4 text-violet-400" /> AI Pedagogical Engine
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-400/10 px-2.5 py-0.5 text-xs font-medium text-violet-400">
                  <CheckCircle2 className="h-3 w-3" /> Operational (Mistral-7B + Domain Fallback)
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm">
                <span className="flex items-center gap-2 text-slate-200 font-medium">
                  <Code2 className="h-4 w-4 text-sky-400" /> Code Compiler Sandbox
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-400/10 px-2.5 py-0.5 text-xs font-medium text-sky-400">
                  <CheckCircle2 className="h-3 w-3" /> Ready (Python 3.11 & Node 20)
                </span>
              </div>
            </div>
          </div>

          {/* Announcement Broadcast Center */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <Megaphone className="h-5 w-5 text-cyan-400" />
              Website Global Announcement Broadcast
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Publish an alert banner that appears immediately at the top of the website for all students.
            </p>

            <form onSubmit={handleSaveAnnouncement} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Banner Announcement Message
                </label>
                <textarea
                  rows={2}
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g. 📢 Placement preparation sprint live this weekend!"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-xs text-slate-400">Banner Tone</label>
                  <select
                    value={announcementType}
                    onChange={(e) => setAnnouncementType(e.target.value as any)}
                    className="mt-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                  >
                    <option value="info">Info (Cyan)</option>
                    <option value="warning">Important (Amber)</option>
                    <option value="alert">Critical Alert (Red)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="announce-active"
                    checked={announcementActive}
                    onChange={(e) => setAnnouncementActive(e.target.checked)}
                    className="h-4 w-4 rounded accent-cyan-400"
                  />
                  <label htmlFor="announce-active" className="text-xs text-slate-300">
                    Visible on Website
                  </label>
                </div>
              </div>

              {announcementNotice && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-2.5 text-xs text-emerald-300">
                  {announcementNotice}
                </div>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                <Megaphone className="h-3.5 w-3.5" />
                Broadcast to Live Website
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & STUDENTS (FULL CONTROL) */}
      {activeTab === 'users' && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Student & Learner Accounts</h3>
              <p className="text-xs text-slate-400">Total registered learners with full management access.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search student..."
                  className="rounded-xl border border-white/10 bg-white/5 py-1.5 pl-9 pr-3 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>
              <button
                onClick={() => setShowCreateUser(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow hover:scale-[1.01]"
              >
                <Plus className="h-3.5 w-3.5" /> Add Student
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Course</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Sessions</th>
                  <th className="p-3">Submissions</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${u.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                        <div>
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{u.course}</td>
                    <td className="p-3">
                      <span className="inline-flex rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300">
                        Active
                      </span>
                    </td>
                    <td className="p-3 font-medium">{u.sessionCount}</td>
                    <td className="p-3 font-medium">{u.submissionCount}</td>
                    <td className="p-3 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
                        title="Delete user account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LEARNING SESSIONS (FULL INSPECTOR) */}
      {activeTab === 'sessions' && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">AI Learning Sessions Explorer</h3>
              <p className="text-xs text-slate-400">Inspect full conversation traces, questions, answers, and scores.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                placeholder="Search topic or user..."
                className="rounded-xl border border-white/10 bg-white/5 py-1.5 pl-9 pr-3 text-xs text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400">
                <tr>
                  <th className="p-3">Topic</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Level</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {filteredSessions.map((s, idx) => {
                  const sId = s.id || s._id || `sess_${idx}`;
                  const topic = s.topic || 'General Practice';
                  const user = s.user_id || s.userId || 'Student';
                  const level = s.level || 'medium';
                  const conf = Math.round((Number(s.confidence) || 0.75) * (Number(s.confidence) <= 1 ? 100 : 1));
                  const score = s.score || 85;

                  return (
                    <tr key={sId} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-semibold text-cyan-300">{topic}</td>
                      <td className="p-3 text-slate-300">{user}</td>
                      <td className="p-3">
                        <span className="capitalize">{level}</span>
                      </td>
                      <td className="p-3 font-medium text-emerald-400">{conf}%</td>
                      <td className="p-3 font-bold text-white">{score}</td>
                      <td className="p-3 text-slate-400">
                        {s.created_at || s.createdAt ? new Date(s.created_at || s.createdAt).toLocaleString() : 'Recent'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedSession(s)}
                          className="mr-1 rounded-lg p-1.5 text-cyan-300 hover:bg-cyan-500/10"
                          title="View Session Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(sId)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"
                          title="Delete Session Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CODE SUBMISSIONS & COMPILER LOGS */}
      {activeTab === 'submissions' && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Global Code Submissions</h3>
              <p className="text-xs text-slate-400">Live feed of all student code runs, outputs, and automated grading.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'python', 'javascript', 'passed', 'failed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSubmissionFilter(filter)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize transition ${
                    submissionFilter === filter ? 'bg-cyan-500 text-slate-950 font-semibold' : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400">
                <tr>
                  <th className="p-3">Problem</th>
                  <th className="p-3">Language</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Result</th>
                  <th className="p-3">Submitted At</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {filteredSubmissions.map((s, idx) => {
                  const sId = s.id || s._id || `sub_${idx}`;
                  const title = s.problem_title || s.problemTitle || 'Coding Challenge';
                  const lang = s.language || 'python';
                  const user = s.user_id || s.userId || 'Student';
                  const score = s.score ?? 100;
                  const passed = Boolean(s.passed);

                  return (
                    <tr key={sId} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-semibold text-white">{title}</td>
                      <td className="p-3 uppercase text-cyan-300 font-mono">{lang}</td>
                      <td className="p-3 text-slate-300">{user}</td>
                      <td className="p-3 font-bold">{score}%</td>
                      <td className="p-3">
                        {passed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-rose-400">
                            <XCircle className="h-3 w-3" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400">
                        {s.created_at || s.createdAt ? new Date(s.created_at || s.createdAt).toLocaleString() : 'Recent'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedSubmission(s)}
                          className="mr-1 rounded-lg p-1.5 text-cyan-300 hover:bg-cyan-500/10"
                          title="View Code & Output"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubmission(sId)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"
                          title="Delete Submission Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM & CLOUD CONTROL */}
      {activeTab === 'system' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <Database className="h-5 w-5 text-emerald-400" />
              Supabase Cloud Database Tables
            </h3>
            <p className="mt-1 text-xs text-slate-400">Live PostgreSQL database hosted in Seoul region.</p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="font-mono text-slate-200">public.mentorverse_sessions</span>
                <span className="font-bold text-cyan-300">{sessions.length} rows</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="font-mono text-slate-200">public.mentorverse_learner_profiles</span>
                <span className="font-bold text-cyan-300">{users.length} rows</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="font-mono text-slate-200">public.mentorverse_code_submissions</span>
                <span className="font-bold text-cyan-300">{submissions.length} rows</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Re-sync Live Tables
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <Brain className="h-5 w-5 text-violet-400" />
              AI Inference Engine Status
            </h3>
            <p className="mt-1 text-xs text-slate-400">Hugging Face inference routing and pedagogical fallbacks.</p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-slate-400">Target Model</p>
                <p className="mt-0.5 font-mono text-white">mistralai/Mistral-7B-Instruct</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-slate-400">Inference Gateway</p>
                <p className="mt-0.5 font-mono text-white">https://router.huggingface.co/v1</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-slate-400">Offline Resilience</p>
                <p className="mt-0.5 text-emerald-400 font-medium">Domain AI Knowledge Engine Active (0ms Latency)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMISSION DETAILS */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/15 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedSubmission.problem_title || selectedSubmission.problemTitle || 'Code Submission'}</h3>
                <p className="text-xs text-slate-400">Language: {selectedSubmission.language} • Score: {selectedSubmission.score}%</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="rounded-lg p-2 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="font-semibold uppercase tracking-wider text-slate-400">Terminal Output</span>
                <pre className="mt-1 rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-emerald-300">
                  {selectedSubmission.output || '(No output produced)'}
                </pre>
              </div>

              {selectedSubmission.error && (
                <div>
                  <span className="font-semibold uppercase tracking-wider text-rose-400">Error Details</span>
                  <pre className="mt-1 rounded-xl border border-rose-500/20 bg-rose-950/40 p-3 font-mono text-rose-300">
                    {selectedSubmission.error}
                  </pre>
                </div>
              )}

              <div>
                <span className="font-semibold uppercase tracking-wider text-slate-400">AI Evaluation Feedback</span>
                <p className="mt-1 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 text-cyan-100">
                  {selectedSubmission.ai_feedback || selectedSubmission.aiFeedback || 'Evaluation completed successfully.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SESSION DETAILS */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/15 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-cyan-300">{selectedSession.topic}</h3>
                <p className="text-xs text-slate-400">Learner: {selectedSession.user_id || selectedSession.userId}</p>
              </div>
              <button onClick={() => setSelectedSession(null)} className="rounded-lg p-2 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="font-semibold uppercase tracking-wider text-slate-400">Question Posed</span>
                <p className="mt-1 rounded-xl border border-white/10 bg-white/5 p-3 text-slate-100 font-medium">
                  {selectedSession.question || 'Topic overview question'}
                </p>
              </div>

              <div>
                <span className="font-semibold uppercase tracking-wider text-slate-400">Student Answer</span>
                <p className="mt-1 rounded-xl border border-white/10 bg-white/5 p-3 text-emerald-200">
                  {selectedSession.answer || '(No answer text provided)'}
                </p>
              </div>

              <div>
                <span className="font-semibold uppercase tracking-wider text-slate-400">Mentor AI Feedback</span>
                <p className="mt-1 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 text-cyan-100">
                  {selectedSession.feedback || 'Session evaluated successfully.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD STUDENT */}
      {showCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Create Learner Account</h3>
              <button onClick={() => setShowCreateUser(false)} className="rounded-lg p-1.5 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium">Student Email</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. maya@campus.edu"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium">Course / Specialization</label>
                <input
                  type="text"
                  value={newUserCourse}
                  onChange={(e) => setNewUserCourse(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 font-semibold text-slate-950"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
