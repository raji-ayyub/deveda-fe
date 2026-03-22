'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Activity, ArrowRight, BookOpen, FileText, HelpCircle, Loader2, Users } from 'lucide-react';

import { api } from '@/lib/api';
import { AdminStats, ChartData, RecentActivity } from '@/lib/types';

const LineChart = dynamic(() => import('@/components/charts/LineChart'), { ssr: false });
const PieChart = dynamic(() => import('@/components/charts/PieChart'), { ssr: false });

const quickActions = [
  { href: '/admin/dashboard/courses', label: 'Manage courses', description: 'Create, import, and organize live catalog items.', icon: <BookOpen className="h-5 w-5" /> },
  { href: '/admin/dashboard/cms', label: 'Open curriculum studio', description: 'Generate modules, lessons, and course structure.', icon: <Activity className="h-5 w-5" /> },
  { href: '/admin/dashboard/questions', label: 'Review question bank', description: 'Approve quiz questions and final assessment content.', icon: <FileText className="h-5 w-5" /> },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');
        const [statsResponse, chartResponse, activityResponse] = await Promise.all([
          api.getAdminStats(),
          api.getChartData(timeRange),
          api.getRecentActivity(),
        ]);
        setStats(statsResponse.data);
        setChartData(chartResponse.data);
        setRecentActivity(activityResponse.data);
      } catch (loadError: any) {
        setError(loadError.message || 'Unable to load the admin dashboard right now.');
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-700" />
          <p className="mt-3 text-sm text-slate-600">Loading dashboard overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">Platform overview</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Watch live user, course, question, and progress activity from one admin surface without relying on mock numbers or filler widgets.
            </p>
          </div>
          <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {[
              { value: '7d', label: '7 days' },
              { value: '30d', label: '30 days' },
              { value: '90d', label: '90 days' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  timeRange === option.value ? 'bg-slate-950 text-white' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={stats?.totalUsers || 0} icon={<Users className="h-5 w-5" />} helper={`${stats?.recentRegistrations || 0} recent registrations`} />
        <StatCard label="Courses" value={stats?.totalCourses || 0} icon={<BookOpen className="h-5 w-5" />} helper="Live catalog entries" />
        <StatCard label="Questions" value={stats?.totalQuestions || 0} icon={<HelpCircle className="h-5 w-5" />} helper="Active assessment items" />
        <StatCard label="Average progress" value={`${stats?.averageProgress || 0}%`} icon={<Activity className="h-5 w-5" />} helper="Across enrolled learners" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-950">User growth</h3>
              <p className="mt-1 text-sm text-slate-600">Real registration activity for the selected time window.</p>
            </div>
          </div>
          <div className="mt-6 h-72">{chartData ? <LineChart data={chartData} /> : <EmptyChart text="No chart data available yet." />}</div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-950">Course distribution</h3>
            <p className="mt-1 text-sm text-slate-600">Current catalog spread by category and difficulty.</p>
          </div>
          <div className="mt-6 h-72">{chartData ? <PieChart data={chartData} /> : <EmptyChart text="No distribution data available yet." />}</div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-950">Recent activity</h3>
              <p className="mt-1 text-sm text-slate-600">Latest actions across users, courses, quizzes, and content workflows.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="text-sm font-semibold text-slate-950">
                    {activity.userName} <span className="font-normal text-slate-600">{activity.action}</span> {activity.target}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{new Date(activity.timestamp).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
                No platform activity has been recorded yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300">
          <h3 className="text-xl font-bold">Next actions</h3>
          <p className="mt-2 text-sm text-slate-300">Jump straight into the main operational surfaces.</p>
          <div className="mt-6 space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-start justify-between rounded-2xl bg-white/10 px-4 py-4 transition hover:bg-white/15"
              >
                <div className="flex gap-3">
                  <div className="mt-1 text-cyan-300">{action.icon}</div>
                  <div>
                    <div className="font-semibold text-white">{action.label}</div>
                    <div className="mt-1 text-sm text-slate-300">{action.description}</div>
                  </div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-slate-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  helper,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  helper: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-lg shadow-slate-100">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="rounded-2xl bg-blue-50 p-2 text-blue-700">{icon}</div>
      </div>
      <div className="mt-4 text-3xl font-black tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{helper}</div>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 text-sm text-slate-500">{text}</div>;
}
