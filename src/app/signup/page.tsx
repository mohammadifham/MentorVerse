'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useState } from 'react';
import { Eye, EyeOff, Lock, Sparkles, UserPlus } from 'lucide-react';
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [course, setCourse] = useState('Computer Science & Engineering');
  const [profileDp, setProfileDp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleProfileDpUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file for profile DP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileDp(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = () => {
      setError('Unable to read selected image. Try another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSignup = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim() || !course.trim()) {
      setError('Please fill in your name, phone number, email, password, and course.');
      return;
    }

    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const cleanEmail = email.trim();

    setLoading(true);
    try {
      const authResult = await signInWithEmail(cleanEmail, password.trim());
      const user = authResult.user;
      const idToken = await user.getIdToken();

      const response = await fetch('/api/learner-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          userId: user.uid,
          name: name.trim(),
          phone: phone.trim(),
          email: cleanEmail,
          course: course.trim(),
          profileDp: profileDp.trim() || user.photoURL || ''
        })
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || 'Unable to create learner account.');
      }

      setSuccess('Account created successfully! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (signupError) {
      const fallback = signupError instanceof Error ? signupError.message : 'Signup failed.';
      setError(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const authResult = await signInWithGoogle();
      const googleUser = authResult.user;
      const idToken = await googleUser.getIdToken();
      const finalEmail = googleUser.email || email.trim() || 'student@mentorverse.dev';

      await fetch('/api/learner-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          userId: googleUser.uid,
          name: name.trim() || googleUser.displayName || 'Learner',
          phone: phone.trim() || 'Not specified',
          email: finalEmail,
          course: course.trim() || 'Computer Science & Engineering',
          profileDp: profileDp.trim() || googleUser.photoURL || ''
        })
      });

      setSuccess('Connected with Google! Redirecting...');
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-7 shadow-2xl shadow-cyan-900/20 backdrop-blur sm:p-10">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">Create learner account</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300">
          <Sparkles className="h-3 w-3" />
          Placement Ready
        </span>
      </div>
      <h1 className="mt-2 text-3xl font-semibold text-white">Sign up with your details</h1>
      <p className="mt-3 text-sm text-slate-300">Set up your student profile to access all CSE Placement Courses and live AI instruction.</p>

      <form onSubmit={handleSignup} className="mt-7 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">Full name</span>
          <input required value={name} onChange={(event) => setName(event.target.value)} className="input-field" placeholder="Enter your full name" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">Phone number</span>
          <input required value={phone} onChange={(event) => setPhone(event.target.value)} className="input-field" placeholder="e.g. +1 234 567 8900" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">Email</span>
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="input-field" placeholder="student@university.edu" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">Password</span>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input-field pr-10"
              placeholder="Min. 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm text-slate-200">Course / Major</span>
          <input required value={course} onChange={(event) => setCourse(event.target.value)} className="input-field" placeholder="Computer Science & Engineering" />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm text-slate-200">Profile DP (optional)</span>
          <input type="file" accept="image/*" onChange={handleProfileDpUpload} className="input-field text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-400/20 file:px-3 file:py-1.5 file:text-cyan-100" />
          {profileDp ? <img src={profileDp} alt="Profile preview" className="mt-3 h-20 w-20 rounded-2xl border border-white/10 object-cover" /> : null}
        </label>

        <div className="flex flex-col gap-3 sm:col-span-2 pt-2">
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm font-semibold">
            <UserPlus className="h-4 w-4" />
            {loading ? 'Creating account...' : 'Create Account & Begin Learning'}
          </button>
          <button type="button" onClick={handleGoogleSignup} disabled={loading} className="btn-secondary w-full py-3">
            Sign up with Google
          </button>
        </div>
      </form>

      {error ? <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p> : null}
      {success ? <p className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">{success}</p> : null}

      <p className="mt-5 text-sm text-slate-400">
        Already have an account? <Link href="/login" className="text-cyan-200 transition hover:text-cyan-100">Login here</Link>
      </p>
    </div>
  );
}
