'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, BookOpen, LibraryBig, Sparkles, Users } from 'lucide-react';

import { api } from '@/lib/api';
import { AdminStats } from '@/lib/types';

export default function InstructorDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.getAdminStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to load instructor dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_58%,#06b6d4_100%)] p-8 text-white shadow-2xl shadow-slate-300">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
          <Sparkles className="h-3.5 w-3.5" />
          Instructor workspace
        </div>
        <h2 className="mt-4 text-3xl font-black tracking-tight">Teach, review, and improve the learning path.</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-100/90">
          This dashboard is separate from admin operations. It keeps instructor tools focused on curriculum, questions, quizzes, and learner progress.
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Learners" value={loading ? '...' : stats?.totalUsers || 0} icon={<Users className="h-5 w-5" />} />
        <MetricCard label="Courses" value={loading ? '...' : stats?.totalCourses || 0} icon={<BookOpen className="h-5 w-5" />} />
        <MetricCard label="Questions" value={loading ? '...' : stats?.totalQuestions || 0} icon={<LibraryBig className="h-5 w-5" />} />
        <MetricCard label="Avg progress" value={loading ? '...' : `${stats?.averageProgress || 0}%`} icon={<BarChart3 className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ActionCard
          title="Curriculum studio"
          description="Refine modules, lessons, milestone projects, and learning outcomes."
          href="/instructor/dashboard/cms"
        />
        <ActionCard
          title="Question bank"
          description="Write new assessment questions and tighten explanations learners will review."
          href="/instructor/dashboard/questions"
        />
        <ActionCard
          title="Course catalog"
          description="Update thumbnails, descriptions, and structure for the courses you teach."
          href="/instructor/dashboard/courses"
        />
        <ActionCard
          title="Agent hub"
          description="Request and use course builder, progress analyst, tutor, and support agents."
          href="/agents"
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-100">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="rounded-2xl bg-blue-50 p-2 text-blue-700">{icon}</div>
      </div>
      <div className="mt-4 text-3xl font-black tracking-tight text-slate-950">{value}</div>
    </div>
  );
}

function ActionCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
      <h3 className="text-xl font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <Link href={href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800">
        Open workspace
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
