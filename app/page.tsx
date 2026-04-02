'use client';

import Link from 'next/link';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Code2, Database, Gamepad2, GraduationCap, LayoutGrid, Server, Sparkles, Trophy, Users, Zap } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { COURSE_CATEGORY_COLORS, COURSE_DIFFICULTY_COLORS } from '@/lib/course-content';
import { getRoleLoginRedirect, getRoleProfilePath } from '@/lib/roleRoutes';
import { CourseCatalog, QuizAttempt, UserCourse } from '@/lib/types';

type CatalogStats = {
  total_courses: number;
  total_enrollments: number;
  unique_enrolled_users: number;
  popular_courses: Array<{ _id: string; count: number }>;
};

type LearnerSnapshot = {
  enrolledCourses: number;
  completedCourses: number;
  averageProgress: number;
  averageQuizScore: number;
  totalHours: number;
  streakDays: number;
};

const categoryOptions = [
  { name: 'All', icon: LayoutGrid },
  { name: 'Frontend Development', icon: Code2 },
  { name: 'Backend Development', icon: Server },
  { name: 'Systems Design', icon: Database },
];

const heroParticles = [
  { size: 70, left: '6%', top: '14%', duration: '11s', delay: '0s' },
  { size: 112, left: '22%', top: '72%', duration: '15s', delay: '1.4s' },
  { size: 78, left: '40%', top: '18%', duration: '12.8s', delay: '0.9s' },
  { size: 92, left: '61%', top: '20%', duration: '14.2s', delay: '1.8s' },
  { size: 66, left: '74%', top: '62%', duration: '10.6s', delay: '0.4s' },
  { size: 124, left: '88%', top: '28%', duration: '16s', delay: '2.1s' },
];

function badgeColor(category: string) {
  return COURSE_CATEGORY_COLORS[category] || 'bg-slate-100 text-slate-700';
}

function levelColor(difficulty: string) {
  return COURSE_DIFFICULTY_COLORS[difficulty] || 'bg-slate-100 text-slate-700';
}

