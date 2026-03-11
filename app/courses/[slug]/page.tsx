'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  Loader2,
  MessageSquareText,
  Play,
  Share2,
  Target,
  User,
  Users,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { CourseCatalog, CourseCurriculum, CourseCurriculumModule, UserCourse } from '@/lib/types';

type CourseTab = 'overview' | 'curriculum' | 'enrollments';

export default function SingleCoursePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;
  const isLearner = user?.role === 'Student';

  const [course, setCourse] = useState<CourseCatalog | null>(null);
  const [curriculum, setCurriculum] = useState<CourseCurriculum | null>(null);
  const [userCourse, setUserCourse] = useState<UserCourse | null>(null);
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);
  const [relatedCourses, setRelatedCourses] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState<CourseTab>('overview');
  const [error, setError] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');

  useEffect(() => {
    if (slug) {
      loadCourseData();
    }
  }, [slug, user]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError('');

      const courseRes = await api.getCourseBySlug(slug);
      setCourse(courseRes.data);

      const [curriculumRes, enrollmentsRes, relatedRes] = await Promise.all([
        api.getCourseCurriculum(slug),
        api.getCourseEnrollments(slug).catch(() => ({ data: { enrollments: [] } })),
        api.getCourseCatalog({ category: courseRes.data.category }).catch(() => ({ data: [] })),
      ]);

      setCurriculum(curriculumRes.data);
      setRecentEnrollments(enrollmentsRes.data.enrollments || []);
      setRelatedCourses(
        (relatedRes.data || []).filter((item) => item.slug !== slug).slice(0, 3)
      );

      if (isLearner && user) {
        const userCoursesRes = await api.getUserCourses(user.id);
        setUserCourse(userCoursesRes.data.find((item) => item.courseSlug === slug) || null);
      } else {
        setUserCourse(null);
      }
    } catch (loadError: any) {
      console.error('Failed to load course:', loadError);
      setError(loadError.message || 'Unable to load this course right now.');
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!isLearner) {
      router.push('/instructor/dashboard/courses');
      return;
    }

    try {
      setEnrolling(true);
      const enrollment = await api.enrollCourse(user.id, {
        courseSlug: slug,
        category: course?.category,
        difficulty: course?.difficulty,
      });
      setUserCourse(enrollment.data);
      router.push(`/courses/${slug}/learn`);
    } catch (enrollError) {
      console.error('Failed to enroll:', enrollError);
      setError('Unable to enroll in this course right now.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleShare = async () => {
    if (!course || typeof window === 'undefined') {
      return;
    }

    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: course.title,
          text: course.description,
          url: shareUrl,
        });
        setShareFeedback('Course link shared.');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback('Course link copied.');
      }
    } catch {
      setShareFeedback('');
    }
  };

  const modules = curriculum?.modules || [];
  const milestones = curriculum?.milestoneProjects || [];
  const totalLessons = useMemo(
    () => modules.reduce((total, module) => total + module.lessons.length, 0),
    [modules]
  );
  const totalQuizzes = useMemo(
    () =>
      modules.reduce(
        (total, module) =>
          total +
          (module.assessmentQuizId ? 1 : 0) +
          module.lessons.filter((lesson) => lesson.quizId).length,
        0
      ),
    [modules]
  );
  const effectiveLessons = totalLessons || course?.totalLessons || 0;
  const effectiveQuizzes = totalQuizzes || course?.totalQuizzes || 0;
  const isEnrolled = Boolean(userCourse);
  const progress = userCourse?.progress || 0;
  const completedEnrollments = recentEnrollments.filter((item) => item.completed).length;
  const averageEnrollmentProgress = recentEnrollments.length
    ? Math.round(
        recentEnrollments.reduce((total, item) => total + (item.progress || 0), 0) / recentEnrollments.length
      )
    : 0;
  const learningHighlights = course?.tags?.length
    ? course.tags.slice(0, 6)
    : [
        `${course?.difficulty || 'Beginner'} level progression`,
        `${effectiveLessons} structured lessons`,
        `${effectiveQuizzes} quiz checkpoints`,
        `${milestones.length} milestone projects`,
      ].filter(Boolean);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
          <p className="mt-2 text-gray-600">{error || 'This course is unavailable right now.'}</p>
          <button
            onClick={() => router.push('/courses')}
            className="mt-6 inline-flex items-center rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Browse courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/courses')}
            className="inline-flex items-center text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to courses
          </button>
        </div>
      </div>

      <div className="bg-[linear-gradient(135deg,#1d4ed8_0%,#4338ca_50%,#0f172a_100%)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 text-white sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">{course.difficulty}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm">{course.category}</span>
              {isLearner && isEnrolled ? (
                <span className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold">
                  <CheckCircle className="mr-1 h-3.5 w-3.5" />
                  Enrolled
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight">{course.title}</h1>
            <p className="mt-4 max-w-3xl text-lg text-blue-50">{course.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-blue-100">
              <div className="inline-flex items-center">
                <User className="mr-2 h-4 w-4" />
                {course.instructor || 'Deveda Instructor Team'}
              </div>
              <div className="inline-flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Recently updated'}
              </div>
              <div className="inline-flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                English
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="mb-4 h-48 w-full rounded-2xl object-cover" />
            ) : null}

            {isLearner && isEnrolled ? (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Your progress</span>
                  <span className="font-bold text-blue-700">{progress}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : null}

            <div className="space-y-3 text-sm">
              <StatRow icon={Clock} label="Duration" value={formatDuration(course.duration)} />
              <StatRow icon={BookOpen} label="Lessons" value={String(effectiveLessons)} />
              <StatRow icon={BarChart3} label="Quizzes" value={String(effectiveQuizzes)} />
              <StatRow icon={Award} label="Milestones" value={String(milestones.length)} />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {isLearner ? (
                isEnrolled ? (
                  <button
                    onClick={() => router.push(`/courses/${slug}/learn`)}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    {userCourse?.completed ? 'Review course' : 'Continue learning'}
                    <Play className="ml-2 h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
                  >
                    {enrolling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      'Enroll now'
                    )}
                  </button>
                )
              ) : (
                <button
                  onClick={() => router.push('/instructor/dashboard/courses')}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Manage in instructor workspace
                </button>
              )}

              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share course
              </button>
            </div>

            {shareFeedback ? <p className="mt-3 text-xs text-emerald-700">{shareFeedback}</p> : null}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        ) : null}

        <div className="mb-8 border-b border-gray-200">
          <nav className="flex gap-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'curriculum', label: 'Curriculum' },
              { key: 'enrollments', label: 'Enrollments' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as CourseTab)}
                className={`border-b-2 px-1 py-3 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {activeTab === 'overview' ? (
              <>
                <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200">
                  <h2 className="text-2xl font-bold text-slate-950">What learners will build here</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {learningHighlights.map((item) => (
                      <div key={item} className="flex items-start rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <CheckCircle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                        <span className="text-sm text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-950">Course journey</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {modules.length > 0
                          ? `${modules.length} modules, ${effectiveLessons} lessons, and ${milestones.length} milestone projects.`
                          : 'The curriculum scaffold is ready for the instructor team to refine.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {modules.length > 0 ? (
                      modules.slice(0, 4).map((module) => (
                        <ModulePreview key={`${module.order}-${module.title}`} module={module} />
                      ))
                    ) : (
                      <EmptyCourseSection text="No modules have been published yet for this course." />
                    )}
                  </div>
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200">
                  <h2 className="text-2xl font-bold text-slate-950">Milestone projects</h2>
                  <div className="mt-5 space-y-4">
                    {milestones.length > 0 ? (
                      milestones.map((project) => (
                        <div key={`${project.milestoneOrder}-${project.title}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                                Milestone {project.milestoneOrder}
                              </div>
                              <h3 className="mt-2 text-lg font-bold text-slate-950">{project.title}</h3>
                              <p className="mt-2 text-sm text-slate-600">{project.description}</p>
                            </div>
                            <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {project.estimatedHours}h target
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyCourseSection text="Milestone projects will appear here as the course is expanded." />
                    )}
                  </div>
                </section>
              </>
            ) : null}

            {activeTab === 'curriculum' ? (
              <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200">
                <h2 className="text-2xl font-bold text-slate-950">Detailed curriculum</h2>
                <div className="mt-6 space-y-5">
                  {modules.length > 0 ? (
                    modules.map((module) => (
                      <div key={`${module.order}-${module.title}`} className="overflow-hidden rounded-3xl border border-slate-200">
                        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                Module {module.order}
                              </div>
                              <h3 className="mt-1 text-xl font-bold text-slate-950">{module.title}</h3>
                              <p className="mt-2 text-sm text-slate-600">{module.description}</p>
                            </div>
                            <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                              {module.lessons.length} lessons
                            </div>
                          </div>
                        </div>

                        <div className="divide-y divide-slate-200">
                          {module.lessons.map((lesson) => (
                            <div key={lesson.slug} className="flex items-center justify-between gap-4 px-6 py-4">
                              <div className="flex items-start gap-4">
                                <div className="rounded-full bg-blue-50 p-2 text-blue-700">
                                  <Play className="h-4 w-4" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-slate-950">{lesson.title}</h4>
                                  <p className="mt-1 text-sm text-slate-600">{lesson.summary}</p>
                                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                                    <span>{lesson.durationMinutes} min</span>
                                    <span className="capitalize">{lesson.contentType}</span>
                                    {lesson.quizId ? <span>Quiz: {lesson.quizId}</span> : null}
                                  </div>
                                </div>
                              </div>
                              {isLearner && isEnrolled ? (
                                <button
                                  onClick={() => router.push(`/courses/${slug}/learn`)}
                                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                                >
                                  Open
                                </button>
                              ) : null}
                            </div>
                          ))}
                        </div>

                        {module.assessmentTitle ? (
                          <div className="border-t border-slate-200 bg-amber-50 px-6 py-4">
                            <div className="flex items-center gap-3 text-sm text-amber-900">
                              <Award className="h-4 w-4" />
                              <span className="font-semibold">{module.assessmentTitle}</span>
                              {module.assessmentQuizId ? <span className="text-amber-700">Quiz ID: {module.assessmentQuizId}</span> : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <EmptyCourseSection text="The curriculum studio has not published detailed modules yet." />
                  )}
                </div>
              </section>
            ) : null}

            {activeTab === 'enrollments' ? (
              <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-950">Recent enrollments</h2>
                    <p className="mt-1 text-sm text-slate-600">A live view of learner activity for this course.</p>
                  </div>
                  <button
                    onClick={loadCourseData}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Refresh
                  </button>
                </div>

                {recentEnrollments.length > 0 ? (
                  <>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <MetricCard label="Active learners" value={String(recentEnrollments.length)} />
                      <MetricCard label="Average progress" value={`${averageEnrollmentProgress}%`} />
                      <MetricCard label="Completed" value={String(completedEnrollments)} />
                    </div>

                    <div className="mt-6 space-y-4">
                      {recentEnrollments.map((enrollment) => (
                        <div key={enrollment.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                              {enrollment.user.firstName.charAt(0)}
                              {enrollment.user.lastName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-950">
                                {enrollment.user.firstName} {enrollment.user.lastName}
                              </div>
                              <div className="mt-1 text-sm text-slate-500">
                                Joined {new Date(enrollment.enrolled_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-700">{enrollment.progress}%</div>
                            <div className="text-sm text-slate-500">{enrollment.completed ? 'Completed' : 'In progress'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyCourseSection text="No enrollments yet for this course." />
                )}
              </section>
            ) : null}
          </div>

          <div className="space-y-6">
            <aside className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200">
              <h3 className="text-lg font-bold text-slate-950">Instructor</h3>
              <div className="mt-4 flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-xl font-bold text-white">
                  {(course.instructor || 'D').charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-slate-950">{course.instructor || 'Deveda Instructor Team'}</div>
                  <p className="mt-2 text-sm text-slate-600">
                    Leads this course pathway and keeps the curriculum aligned with the lesson and milestone structure shown here.
                  </p>
                </div>
              </div>
            </aside>

            <aside className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200">
              <h3 className="text-lg font-bold text-slate-950">Course signals</h3>
              <div className="mt-5 space-y-4 text-sm text-slate-700">
                <FeatureRow icon={BookOpen} text={`${effectiveLessons} structured lessons`} />
                <FeatureRow icon={BarChart3} text={`${effectiveQuizzes} quiz checkpoints`} />
                <FeatureRow icon={Target} text={`${milestones.length} milestone projects`} />
                <FeatureRow icon={MessageSquareText} text="Lesson tutor support available through approved agent access" />
              </div>
            </aside>

            <aside className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-slate-950">Related courses</h3>
                <Users className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-5 space-y-4">
                {relatedCourses.length > 0 ? (
                  relatedCourses.map((relatedCourse) => (
                    <button
                      key={relatedCourse.slug}
                      onClick={() => router.push(`/courses/${relatedCourse.slug}`)}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:border-blue-300"
                    >
                      <div>
                        <div className="font-semibold text-slate-950">{relatedCourse.title}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {relatedCourse.difficulty} • {formatDuration(relatedCourse.duration)}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                  ))
                ) : (
                  <EmptyCourseSection text="More related courses will appear as the catalog expands." compact />
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="inline-flex items-center text-slate-600">
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </div>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-950">{value}</div>
    </div>
  );
}

function FeatureRow({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-blue-700" />
      <span>{text}</span>
    </div>
  );
}

function ModulePreview({ module }: { module: CourseCurriculumModule }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Module {module.order}</div>
      <h3 className="mt-2 text-lg font-bold text-slate-950">{module.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{module.description}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        <span>{module.lessons.length} lessons</span>
        {module.assessmentTitle ? <span>{module.assessmentTitle}</span> : null}
      </div>
    </div>
  );
}

function EmptyCourseSection({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-slate-500 ${compact ? 'px-4 py-6 text-sm' : 'px-6 py-10 text-sm'}`}>
      {text}
    </div>
  );
}

function formatDuration(minutes: number) {
  if (minutes <= 0) {
    return 'Flexible';
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}
