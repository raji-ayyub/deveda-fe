'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Loader2, Search } from 'lucide-react';

import PaginationControls from '@/components/ui/PaginationControls';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { CourseCatalog, PaginationMeta, UserCourse } from '@/lib/types';
import { getRoleLoginRedirect } from '@/lib/roleRoutes';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type CatalogStats = {
  total_courses: number;
  total_enrollments: number;
  unique_enrolled_users: number;
  popular_courses: Array<{ _id: string; count: number }>;
  categories: Array<{ _id: string; count: number }>;
  difficulties: Array<{ _id: string; count: number }>;
  average_duration?: number;
  total_lessons?: number;
  total_quizzes?: number;
};

const PAGE_SIZE = 9;

export default function CoursesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isLearner = user?.role === 'Student';

  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [catalogStats, setCatalogStats] = useState<CatalogStats | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'duration' | 'title'>('popular');
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, categoryFilter, difficultyFilter, sortBy]);

  useEffect(() => {
    const loadSupportData = async () => {
      try {
        const [statsResponse, enrollmentsResponse] = await Promise.all([
          api.getCourseCatalogStats(),
          isLearner && user ? api.getUserCourses(user.id) : Promise.resolve({ data: [] as UserCourse[] }),
        ]);
        setCatalogStats(statsResponse.data as CatalogStats);
        setUserCourses(enrollmentsResponse.data);
      } catch (loadError: any) {
        setError(loadError.message || 'Unable to load the course catalog right now.');
      }
    };

    void loadSupportData();
  }, [isLearner, user]);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.getCourseCatalog({
          category: categoryFilter === 'All' ? undefined : categoryFilter,
          difficulty: difficultyFilter === 'All' ? undefined : difficultyFilter,
          search: debouncedSearchTerm.trim() || undefined,
          sortBy,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });
        setCourses(response.data);
        setPagination(response.pagination);
      } catch (loadError: any) {
        setError(loadError.message || 'Unable to load the course catalog right now.');
      } finally {
        setLoading(false);
      }
    };

    void loadCatalog();
  }, [categoryFilter, currentPage, debouncedSearchTerm, difficultyFilter, sortBy]);

  const popularityMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of catalogStats?.popular_courses || []) {
      if (item?._id) {
        map.set(item._id, item.count || 0);
      }
    }
    return map;
  }, [catalogStats]);

  const categories = useMemo(
    () => ['All', ...((catalogStats?.categories || []).map((item) => item._id).filter(Boolean))],
    [catalogStats]
  );

  const difficulties = useMemo(
    () => ['All', ...((catalogStats?.difficulties || []).map((item) => item._id).filter(Boolean))],
    [catalogStats]
  );

  const enrolledCourseMap = useMemo(() => new Map(userCourses.map((course) => [course.courseSlug, course])), [userCourses]);

  const learnerStats = useMemo(() => {
    const completed = userCourses.filter((course) => course.completed).length;
    const inProgress = userCourses.filter((course) => !course.completed && course.progress > 0).length;
    return { completed, inProgress };
  }, [userCourses]);

  const handleEnroll = async (courseSlug: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!isLearner) {
      router.push(getRoleLoginRedirect(user.role));
      return;
    }

    try {
      setEnrolling(courseSlug);
      setError('');
      const targetCourse = courses.find((course) => course.slug === courseSlug);
      const response = await api.enrollCourse(user.id, {
        courseSlug,
        category: targetCourse?.category,
        difficulty: targetCourse?.difficulty,
      });
      setUserCourses((current) => [...current, response.data]);
      router.push(`/courses/${courseSlug}`);
    } catch (enrollError: any) {
      setError(enrollError.message || 'Unable to enroll in this course right now.');
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#eef2ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Coding catalog
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Explore real course paths</h1>
              <p className="mt-3 max-w-3xl text-sm text-slate-600">
                Browse the current catalog, compare tracks, and jump into the path that fits the skill you want to build next.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <HeroStat label="Courses" value={String(catalogStats?.total_courses || pagination?.totalItems || 0)} />
              <HeroStat label="Enrollments" value={String(catalogStats?.total_enrollments || 0)} />
              <HeroStat label="Learners" value={String(catalogStats?.unique_enrolled_users || 0)} />
            </div>
          </div>

          {isLearner ? (
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                <BookOpen className="h-4 w-4 text-blue-700" />
                {userCourses.length} enrolled
              </span>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                {learnerStats.completed} completed
              </span>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                <Clock3 className="h-4 w-4 text-amber-700" />
                {learnerStats.inProgress} in progress
              </span>
            </div>
          ) : user ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              This view is read-only for your role. Manage live course creation and curriculum from your workspace instead.
              <button onClick={() => router.push(getRoleLoginRedirect(user.role))} className="ml-2 font-semibold text-blue-700">
                Open workspace
              </button>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Sign in as a learner to enroll and track progress from this catalog.
              <Link href="/login" className="ml-2 font-semibold text-blue-700">
                Go to login
              </Link>
            </div>
          )}
        </section>

        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.6fr_0.6fr_0.6fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, description, slug, or tags"
                className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'All' ? 'All categories' : category}
                </option>
              ))}
            </select>
            <select
              value={difficultyFilter}
              onChange={(event) => setDifficultyFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === 'All' ? 'All levels' : difficulty}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="popular">Most enrolled</option>
              <option value="newest">Newest</option>
              <option value="duration">Shortest duration</option>
              <option value="title">Title</option>
            </select>
          </div>
        </section>

        {loading && courses.length === 0 ? (
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg shadow-slate-100">
            <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <article key={`course-card-skeleton-${index}`} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
                    <div className="flex gap-2">
                      <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
                      <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
                    </div>
                    <div className="mt-4 h-7 w-4/5 animate-pulse rounded bg-slate-200" />
                    <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
                    <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="space-y-4 px-6 py-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Array.from({ length: 4 }).map((__, pillIndex) => (
                        <div key={`pill-${pillIndex}`} className="rounded-2xl bg-slate-50 px-4 py-3">
                          <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
                          <div className="mt-2 h-4 w-12 animate-pulse rounded bg-slate-100" />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <div className="h-12 flex-1 animate-pulse rounded-2xl bg-slate-200" />
                      <div className="h-12 w-20 animate-pulse rounded-2xl bg-slate-100" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : loading ? (
          <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-14 text-center shadow-lg shadow-slate-100">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" />
            <p className="mt-3 text-sm text-slate-600">Refreshing course results...</p>
          </section>
        ) : courses.length === 0 ? (
          <section className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
            No courses match the current filters.
          </section>
        ) : (
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg shadow-slate-100">
            <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => {
                const enrollment = enrolledCourseMap.get(course.slug);
                const isEnrolled = Boolean(enrollment);
                const popularity = popularityMap.get(course.slug) || 0;

                return (
                  <article key={course.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_60%,#eef2ff_100%)] px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{course.category}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{course.difficulty}</span>
                      </div>
                      <h2 className="mt-4 text-2xl font-bold text-slate-950">{course.title}</h2>
                      <p className="mt-2 text-sm text-slate-600">{course.description}</p>
                    </div>

                    <div className="space-y-4 px-6 py-6">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <MetaPill label="Duration" value={`${course.duration} min`} />
                        <MetaPill label="Lessons" value={String(course.totalLessons)} />
                        <MetaPill label="Quizzes" value={String(course.totalQuizzes)} />
                        <MetaPill label="Enrollments" value={String(popularity)} />
                      </div>

                      {course.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {course.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {isLearner && enrollment ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                          <div className="flex items-center justify-between text-sm text-emerald-800">
                            <span className="font-semibold">Your progress</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-emerald-100">
                            <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${enrollment.progress}%` }} />
                          </div>
                        </div>
                      ) : null}

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            if (isEnrolled) {
                              router.push(`/courses/${course.slug}`);
                              return;
                            }
                            if (!isLearner) {
                              router.push(`/courses/${course.slug}`);
                              return;
                            }
                            void handleEnroll(course.slug);
                          }}
                          disabled={Boolean(enrolling === course.slug)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                          {enrolling === course.slug ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Working...
                            </>
                          ) : isEnrolled ? (
                            <>
                              Continue
                              <ArrowRight className="h-4 w-4" />
                            </>
                          ) : isLearner ? (
                            <>
                              Enroll
                              <ArrowRight className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              View details
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </button>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <PaginationControls pagination={pagination} itemLabel="courses" onPageChange={setCurrentPage} />
          </section>
        )}
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-black text-slate-950">{value}</div>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
