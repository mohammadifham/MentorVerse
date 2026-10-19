'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Award,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  GraduationCap,
  Printer,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy
} from 'lucide-react';
import { getCurrentUnifiedUser } from '@/lib/firebase';
import { PLACEMENT_COURSES } from '@/lib/courses-data';
import type { CourseCertificate } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function CertificatesPage() {
  const [selectedCourseId, setSelectedCourseId] = useState(PLACEMENT_COURSES[0].id);
  const [candidateName, setCandidateName] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<CourseCertificate | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const user = getCurrentUnifiedUser();
    const name = user?.displayName || 'Alex Rivera';
    setCandidateName(name);

    const uid = user?.uid || 'user_student';
    fetch(`/api/certificates?userId=${encodeURIComponent(uid)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.certificates && data.certificates.length > 0) {
          setCertificate(data.certificates[0]);
        }
      })
      .catch(() => {});
  }, []);

  const handleGenerateCertificate = async () => {
    if (!candidateName.trim()) return;
    setLoading(true);
    const user = getCurrentUnifiedUser();
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'user_student',
          studentName: candidateName.trim(),
          courseId: selectedCourseId,
          scorePercentage: 94
        })
      });

      if (!res.ok) throw new Error('Could not generate certificate.');
      const data = await res.json();
      if (data.certificate) {
        setCertificate(data.certificate);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (certificate) {
      navigator.clipboard.writeText(certificate.verificationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareLinkedIn = () => {
    if (!certificate) return;
    const url = encodeURIComponent(certificate.verificationUrl);
    const title = encodeURIComponent(
      `Excited to share that I have successfully completed the "${certificate.courseTitle}" curriculum on GUIDELY! 🎓🚀`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${title}`, '_blank');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <section className="print:hidden relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl shadow-cyan-950/20">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              <GraduationCap className="h-3.5 w-3.5" />
              Verified Credentials
            </span>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Placement Graduation
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Official Certificates of Completion
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Validate your mastery of data structures, algorithms, and production full-stack web development.
            Every certificate features an official cryptographic verification code for your LinkedIn profile and resume.
          </p>
        </div>
      </section>

      {/* Generator Form */}
      <section className="print:hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 sm:p-8 backdrop-blur">
        <h2 className="text-xl font-bold text-white mb-4">Claim or Generate Course Credential</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-end">
          <label className="block">
            <span className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wider">
              Student Full Name
            </span>
            <input
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wider">
              Select Placement Course
            </span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
            >
              {PLACEMENT_COURSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={handleGenerateCertificate}
            disabled={loading || !candidateName.trim()}
            className="btn-primary rounded-xl py-3 text-sm font-semibold shadow-lg shadow-cyan-500/25 transition hover:scale-[1.01] disabled:opacity-50"
          >
            <Award className="h-4 w-4" />
            {loading ? 'Issuing Certificate...' : 'Generate Official Certificate'}
          </button>
        </div>
      </section>

      {/* Official Certificate Viewport */}
      {certificate ? (
        <section className="space-y-4">
          <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] border border-white/10 rounded-2xl p-4">
            <span className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Certificate Issued Successfully (Credential ID: {certificate.id})
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedLink ? 'Copied' : 'Copy Credential Link'}
              </button>
              <button
                type="button"
                onClick={handleShareLinkedIn}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition shadow-md"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share on LinkedIn
              </button>
            </div>
          </div>

          {/* The Physical Certificate Card (Printable) */}
          <div
            id="printable-certificate"
            className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border-4 border-double border-amber-400/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-14 shadow-2xl text-center text-slate-100"
          >
            {/* Background luxury watermark */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.08),transparent_65%)]" />
            <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full border border-amber-400/20" />
            <div className="pointer-events-none absolute -right-12 -bottom-12 h-44 w-44 rounded-full border border-amber-400/20" />

            <div className="relative z-10 space-y-6">
              {/* Institution Emblem */}
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/20">
                  <div className="h-full w-full rounded-[14px] bg-slate-950 flex items-center justify-center font-black text-2xl text-amber-300">
                    G
                  </div>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.35em] text-amber-300/90 font-bold">
                  GUIDELY INSTITUTE OF ENGINEERING & AI
                </p>
                <p className="text-[11px] text-slate-400 tracking-widest uppercase">
                  Accredited Technical Placement Certification
                </p>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-3xl font-extrabold tracking-wide text-white uppercase sm:text-4xl">
                  Certificate of Achievement
                </h2>
                <p className="mt-2 text-xs font-serif italic text-slate-300">
                  This official document certifies that
                </p>
              </div>

              {/* Recipient Name */}
              <div className="py-2 border-b border-amber-400/30 max-w-lg mx-auto">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-100 font-serif">
                  {certificate.studentName}
                </h3>
              </div>

              {/* Description */}
              <p className="max-w-2xl mx-auto text-sm leading-relaxed text-slate-300">
                has successfully demonstrated comprehensive engineering rigor and completed all requirements for
              </p>

              {/* Course Title Badge */}
              <div className="inline-block rounded-2xl border border-amber-400/30 bg-amber-400/10 px-6 py-2.5">
                <h4 className="text-lg sm:text-xl font-bold text-amber-200">
                  {certificate.courseTitle}
                </h4>
                <p className="text-xs text-amber-300/80 font-mono mt-0.5">
                  Placement Specialization • Performance Score: {certificate.scorePercentage}%
                </p>
              </div>

              {/* Skills Badges */}
              <div className="max-w-xl mx-auto pt-2">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">
                  Competencies Mastered:
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {certificate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px] text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Signatures & Verification */}
              <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-6 items-end border-t border-white/10 max-w-2xl mx-auto text-left">
                <div>
                  <p className="text-xs font-serif italic text-slate-200 font-bold">GUIDELY AI Academic Board</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Authorizing Body</p>
                </div>

                <div className="text-center hidden sm:block">
                  <div className="inline-flex h-12 w-12 rounded-full border-2 border-amber-400/40 bg-amber-400/10 items-center justify-center text-amber-300 shadow-inner">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <p className="text-[9px] text-amber-300/80 uppercase tracking-widest mt-1">Verified Credential</p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-mono font-semibold text-slate-200">{certificate.issueDate}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Date of Issuance</p>
                </div>
              </div>

              {/* Verification String */}
              <div className="pt-4 text-center">
                <span className="font-mono text-[10px] text-slate-400 tracking-wider">
                  Verification Credential ID: <span className="text-cyan-300 font-bold">{certificate.id}</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
