'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  Mail,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AdminStats } from '@/lib/types';

const quickActions = [
  {
    title: 'Instructor dashboard',
    description: 'Open the main teaching workspace and keep course delivery moving.',
    href: '/instructor/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Course catalog',
    description: 'Update course structure, thumbnails, and learning paths.',
    href: '/instructor/dashboard/courses',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: 'Curriculum studio',
    description: 'Refine modules, lessons, and milestone project expectations.',
    href: '/instructor/dashboard/cms',
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    title: 'Question bank',
    description: 'Write assessments and improve learner feedback quality.',
    href: '/instructor/dashboard/questions',
    icon: <LibraryBig className="h-5 w-5" />,
  },
];

export default function InstructorProfileView() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'Instructor') {
      setStatsLoading(false);
      return;
    }

    const load = async () => {
      try {
        const response = await api.getAdminStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to load instructor workspace stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-600">Loading instructor profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl">
          <h1 className="text-2xl font-bold text-slate-950">Please sign in</h1>
          <p className="mt-3 text-sm text-slate-600">Your instructor workspace is available after authentication.</p>
          <Link href="/login" className="mt-6 inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'Instructor') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl">
          <h1 className="text-2xl font-bold text-slate-950">Instructor profile only</h1>
          <p className="mt-3 text-sm text-slate-600">This page is reserved for instructor accounts.</p>
          <Link href="/profile" className="mt-6 inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            Open your account page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_40%,#eff6ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-200">
          <div className="bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_58%,#06b6d4_100%)] px-8 py-8 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" />
              Instructor identity
            </div>
            <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-950/40 text-2xl font-bold text-white ring-4 ring-white/15">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} className="h-full w-full object-cover" />
                  ) : (
                    <>
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </>
                  )}
                </div>
                <div>
                  <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                    {user.role}
                  </div>
                  <h1 className="mt-3 text-3xl font-black tracking-tight">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-100/90">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'recently'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/instructor/dashboard"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Open dashboard
                </Link>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <Settings className="h-4 w-4" />
                  Account settings
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-100 px-8 py-6 md:grid-cols-3">
            <InfoCard
              label="Profile purpose"
              value="Teaching workspace"
              note="This account is structured around course delivery, curriculum, and assessment authoring."
            />
            <InfoCard
              label="Learner-style data"
              value="Not used here"
              note="Instructor accounts are no longer treated like enrolled learners during onboarding."
            />
            <InfoCard
              label="Main next step"
              value="Complete your instructor setup"
              note="Upload a clear photo, review the course catalog, and confirm your teaching materials."
            />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Teaching workspace</h2>
                <p className="mt-1 text-sm text-slate-600">Quick links for the parts of the platform instructors actually use.</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {quickActions.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[24px] border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">{item.icon}</div>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Platform snapshot</h2>
                <p className="mt-1 text-sm text-slate-300">Reference numbers from the shared instructor dashboard.</p>
              </div>
              <BarChart3 className="h-5 w-5 text-cyan-300" />
            </div>

            <div className="mt-6 grid gap-4">
              <SnapshotRow label="Learners on platform" value={statsLoading ? '...' : stats?.totalUsers ?? 0} icon={<Users className="h-4 w-4" />} />
              <SnapshotRow label="Catalog courses" value={statsLoading ? '...' : stats?.totalCourses ?? 0} icon={<BookOpen className="h-4 w-4" />} />
              <SnapshotRow label="Question bank entries" value={statsLoading ? '...' : stats?.totalQuestions ?? 0} icon={<LibraryBig className="h-4 w-4" />} />
              <SnapshotRow label="Average learner progress" value={statsLoading ? '...' : `${stats?.averageProgress ?? 0}%`} icon={<BarChart3 className="h-4 w-4" />} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-bold text-slate-950">{value}</div>
      <p className="mt-2 text-sm text-slate-600">{note}</p>
    </div>
  );
}

function SnapshotRow({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
      <div className="flex items-center gap-3 text-slate-200">
        <div className="rounded-xl bg-white/10 p-2">{icon}</div>
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}
