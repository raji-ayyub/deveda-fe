'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Clock3, ExternalLink, LibraryBig, Loader2, RefreshCw, Search, Sparkles } from 'lucide-react';

import PaginationControls from '@/components/ui/PaginationControls';
import { api } from '@/lib/api';
import { LessonLibraryItem, PaginationMeta } from '@/lib/types';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

const PAGE_SIZE = 8;

export default function LessonsManagementPage() {
  const pathname = usePathname();
  const router = useRouter();
  const cmsRoute = pathname.startsWith('/instructor') ? '/instructor/dashboard/cms' : '/admin/dashboard/cms';
  const coursesRoute = pathname.startsWith('/instructor') ? '/instructor/dashboard/courses' : '/admin/dashboard/courses';

  const [lessons, setLessons] = useState<LessonLibraryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>(undefined);
  const [summary, setSummary] = useState({
    totalLessons: 0,
    linkedCourses: 0,
    totalDurationMinutes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');

  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    void loadLessons();
  }, [currentPage, debouncedSearchTerm]);

  const loadLessons = async (options?: { silent?: boolean }) => {
    try {
      if (options?.silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      const response = await api.getLessonLibrary({
        search: debouncedSearchTerm || undefined,
        page: currentPage,
        pageSize: PAGE_SIZE,
      });
      setLessons(response.data);
      setPagination(response.pagination);
      setSummary({
        totalLessons: Number(response.summary?.totalLessons || 0),
        linkedCourses: Number(response.summary?.linkedCourses || 0),
        totalDurationMinutes: Number(response.summary?.totalDurationMinutes || 0),
      });
    } catch (loadError: any) {
      setError(loadError.message || 'Unable to load lessons right now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const stats = useMemo(
    () => ({
      totalLessons: summary.totalLessons,
      linkedCourses: summary.linkedCourses,
      totalDuration: summary.totalDurationMinutes,
    }),
    [summary]
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_60%,#38bdf8_100%)] p-6 text-white shadow-2xl shadow-slate-300 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
          <Sparkles className="h-3.5 w-3.5" />
          Lessons
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight">Lesson management</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-200">
          Review published course lessons, jump into the owning curriculum, and keep the lesson catalog clean. Planned shells stay in Curriculum Studio until they are generated.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={cmsRoute} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
            <LibraryBig className="h-4 w-4" />
            Open curriculum studio
          </Link>
          <Link href={coursesRoute} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            <BookOpen className="h-4 w-4" />
            Back to courses
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Published lessons" value={String(stats.totalLessons)} />
        <StatCard label="Linked courses" value={String(stats.linkedCourses)} />
        <StatCard label="Total duration" value={`${stats.totalDuration} min`} />
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Published lesson library</h2>
            <p className="mt-1 text-sm text-slate-600">Search by lesson title, summary, course, or module.</p>
          </div>
          <div className="flex w-full max-w-lg gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search lessons"
                className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <button
              onClick={() => void loadLessons({ silent: true })}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {loading && lessons.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" />
              <p className="mt-3 text-sm text-slate-600">Loading lesson management data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : lessons.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            No published lessons match this view yet.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white">
            <div className="grid gap-5 p-5 xl:grid-cols-2">
              {lessons.map((lesson) => {
                const primaryCourse = lesson.courseRefs[0];
                return (
                  <article key={lesson.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{lesson.contentType}</div>
                        <h3 className="mt-2 text-xl font-bold text-slate-950">{lesson.title}</h3>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                        <BookOpen className="h-3.5 w-3.5" />
                        Published
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-slate-600">{lesson.summary}</p>

                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                      <Clock3 className="h-4 w-4 text-blue-700" />
                      {lesson.durationMinutes} minutes
                    </div>

                    <div className="mt-5 space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Included in</div>
                      {lesson.courseRefs.map((courseRef) => (
                        <div key={`${lesson.id}-${courseRef.courseSlug}-${courseRef.lessonSlug}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                          <div className="font-semibold text-slate-900">{courseRef.courseTitle}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            {courseRef.moduleTitle} / route `{courseRef.lessonSlug}`
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {lesson.entryRoute ? (
                        <button
                          onClick={() => router.push(lesson.entryRoute!)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open learner view
                        </button>
                      ) : null}
                      {primaryCourse ? (
                        <>
                          <button
                            onClick={() => router.push(`/courses/${primaryCourse.courseSlug}`)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                          >
                            <BookOpen className="h-4 w-4" />
                            Open course
                          </button>
                          <button
                            onClick={() => router.push(`${cmsRoute}?course=${primaryCourse.courseSlug}`)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                          >
                            <LibraryBig className="h-4 w-4" />
                            Edit curriculum
                          </button>
                        </>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>

            <PaginationControls pagination={pagination} itemLabel="lessons" onPageChange={setCurrentPage} />
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-lg shadow-slate-100">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-black text-slate-950">{value}</div>
    </div>
  );
}
