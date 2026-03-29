'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, ShieldCheck, UserCircle2 } from 'lucide-react';

import CloudinaryUploadField from '@/components/CloudinaryUploadField';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { getRoleProfilePath } from '@/lib/roleRoutes';

const SettingsPage: React.FC = () => {
  const { user, updateUser, loading: authLoading } = useAuth();
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    avatarUrl: '',
    avatarPublicId: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl || '',
      avatarPublicId: user.avatarPublicId || '',
    });
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#eff6ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div className="rounded-[32px] border border-slate-200 bg-white px-8 py-8 shadow-2xl shadow-slate-200">
            <div className="h-10 w-56 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <section key={`settings-skeleton-${index}`} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
                <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
                <div className="mt-6 space-y-4">
                  {Array.from({ length: 4 }).map((__, fieldIndex) => (
                    <div key={`field-${fieldIndex}`}>
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                      <div className="mt-2 h-12 animate-pulse rounded-2xl bg-slate-100" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl">
          <h1 className="text-2xl font-bold text-slate-950">Authentication required</h1>
          <p className="mt-3 text-sm text-slate-600">Sign in first to access account settings.</p>
          <Link href="/login" className="mt-6 inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const backHref = getRoleProfilePath(user.role);
  const profileDescription =
    user.role === 'Instructor'
      ? 'These details appear in your teaching workspace and on instructor-facing surfaces.'
      : user.role === 'Admin'
      ? 'These details identify your internal admin account across the dashboard.'
      : 'These details are shown across the learning experience.';
  const avatarHelperText =
    user.role === 'Instructor'
      ? 'Upload a clear instructor photo for your teaching workspace, course pages, and parent-facing trust.'
      : user.role === 'Admin'
      ? 'Upload a recognizable photo for internal account identity.'
      : 'Upload a friendly learner photo for profiles, certificates, and celebration moments.';

  const handleProfileSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileError('');
    setProfileMessage('');

    try {
      setSavingProfile(true);
      await updateUser({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        email: profileForm.email.trim().toLowerCase(),
        avatarUrl: profileForm.avatarUrl,
        avatarPublicId: profileForm.avatarPublicId,
      });
      setProfileMessage('Profile settings updated.');
    } catch (error: any) {
      setProfileError(error.message || 'Unable to update your profile settings.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 8 || !/[A-Za-z]/.test(passwordForm.newPassword) || !/\d/.test(passwordForm.newPassword)) {
      setPasswordError('Use at least 8 characters with one letter and one number.');
      return;
    }

    try {
      setSavingPassword(true);
      await api.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage('Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordError(error.message || 'Unable to update your password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#eff6ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>

        <div className="rounded-[32px] border border-slate-200 bg-white px-8 py-8 shadow-2xl shadow-slate-200">
          <h1 className="text-3xl font-black tracking-tight text-slate-950">Account settings</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage your identity, credentials, and launch-readiness account preferences.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">Profile settings</h2>
                <p className="text-sm text-slate-600">{profileDescription}</p>
              </div>
            </div>

            {profileError && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{profileError}</div>}
            {profileMessage && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{profileMessage}</div>}

            <form onSubmit={handleProfileSave} className="mt-6 space-y-4">
              <CloudinaryUploadField
                label="Profile photo"
                assetType="profile"
                value={profileForm.avatarUrl}
                publicId={profileForm.avatarPublicId}
                suggestedPublicId={user ? `user-${user.id}-avatar` : undefined}
                helperText={avatarHelperText}
                onChange={({ url, publicId }) => setProfileForm((current) => ({ ...current, avatarUrl: url, avatarPublicId: publicId }))}
              />
              <SettingsField label="First name" value={profileForm.firstName} onChange={(value) => setProfileForm((current) => ({ ...current, firstName: value }))} />
              <SettingsField label="Last name" value={profileForm.lastName} onChange={(value) => setProfileForm((current) => ({ ...current, lastName: value }))} />
              <SettingsField label="Email" type="email" value={profileForm.email} onChange={(value) => setProfileForm((current) => ({ ...current, email: value }))} />
              <SettingsReadOnly label="Role" value={user.role} />
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {savingProfile ? 'Saving profile...' : 'Save profile settings'}
              </button>
            </form>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">Password</h2>
                <p className="text-sm text-slate-600">Use a strong password before launch.</p>
              </div>
            </div>

            {passwordError && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{passwordError}</div>}
            {passwordMessage && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{passwordMessage}</div>}

            <form onSubmit={handlePasswordSave} className="mt-6 space-y-4">
              <SettingsField
                label="Current password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))}
              />
              <SettingsField
                label="New password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))}
              />
              <SettingsField
                label="Confirm new password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))}
              />
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {savingPassword ? 'Updating password...' : 'Update password'}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-slate-700" />
                <p>Role and account activation are managed internally so public users cannot escalate permissions accidentally.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

function SettingsField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        required
      />
    </div>
  );
}

function SettingsReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">{value}</div>
    </div>
  );
}

export default SettingsPage;
