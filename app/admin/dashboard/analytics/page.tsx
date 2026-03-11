'use client';

import { ReactNode, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Activity, BookOpen, Calendar, CheckCircle2, Clock3, Filter, Users } from 'lucide-react';

import { api } from '@/lib/api';
import { AdminStats, ChartData, CourseCatalog, RecentActivity } from '@/lib/types';

const LineChart = dynamic(() => import('@/components/charts/LineChart'), { ssr: false });
const PieChart = dynamic(() => import('@/components/charts/PieChart'), { ssr: false });
const BarChart = dynamic(() => import('@/components/charts/BarChart'), { ssr: false });

const emptyStats: AdminStats = {
  totalUsers: 0,
  totalCourses: 0,
  totalQuizzes: 0,
  totalQuestions: 0,
  activeUsers: 0,
  recentRegistrations: 0,
  averageProgress: 0,
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [userGrowthData, setUserGrowthData] = useState<ChartData | null>(null);
  const [courseDistributionData, setCourseDistributionData] = useState<ChartData | null>(null);
  const [activityMixData, setActivityMixData] = useState<ChartData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsRes, chartRes, activityRes, coursesRes] = await Promise.all([
        api.getAdminStats(),
        api.getChartData(timeRange),
        api.getRecentActivity(),
        api.getCourseCatalog(),
      ]);

      setStats(statsRes.data);
      setUserGrowthData(chartRes.data);
      setRecentActivity(activityRes.data);
      setCourseDistributionData(buildCourseDistributionData(coursesRes.data));
      setActivityMixData(buildActivityMixData(activityRes.data));
    } catch (loadError: any) {
      console.error('Failed to load analytics:', loadError);
      setError(loadError.message || 'Unable to load analytics right now.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track real platform usage, catalog mix, and learner progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(event) => setTimeRange(event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
            <Filter className="h-4 w-4" />
            Live backend data
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total users" value={stats.totalUsers.toLocaleString()} hint={`${stats.recentRegistrations} joined recently`} icon={<Users className="h-6 w-6 text-blue-600" />} />
        <MetricCard label="Active users" value={stats.activeUsers.toLocaleString()} hint="Accounts currently marked active" icon={<Activity className="h-6 w-6 text-emerald-600" />} />
        <MetricCard label="Course catalog" value={stats.totalCourses} hint={`${stats.totalQuizzes} quizzes and ${stats.totalQuestions} questions`} icon={<BookOpen className="h-6 w-6 text-indigo-600" />} />
        <MetricCard label="Average progress" value={`${stats.averageProgress}%`} hint="Across enrolled learners" icon={<CheckCircle2 className="h-6 w-6 text-amber-600" />} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ChartCard title="New user growth" subtitle="Registrations by day for the selected period">
          <div className="h-72">{userGrowthData ? <LineChart data={userGrowthData} /> : <EmptyChartState />}</div>
        </ChartCard>

        <ChartCard title="Course distribution" subtitle="Catalog split by course category">
          <div className="h-72">{courseDistributionData ? <PieChart data={courseDistributionData} /> : <EmptyChartState />}</div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.4fr_1fr]">
        <ChartCard title="Recent activity mix" subtitle="What users have been doing most recently">
          <div className="h-72">{activityMixData ? <BarChart data={activityMixData} /> : <EmptyChartState />}</div>
        </ChartCard>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent activity</h3>
              <p className="text-sm text-gray-500">Latest learner and platform actions</p>
            </div>
            <Clock3 className="h-5 w-5 text-gray-400" />
          </div>

          <div className="mt-6 space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="text-sm font-semibold text-gray-900">{item.userName}</div>
                  <div className="mt-1 text-sm text-gray-600">
                    {item.action} <span className="font-medium text-gray-900">{item.target}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
                No recent activity yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function buildCourseDistributionData(courses: CourseCatalog[]): ChartData | null {
  if (courses.length === 0) {
    return null;
  }

  const counts = courses.reduce<Record<string, number>>((summary, course) => {
    summary[course.category] = (summary[course.category] || 0) + 1;
    return summary;
  }, {});

  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: 'Courses',
        data: Object.values(counts),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 1,
      },
    ],
  };
}

function buildActivityMixData(activity: RecentActivity[]): ChartData | null {
  if (activity.length === 0) {
    return null;
  }

  const counts = activity.reduce<Record<string, number>>((summary, item) => {
    summary[item.action] = (summary[item.action] || 0) + 1;
    return summary;
  }, {});

  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: 'Recent actions',
        data: Object.values(counts),
        backgroundColor: 'rgba(37, 99, 235, 0.25)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2,
      },
    ],
  };
}

function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">{icon}</div>
      </div>
      <p className="mt-4 text-sm text-gray-500">{hint}</p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function EmptyChartState() {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-500">
      No chart data available yet.
    </div>
  );
}
