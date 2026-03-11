'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, KeyRound, Lock, Mail, Shield, User } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

export default function AdminSetupPage() {
  const router = useRouter();
  const { registerPrivateAdmin } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminSetupSecret: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8 || !/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      setError('Use at least 8 characters with one letter and one number.');
      return;
    }

    setLoading(true);
    try {
      await registerPrivateAdmin(
        formData.email.trim().toLowerCase(),
        formData.password,
        formData.firstName.trim(),
        formData.lastName.trim(),
        formData.adminSetupSecret.trim()
      );
      router.push('/admin/dashboard');
    } catch (setupError: any) {
      setError(setupError.message || 'Unable to create admin account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fafc_45%,#ede9fe_100%)] px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-200 bg-white/95 shadow-2xl shadow-slate-200 backdrop-blur">
        <div className="border-b border-slate-100 bg-slate-950 px-8 py-7 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Private admin setup</h1>
              <p className="mt-2 text-sm text-slate-300">This route is intended for private bootstrap only. It requires the server-side admin setup secret.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-8 py-8">
          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          <div className="grid gap-4 md:grid-cols-2">
            <Field icon={<User className="h-5 w-5" />} label="First name" name="firstName" value={formData.firstName} onChange={handleChange} />
            <Field icon={<User className="h-5 w-5" />} label="Last name" name="lastName" value={formData.lastName} onChange={handleChange} />
          </div>

          <Field icon={<Mail className="h-5 w-5" />} label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
          <Field icon={<KeyRound className="h-5 w-5" />} label="Admin setup secret" name="adminSetupSecret" value={formData.adminSetupSecret} onChange={handleChange} />

          <div className="grid gap-4 md:grid-cols-2">
            <PasswordField
              label="Password"
              name="password"
              value={formData.password}
              showPassword={showPassword}
              onToggle={() => setShowPassword((current) => !current)}
              onChange={handleChange}
            />
            <PasswordField
              label="Confirm password"
              name="confirmPassword"
              value={formData.confirmPassword}
              showPassword={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((current) => !current)}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Creating admin account...' : 'Create private admin account'}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an internal account?{' '}
            <Link href="/admin/login" className="font-semibold text-blue-700 hover:text-blue-800">
              Use admin sign-in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  name,
  value,
  onChange,
  type = 'text',
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">{icon}</div>
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl border border-slate-200 px-11 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          required
        />
      </div>
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  showPassword,
  onToggle,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  showPassword: boolean;
  onToggle: () => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Lock className="h-5 w-5" />
        </div>
        <input
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl border border-slate-200 px-11 py-3 pr-12 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          required
        />
        <button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-700">
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
