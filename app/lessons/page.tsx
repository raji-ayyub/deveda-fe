'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookLock, BookOpen, Clock3, Loader2, Lock, Search, Sparkles } from 'lucide-react';

import PaginationControls from '@/components/ui/PaginationControls';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { LessonLibraryItem, PaginationMeta } from '@/lib/types';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

const PAGE_SIZE = 9;

export default function LessonsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<LessonLibraryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>(undefined);
  const [summary, setSummary] = useState({
    totalLessons: 0,
    availableLessons: 0,
    lockedLessons: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [accessFilter, setAccessFilter] = useState<'all' | 'available' | 'locked'>('all');

  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  useEffect(() => {
    setCurrentPage(1);
  }, [accessFilter, debouncedSearchTerm]);

  useEffect(() => {
    const loadLessons = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.getLessonLibrary({
          search: debouncedSearchTerm.trim() || undefined,
          accessStatus: accessFilter === 'all' ? undefined : accessFilter,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });
        setLessons(response.data);
        setPagination(response.pagination);
        setSummary({
          totalLessons: Number(response.summary?.totalLessons || 0),
          availableLessons: Number(response.summary?.availableLessons || 0),
          lockedLessons: Number(response.summary?.lockedLessons || 0),
        });
      } catch (loadError: any) {
        setError(loadError.message || 'Unable to load the lesson library right now.');
      } finally {
        setLoading(false);
      }
    };

    void loadLessons();
  }, [accessFilter, currentPage, debouncedSearchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const hasResults = lessons.length > 0;

  const accessOptions = useMemo(
    () => [
      { key: 'all', label: 'All lessons' },
      { key: 'available', label: 'Open for you' },
      { key: 'locked', label: 'Locked' },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_45%,#eef2ff_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_58%,#38bdf8_100%)] p-8 text-white shadow-2xl shadow-slate-300">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" />
            Lesson library
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Course-linked sub-lessons</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-200">
            Every lesson here belongs to a course path. If you are enrolled in the linked course, you can open the exact sub-lesson from here. If not, we will take you to the course so you can register first.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <StatCard label="Published lessons" value={String(summary.totalLessons)} />
            <StatCard label="Open for you" value={String(summary.availableLessons)} />
            <StatCard label="Locked by enrollment" value={String(summary.lockedLessons)} />
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search lessons, courses, or modules"
                className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {accessOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setAccessFilter(option.key as typeof accessFilter)}
                  className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                    accessFilter === option.key
                      ? 'bg-slate-950 text-white'
                      : 'border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8">
          {loading && !hasResults ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-slate-200 bg-white">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" />
                <p className="mt-3 text-sm text-slate-600">Loading lesson library...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700">{error}</div>
          ) : !hasResults ? (
            <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center shadow-lg shadow-slate-100">
              <BookLock className="mx-auto h-12 w-12 text-slate-300" />
              <h2 className="mt-4 text-xl font-bold text-slate-950">No sub-lessons match this view yet</h2>
              <p className="mt-2 text-sm text-slate-600">Adjust the filters or wait for more published lessons to appear.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg shadow-slate-100">
              <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
                {lessons.map((lesson) => {
                  const primaryCourse = lesson.courseRefs[0];
                  const isAvailable = lesson.accessStatus === 'available';
                  const actionLabel = isAvailable ? 'Open lesson' : primaryCourse ? 'View course' : 'Locked';

                  return (
                    <article key={lesson.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{lesson.contentType}</div>
                            <h2 className="mt-2 text-xl font-bold text-slate-950">{lesson.title}</h2>
                          </div>
                          <div
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                              isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {isAvailable ? <BookOpen className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                            {isAvailable ? 'Available' : 'Locked'}
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">{lesson.summary}</p>
                      </div>

                      <div className="space-y-4 px-5 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock3 className="h-4 w-4 text-blue-700" />
                          {lesson.durationMinutes} minutes
                        </div>

                        {lesson.courseRefs.length > 0 ? (
                          <div className="space-y-2">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Included in</div>
                            {lesson.courseRefs.slice(0, 2).map((courseRef) => (
                              <div key={`${lesson.id}-${courseRef.courseSlug}-${courseRef.lessonSlug}`} className="rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-700">
                                <div className="font-semibold text-slate-900">{courseRef.courseTitle}</div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {courseRef.moduleTitle} / lesson route `{courseRef.lessonSlug}`
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {lesson.learningFlow?.length ? (
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Learning flow</div>
                            <p className="mt-2 text-sm text-slate-700">{lesson.learningFlow.slice(0, 2).join(' / ')}</p>
                          </div>
                        ) : null}

                        <button
                          onClick={() => {
                            if (isAvailable && lesson.entryRoute) {
                              router.push(lesson.entryRoute);
                              return;
                            }
                            if (primaryCourse) {
                              router.push(`/courses/${primaryCourse.courseSlug}`);
                              return;
                            }
                            if (!user) {
                              router.push('/login');
                            }
                          }}
                          className={`inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                            isAvailable
                              ? 'bg-slate-950 text-white hover:bg-blue-700'
                              : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700'
                          }`}
                        >
                          {actionLabel}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <PaginationControls pagination={pagination} itemLabel="lessons" onPageChange={handlePageChange} />
            </div>
          )}
        </section>

        {!user ? (
          <div className="mt-8 rounded-[28px] border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-lg shadow-slate-100">
            Sign in to see which sub-lessons are already unlocked by your course enrollments.
            <Link href="/login" className="ml-2 font-semibold text-blue-700">
              Go to login
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}
