'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useState } from 'react';
import { signInWithGoogle } from '@/lib/firebase';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');
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

    if (!name.trim() || !phone.trim() || !email.trim() || !course.trim()) {
      setError('Please fill in name, number, email, and course.');
      return;
    }

    setLoading(true);
    try {
      const authResult = await signInWithGoogle();
      const googleUser = authResult.user;
      const idToken = await googleUser.getIdToken();
      const finalEmail = googleUser.email || email.trim();

      const response = await fetch('/api/learner-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          userId: googleUser.uid,
          name: name.trim(),
          phone: phone.trim(),
          email: finalEmail,
          course: course.trim(),
          profileDp: profileDp.trim() || googleUser.photoURL || ''
        })
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || 'Unable to create learner account.');
      }

      setSuccess('Account created successfully. Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-white/10 bg-slate-950/70 p-7 shadow-2xl shadow-cyan-900/20 backdrop-blur sm:p-10">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">Create learner account</p>
      <h1 className="mt-2 text-3xl font-semibold text-white">Sign up with your details</h1>
      <p className="mt-3 text-sm text-slate-300">Fill your profile information, then continue with Google to create your MentorVerse account.</p>

      <form onSubmit={handleSignup} className="mt-7 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">Full name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} className="input-field" placeholder="Enter your name" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">Number</span>
          <input value={phone} onChange={(event) => setPhone(event.target.value)} className="input-field" placeholder="Enter your number" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input-field" placeholder="you@example.com" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">Course</span>
          <input value={course} onChange={(event) => setCourse(event.target.value)} className="input-field" placeholder="Data Structures" />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm text-slate-200">Profile DP (optional)</span>
          <input type="file" accept="image/*" onChange={handleProfileDpUpload} className="input-field text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-400/20 file:px-3 file:py-1.5 file:text-cyan-100" />
          {profileDp ? <img src={profileDp} alt="Profile preview" className="mt-3 h-20 w-20 rounded-2xl border border-white/10 object-cover" /> : null}
        </label>

        <div className="sm:col-span-2">
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creating account...' : 'Continue with Google'}
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
