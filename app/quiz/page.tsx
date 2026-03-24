'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, BookOpen, Loader2, Search, Trophy } from 'lucide-react';

import PaginationControls from '@/components/ui/PaginationControls';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { CourseCatalog, PaginationMeta, QuizWithDetails } from '@/lib/types';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

function findCourseForQuiz(quizId: string, courses: CourseCatalog[]) {
  const matches = courses.filter((course) => quizId.startsWith(course.slug)).sort((left, right) => right.slug.length - left.slug.length);
  return matches[0] || null;
}

const PAGE_SIZE = 9;

export default function QuizListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<QuizWithDetails[]>([]);
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoading(true);
        setError('');
        const [quizResponse, courseResponse] = await Promise.all([
          api.getQuizzes({
            search: debouncedSearchTerm || undefined,
            page: currentPage,
            pageSize: PAGE_SIZE,
          }),
          api.getCourseCatalog(),
        ]);
        setQuizzes(quizResponse.data);
        setPagination(quizResponse.pagination);
        setCourses(courseResponse.data);
      } catch (loadError: any) {
        setError(loadError.message || 'Unable to load quizzes right now.');
      } finally {
        setLoading(false);
      }
    };

    void loadQuizzes();
  }, [currentPage, debouncedSearchTerm]);

  const summaries = useMemo(
    () =>
      quizzes.map((quiz) => {
        const linkedCourse = quiz.courseSlug ? courses.find((course) => course.slug === quiz.courseSlug) : findCourseForQuiz(quiz.id, courses);
        return { ...quiz, linkedCourse };
      }),
    [courses, quizzes]
  );

  if (loading && quizzes.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-700" />
          <p className="mt-3 text-sm text-slate-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#eef2ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200">
          <h1 className="text-3xl font-black tracking-tight text-slate-950">Quiz library</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Take live assessment checkpoints backed by the current question bank. Logged-in student accounts can save attempts back to course progress.
          </p>
          {!user ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              You can preview quizzes without signing in, but attempts only count toward course progress for signed-in student accounts.
            </div>
          ) : user.role !== 'Student' ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Your current role can review quizzes here, but quiz attempts are only stored for student accounts.
            </div>
          ) : null}
        </section>

        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search quizzes by title or ID"
              className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </section>

        {summaries.length === 0 ? (
          <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-14 text-center shadow-lg shadow-slate-100">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-xl font-bold text-slate-950">No quizzes available yet</h2>
            <p className="mt-2 text-sm text-slate-600">Quiz items will appear here as soon as questions are published to the bank.</p>
          </section>
        ) : (
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg shadow-slate-100">
            <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
              {summaries.map((quiz) => (
                <article key={quiz.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {quiz.totalQuestions || 0} questions
                    </div>
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-slate-950">{quiz.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">Quiz ID: {quiz.id}</p>

                  {quiz.linkedCourse ? (
                    <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
                      <div className="font-semibold text-slate-950">{quiz.linkedCourse.title}</div>
                      <div className="mt-1">
                        {quiz.linkedCourse.category} / {quiz.linkedCourse.difficulty}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-slate-200 px-4 py-4 text-sm text-slate-600">
                      This quiz is not currently linked to a course card.
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => router.push(`/quiz/${quiz.id}`)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Start quiz
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    {quiz.linkedCourse ? (
                      <button
                        onClick={() => router.push(`/courses/${quiz.linkedCourse!.slug}`)}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                      >
                        <BookOpen className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            <PaginationControls pagination={pagination} itemLabel="quizzes" onPageChange={setCurrentPage} />
          </section>
        )}
      </div>
    </div>
  );
}