function recentActivityStreak(dates: Date[]) {
  if (!dates.length) return 0;
  const uniqueDays = Array.from(new Set(dates.map((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString())))
    .map((value) => new Date(value))
    .sort((left, right) => right.getTime() - left.getTime());
  let streak = 0;
  let expected = new Date();
  expected = new Date(expected.getFullYear(), expected.getMonth(), expected.getDate());
  for (const day of uniqueDays) {
    const current = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const difference = Math.round((expected.getTime() - current.getTime()) / 86400000);
    if (difference === 0) {
      streak += 1;
      expected = new Date(expected.getTime() - 86400000);
      continue;
    }
    if (streak === 0 && difference === 1) {
      streak += 1;
      expected = new Date(current.getTime() - 86400000);
      continue;
    }
    break;
  }
  return streak;
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const isLearner = user?.role === 'Student';

  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [stats, setStats] = useState<CatalogStats>({ total_courses: 0, total_enrollments: 0, unique_enrolled_users: 0, popular_courses: [] });
  const [snapshot, setSnapshot] = useState<LearnerSnapshot | null>(null);
  const [recentCourses, setRecentCourses] = useState<UserCourse[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const [catalogRes, statsRes] = await Promise.all([api.getCourseCatalog(), api.getCourseCatalogStats()]);
        const nextCourses = catalogRes.data || [];
        const nextStats = (statsRes.data || {}) as CatalogStats;
        setCourses(nextCourses);
        setStats({
          total_courses: nextStats.total_courses || nextCourses.length,
          total_enrollments: nextStats.total_enrollments || 0,
          unique_enrolled_users: nextStats.unique_enrolled_users || 0,
          popular_courses: nextStats.popular_courses || [],
        });

        if (user?.id && isLearner) {
          const [userCoursesRes, attemptsRes] = await Promise.all([api.getUserCourses(user.id), api.getUserQuizAttempts(user.id)]);
          const learnerCourses = userCoursesRes.data || [];
          const learnerAttempts = attemptsRes.data || [];
          setRecentCourses(learnerCourses.slice(0, 3));
          setRecentAttempts(learnerAttempts.slice(0, 3));
          const activityDates = [
            ...learnerCourses.map((item) => item.lastAccessed).filter(Boolean),
            ...learnerAttempts.map((attempt) => attempt.attemptedAt),
          ]
            .filter((value): value is string => typeof value === 'string' && value.length > 0)
            .map((value) => new Date(value))
            .filter((date) => !Number.isNaN(date.getTime()));
          const totalProgress = learnerCourses.reduce((total, item) => total + (item.progress || 0), 0);
          const totalQuizScore = learnerAttempts.reduce((total, item) => total + (item.score || 0), 0);
          const totalMinutes = learnerCourses.reduce((total, item) => {
            const matchedCourse = nextCourses.find((course) => course.slug === item.courseSlug);
            return total + Math.round(((matchedCourse?.duration || 0) * (item.progress || 0)) / 100);
          }, 0);
          setSnapshot({
            enrolledCourses: learnerCourses.length,
            completedCourses: learnerCourses.filter((item) => item.completed).length,
            averageProgress: learnerCourses.length ? Math.round(totalProgress / learnerCourses.length) : 0,
            averageQuizScore: learnerAttempts.length ? Math.round(totalQuizScore / learnerAttempts.length) : 0,
            totalHours: Math.round(totalMinutes / 60),
            streakDays: recentActivityStreak(activityDates),
          });
        } else {
          setSnapshot(null);
          setRecentCourses([]);
          setRecentAttempts([]);
        }
      } catch (error: any) {
        setCourses([]);
        setStats({ total_courses: 0, total_enrollments: 0, unique_enrolled_users: 0, popular_courses: [] });
        setSnapshot(null);
        setRecentCourses([]);
        setRecentAttempts([]);
        setLoadError(error.message || 'Unable to load the latest platform content right now.');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [isLearner, user?.id]);

  const totalGuidedHours = useMemo(() => Math.round(courses.reduce((total, course) => total + (course.duration || 0), 0) / 60), [courses]);
  const courseBySlug = useMemo(() => new Map(courses.map((course) => [course.slug, course])), [courses]);
  const popularCourses = useMemo(() => stats.popular_courses.map((entry) => courseBySlug.get(entry._id)).filter((course): course is CourseCatalog => Boolean(course)).slice(0, 4), [courseBySlug, stats.popular_courses]);
  const visibleCourses = useMemo(() => {
    const filtered = activeCategory === 'All' ? courses : courses.filter((course) => course.category === activeCategory);
    return [...filtered].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 6);
  }, [activeCategory, courses]);

  const primaryAction = () => {
    if (!user) return router.push('/register');
    return router.push(user.role === 'Student' ? '/courses' : getRoleLoginRedirect(user.role));
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#eef2ff_100%)]">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,#38bdf833_0%,transparent_30%),linear-gradient(135deg,#0f172a_0%,#1d4ed8_46%,#7c3aed_100%)]">
        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl pulse-slow" />
        <div className="absolute -right-12 bottom-8 h-72 w-72 rounded-full bg-fuchsia-300/10 blur-3xl pulse-slow [animation-delay:1s]" />
        <div className="pointer-events-none absolute inset-0">
          {heroParticles.map((particle, index) => (
            <div key={index} className="absolute rounded-full bg-white/10 float-drift" style={{ width: `${particle.size}px`, height: `${particle.size}px`, left: particle.left, top: particle.top, animationDuration: particle.duration, animationDelay: particle.delay }} />
          ))}
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 text-white sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Guided coding paths
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Clear learning paths for frontend, backend, and systems design.
            </h1>
            <p className="mt-6 max-w-3xl text-lg text-slate-100/90">
              Choose a published course, move through guided lessons and checkpoints, and build momentum with progress that reflects the work you actually complete.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">Published courses</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">Hands-on lessons</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">Lesson challenge games</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">Quiz checkpoints</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">Role-based workspaces</span>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <button onClick={primaryAction} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:shadow-2xl">
                {user ? (user.role === 'Student' ? 'Continue learning' : 'Open workspace') : 'Start learning'}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => router.push(user ? getRoleProfilePath(user.role) : '/courses')} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15">
                {user ? 'View account' : 'Browse catalog'}
              </button>
              <button onClick={() => router.push('/games')} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 backdrop-blur-sm transition hover:bg-cyan-300/15">
                <Gamepad2 className="h-4 w-4" />
                Explore games
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-4 top-12 hidden rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur-sm lg:block float-soft">
              <div className="font-semibold text-white">Quiz checkpoints</div>
              <div className="mt-1 text-slate-200">Keep each module measurable.</div>
            </div>
            <div className="absolute right-1 top-0 hidden rounded-2xl border border-white/15 bg-slate-950/35 px-4 py-3 text-sm backdrop-blur-sm lg:block float-soft [animation-delay:1.2s]">
              <div className="font-semibold text-white">Saved progress</div>
              <div className="mt-1 text-slate-200">Resume lessons with less friction.</div>
            </div>

            <div className="rounded-[32px] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">Platform snapshot</div>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-white">Live catalog activity</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <HeroMetric label="Courses" value={loading ? '...' : stats.total_courses} icon={<BookOpen className="h-5 w-5" />} />
                <HeroMetric label="Learners" value={loading ? '...' : stats.unique_enrolled_users} icon={<Users className="h-5 w-5" />} />
                <HeroMetric label="Enrollments" value={loading ? '...' : stats.total_enrollments} icon={<GraduationCap className="h-5 w-5" />} />
                <HeroMetric label="Guided hours" value={loading ? '...' : totalGuidedHours} icon={<Clock3 className="h-5 w-5" />} />
              </div>
              <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/25 p-5 text-sm text-slate-200">
                <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-300" /><span>Browse published courses immediately.</span></div>
                <div className="mt-3 flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-300" /><span>Track real lesson and quiz progress.</span></div>
                <div className="mt-3 flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-300" /><span>Jump into lesson-linked games from a visible arcade hub.</span></div>
                <div className="mt-3 flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-300" /><span>Use a workspace that matches your role.</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loadError ? <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8"><div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{loadError}</div></div> : null}

      {user && (snapshot || loading) ? (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Your momentum</div>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Welcome back, {user.firstName}.</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">Pick up where you left off, keep your streak visible, and jump back into the courses or quizzes that need your attention next.</p>
              </div>
              <Link href="/profile" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">Open profile<ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
              <SnapshotCard label="Enrolled" value={loading ? '...' : snapshot?.enrolledCourses || 0} />
              <SnapshotCard label="Completed" value={loading ? '...' : snapshot?.completedCourses || 0} />
              <SnapshotCard label="Avg. progress" value={loading ? '...' : `${snapshot?.averageProgress || 0}%`} />
              <SnapshotCard label="Quiz score" value={loading ? '...' : `${snapshot?.averageQuizScore || 0}%`} />
              <SnapshotCard label="Hours" value={loading ? '...' : snapshot?.totalHours || 0} />
              <SnapshotCard label="Streak" value={loading ? '...' : `${snapshot?.streakDays || 0}d`} accent />
            </div>
            {loading ? (
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <PanelSkeleton title="Recent courses" />
                <PanelSkeleton title="Recent quiz attempts" />
              </div>
            ) : (recentCourses.length > 0 || recentAttempts.length > 0) ? (
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <Panel title="Recent courses" items={recentCourses.map((course) => ({ label: courseBySlug.get(course.courseSlug)?.title || course.courseSlug, detail: `${course.progress}% progress${course.completed ? ' - completed' : ''}` }))} />
                <Panel title="Recent quiz attempts" items={recentAttempts.map((attempt) => ({ label: attempt.quizId, detail: `${attempt.score}%${attempt.passed ? ' - passed' : ' - retry recommended'}` }))} />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Choose your next track</div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Start from a path that matches your goal</h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">Browse the newest published courses and filter by the area you want to grow in next.</p>
            </div>
            <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800">Open full catalog<ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {categoryOptions.map((category) => {
              const Icon = category.icon;
              const active = activeCategory === category.name;
              return <button key={category.name} onClick={() => setActiveCategory(category.name)} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${active ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700'}`}><Icon className="h-4 w-4" />{category.name}</button>;
            })}
          </div>
          {loading && visibleCourses.length === 0 ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <article key={`course-skeleton-${index}`} className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-sm">
                  <div className="h-44 animate-pulse bg-slate-200" />
                  <div className="space-y-4 p-6">
                    <div className="flex gap-2">
                      <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
                      <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                    </div>
                    <div className="flex gap-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                    </div>
                    <div className="h-12 w-32 animate-pulse rounded-2xl bg-slate-200" />
                  </div>
                </article>
              ))}
            </div>
          ) : visibleCourses.length > 0 ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleCourses.map((course) => (
                <article key={course.slug} className="group overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-44 overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_60%,#8b5cf6_100%)]">
                    {course.thumbnail ? <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-4xl font-black text-white">{course.title.charAt(0)}</div>}
                  </div>
                  <div className="space-y-4 p-6">
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor(course.category)}`}>{course.category}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${levelColor(course.difficulty)}`}>{course.difficulty}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-950">{course.title}</h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-3">{course.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-blue-700" />{course.duration} minutes</span>
                      <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-blue-700" />{course.totalLessons} lessons</span>
                    </div>
                    <button onClick={() => router.push(`/courses/${course.slug}`)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">View course<ArrowRight className="h-4 w-4" /></button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <h3 className="text-xl font-bold text-slate-950">No published courses in this category yet</h3>
              <p className="mt-2 text-sm text-slate-600">{user?.role === 'Instructor' || user?.role === 'Admin' ? 'Publish the first course from your workspace and it will appear here.' : 'Try another category, or check back when the next course goes live.'}</p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-2 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Why it feels clear</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Built to keep momentum visible</h2>
            <div className="mt-6 space-y-4">
              <ReasonRow icon={<BookOpen className="h-4 w-4" />} title="Start from a real path" description="Each published course is organized into lessons, checkpoints, and milestones that make the next step obvious." />
              <ReasonRow icon={<Sparkles className="h-4 w-4" />} title="Learn with guided practice" description="Concepts, examples, and practice prompts stay close together so learners can apply new ideas before they drift." />
              <ReasonRow icon={<Trophy className="h-4 w-4" />} title="See progress clearly" description="Course completion, quiz attempts, and active streaks stay connected to real lesson activity instead of estimates." />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white shadow-xl shadow-slate-300">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Popular right now</div>
                <h2 className="mt-3 text-3xl font-black tracking-tight">What learners are opening most</h2>
              </div>
              <Zap className="h-5 w-5 text-cyan-300" />
            </div>
            {loading && popularCourses.length === 0 ? (
              <div className="mt-6 space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`popular-skeleton-${index}`} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <div className="h-6 w-2/3 animate-pulse rounded bg-white/15" />
                    <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-white/10" />
                  </div>
                ))}
              </div>
            ) : popularCourses.length > 0 ? (
              <div className="mt-6 space-y-4">
                {popularCourses.map((course) => {
                  const count = stats.popular_courses.find((item) => item._id === course.slug)?.count || 0;
                  return <button key={course.slug} onClick={() => router.push(`/courses/${course.slug}`)} className="flex w-full items-start justify-between rounded-[24px] border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10"><div><div className="text-lg font-bold text-white">{course.title}</div><div className="mt-2 text-sm text-slate-300">{course.category}</div></div><div className="rounded-2xl bg-cyan-400/10 px-3 py-2 text-right"><div className="text-sm font-semibold text-cyan-200">{count}</div><div className="text-xs text-slate-400">enrollments</div></div></button>;
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-dashed border-white/15 bg-white/5 px-5 py-10 text-center">
                <h3 className="text-lg font-bold text-white">The first trend starts with the first enrollments</h3>
                <p className="mt-2 text-sm text-slate-300">Once learners begin enrolling in published courses, this space updates automatically.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e40af_58%,#7c3aed_100%)] p-8 text-white shadow-2xl shadow-slate-300">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100"><Sparkles className="h-3.5 w-3.5" />Keep moving</div>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Ready to turn your next topic into a finished skill?</h2>
              <p className="mt-4 max-w-2xl text-sm text-slate-100/90">Browse the live catalog, continue an active course, or open the workspace that matches your role and keep building from there.</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button onClick={primaryAction} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5">{user ? (user.role === 'Student' ? 'Resume learning' : 'Open workspace') : 'Create account'}<ArrowRight className="h-4 w-4" /></button>
                <Link href="/courses" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">Browse courses</Link>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              <FooterGroup title="Learn" links={[['Browse courses', '/courses'], ['Practice quizzes', '/quiz'], ['Lesson library', '/lessons']]} />
              <FooterGroup title="Explore" links={[['Frontend paths', '/courses'], ['Backend paths', '/courses'], ['Systems design', '/courses']]} />
              <FooterGroup title="Platform" links={[['About Deveda', '/about'], ['Account settings', '/settings'], ['AI assistant', '/agents']]} />
            </div>
          </div>
          <div className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-300">© {new Date().getFullYear()} Deveda. Coding-focused learning paths for frontend, backend, and systems design.</div>
        </div>
      </section>

      <style jsx>{`
        @keyframes floatDrift { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-18px) rotate(8deg); } }
        @keyframes floatSoft { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes pulseSlow { 0%,100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.08); } }
        .float-drift { animation-name: floatDrift; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        .float-soft { animation: floatSoft 5.5s ease-in-out infinite; }
        .pulse-slow { animation: pulseSlow 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function HeroMetric({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) {
  return <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm transition hover:bg-white/15"><div className="flex items-center justify-between text-cyan-100"><span className="text-sm font-semibold">{label}</span>{icon}</div><div className="mt-4 text-3xl font-black text-white">{value}</div></div>;
}

function SnapshotCard({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return <div className={`rounded-[24px] border p-5 ${accent ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}><div className={`text-xs font-semibold uppercase tracking-[0.18em] ${accent ? 'text-amber-700' : 'text-slate-500'}`}>{label}</div><div className={`mt-3 text-2xl font-black ${accent ? 'text-amber-900' : 'text-slate-950'}`}>{value}</div></div>;
}

function Panel({ title, items }: { title: string; items: Array<{ label: string; detail: string }> }) {
  return <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-bold text-slate-950">{title}</h3><div className="mt-4 space-y-3">{items.map((item) => <div key={`${title}-${item.label}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><div className="font-semibold text-slate-950">{item.label}</div><div className="mt-1 text-sm text-slate-600">{item.detail}</div></div>)}</div></div>;
}

function PanelSkeleton({ title }: { title: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`${title}-skeleton-${index}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReasonRow({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-blue-50 p-3 text-blue-700">{icon}</div><div className="text-lg font-bold text-slate-950">{title}</div></div><p className="mt-3 text-sm text-slate-600">{description}</p></div>;
}

function FooterGroup({ title, links }: { title: string; links: Array<[string, string]> }) {
  return <div><h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">{title}</h3><div className="mt-4 space-y-3">{links.map(([label, href]) => <Link key={label} href={href} className="block text-sm text-slate-100 transition hover:text-white">{label}</Link>)}</div></div>;
}
