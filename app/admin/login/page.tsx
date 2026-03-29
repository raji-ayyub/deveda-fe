'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, logout, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const currentUser = await login(email.trim().toLowerCase(), password);
      if (!currentUser || !['Admin', 'Instructor'].includes(currentUser.role)) {
        await logout();
        throw new Error('This account does not have admin dashboard access.');
      }
      router.push(currentUser.role === 'Admin' ? '/admin/dashboard' : '/instructor/dashboard');
    } catch (loginError: any) {
      setError(loginError.message || 'Sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_50%,#fefce8_100%)] px-4 py-12">
      <div className="mx-auto max-w-md rounded-[28px] border border-slate-200 bg-white/90 shadow-2xl shadow-slate-200 backdrop-blur">
        <div className="border-b border-slate-100 bg-slate-950 px-8 py-6 text-white">
          <h1 className="text-2xl font-black tracking-tight">Admin and instructor sign-in</h1>
          <p className="mt-2 text-sm text-slate-300">
            Use a verified Deveda internal account to access dashboard operations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-8 py-8">
          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          {user && !['Admin', 'Instructor'].includes(user.role) && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              You are signed in, but this account does not have admin dashboard access.
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-11 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-11 py-3 pr-12 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Enter dashboard'}
          </button>

          <p className="text-center text-sm text-slate-500">
            Need a trainee account instead?{' '}
            <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-800">
              Use the standard sign-in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
