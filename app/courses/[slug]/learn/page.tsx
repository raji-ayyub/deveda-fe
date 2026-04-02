'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Bot, CheckCircle, ChevronLeft, ChevronRight, Clock, FileText, Gamepad2, HelpCircle, Play, Star, Target, Video } from 'lucide-react';

import { AchievementCelebrationModal } from '@/components/achievements/AchievementCelebrationModal';
import LessonTutorDrawer from '@/components/agents/LessonTutorDrawer';
import LessonCodePlayground from '@/components/lesson/LessonCodePlayground';
import LessonGameArcade from '@/components/lesson/LessonGameArcade';
import RichContentRenderer from '@/components/lesson/RichContentRenderer';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { CourseCurriculumLesson, UserAchievement, UserCourse } from '@/lib/types';

type LessonPlayerItem = CourseCurriculumLesson & {
  moduleTitle: string;
  moduleOrder: number;
  assessmentTitle?: string | null;
};

function isGeneratedLesson(lesson: CourseCurriculumLesson) {
  return lesson.generationStatus !== 'planned';
}

function deriveCompletedLessonSlugs(userCourse: UserCourse | null, lessonList: LessonPlayerItem[]) {
  const validSlugs = new Set(lessonList.map((lesson) => lesson.slug));
  const stored = (userCourse?.completedLessonSlugs || []).filter((slug) => validSlugs.has(slug));
  if (stored.length > 0) {
    return Array.from(new Set(stored));
  }

  const progress = userCourse?.progress || 0;
  const completedCount = lessonList.length > 0 ? Math.floor((progress / 100) * lessonList.length) : 0;
  return lessonList.slice(0, completedCount).map((lesson) => lesson.slug);
}

function firstIncompleteLessonSlug(lessonList: LessonPlayerItem[], completedLessonSlugs: string[]) {
  const completed = new Set(completedLessonSlugs);
  return lessonList.find((lesson) => !completed.has(lesson.slug))?.slug || lessonList[0]?.slug || '';
}

const CourseLearnPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isLearner = user?.role === 'Student';

  const slug = params.slug as string;
  const requestedLessonSlug = searchParams.get('lesson') || '';
  const requestedFocus = searchParams.get('focus') || '';

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any>(null);
  const [userCourse, setUserCourse] = useState<UserCourse | null>(null);
  const [activeLessonSlug, setActiveLessonSlug] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [celebrationAwards, setCelebrationAwards] = useState<UserAchievement[]>([]);
  const [lessonTutorOpen, setLessonTutorOpen] = useState(false);
  const [shouldFocusGame, setShouldFocusGame] = useState(false);

  const lessonViewportRef = useRef<HTMLDivElement | null>(null);
  const lessonGameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadCourseData = async () => {
      if (!slug || !user || !isLearner) {
        if (user && !isLearner) {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const [courseRes, curriculumRes, userCoursesRes] = await Promise.all([
          api.getCourseBySlug(slug),
          api.getCourseCurriculum(slug),
          api.getUserCourses(user.id),
        ]);
        setCourse(courseRes.data);
        setCurriculum(curriculumRes.data);
        setUserCourse(userCoursesRes.data.find((item) => item.courseSlug === slug) || null);
      } catch (error) {
        console.error('Failed to load course:', error);
        router.push(`/courses/${slug}`);
      } finally {
        setLoading(false);
      }
    };

    void loadCourseData();
  }, [isLearner, router, slug, user]);

  const lessonList = useMemo<LessonPlayerItem[]>(
    () =>
      curriculum?.modules.flatMap((module: any) =>
        module.lessons.filter(isGeneratedLesson).map((lesson: CourseCurriculumLesson) => ({
          ...lesson,
          moduleTitle: module.title,
          moduleOrder: module.order,
          assessmentTitle: module.assessmentTitle,
        }))
      ) || [],
    [curriculum]
  );

  const totalLessons = lessonList.length;
  const completedLessonSlugs = useMemo(() => deriveCompletedLessonSlugs(userCourse, lessonList), [lessonList, userCourse]);
  const completedLessonSet = useMemo(() => new Set(completedLessonSlugs), [completedLessonSlugs]);
  const lessonProgressValue = totalLessons > 0 ? Math.round((completedLessonSlugs.length / totalLessons) * 100) : 0;
  const progressValue = Math.max(userCourse?.progress || 0, lessonProgressValue);

  useEffect(() => {
    if (!lessonList.length) {
      if (activeLessonSlug) {
        setActiveLessonSlug('');
      }
      return;
    }

    const validLessonSlugs = new Set(lessonList.map((lesson) => lesson.slug));
    const preferredSlug =
      (requestedLessonSlug && validLessonSlugs.has(requestedLessonSlug) && requestedLessonSlug) ||
      (activeLessonSlug && validLessonSlugs.has(activeLessonSlug) && activeLessonSlug) ||
      ((userCourse?.currentLessonSlug && validLessonSlugs.has(userCourse.currentLessonSlug) && userCourse.currentLessonSlug) || '') ||
      firstIncompleteLessonSlug(lessonList, completedLessonSlugs);

    if (preferredSlug && preferredSlug !== activeLessonSlug) {
      setActiveLessonSlug(preferredSlug);
    }
  }, [activeLessonSlug, completedLessonSlugs, lessonList, requestedLessonSlug, userCourse?.currentLessonSlug]);

  const currentLessonIndex = useMemo(() => {
    if (!lessonList.length) {
      return 0;
    }
    const index = lessonList.findIndex((lesson) => lesson.slug === activeLessonSlug);
    return index >= 0 ? index : 0;
  }, [activeLessonSlug, lessonList]);

  const activeLesson = lessonList[currentLessonIndex];
  const activeModule = curriculum?.modules.find((module: any) => module.title === activeLesson?.moduleTitle) || null;
  const remainingMinutes = lessonList.slice(currentLessonIndex).reduce((total, lesson) => total + lesson.durationMinutes, 0);
  const activeLessonHasGame = Boolean(activeLesson?.gameKey);
  const gameLessonCount = useMemo(() => lessonList.filter((lesson) => lesson.gameKey).length, [lessonList]);

  useEffect(() => {
    if (requestedFocus === 'game') {
      setShouldFocusGame(true);
    }
  }, [requestedFocus]);

  useEffect(() => {
    if (!activeLesson) {
      return;
    }
    const nextUrl = `/courses/${slug}/learn?lesson=${activeLesson.slug}`;
    if (typeof window !== 'undefined' && window.location.pathname + window.location.search !== nextUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [activeLesson, router, slug]);

  useEffect(() => {
    if (!shouldFocusGame || !activeLessonHasGame) {
      return;
    }

    const timer = window.setTimeout(() => {
      scrollToLessonGame();
      setShouldFocusGame(false);
      router.replace(`/courses/${slug}/learn?lesson=${activeLesson?.slug}`, { scroll: false });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [activeLesson?.slug, activeLessonHasGame, router, shouldFocusGame, slug]);

  const syncCourseProgress = async (nextCompletedLessonSlugs: string[], nextCurrentLessonSlug: string | null) => {
    if (!user || !userCourse) {
      return;
    }

    const validSlugs = new Set(lessonList.map((lesson) => lesson.slug));
    const normalizedCompletedSlugs = Array.from(new Set(nextCompletedLessonSlugs)).filter((lessonSlug) => validSlugs.has(lessonSlug));
    const lessonBasedProgress = totalLessons > 0 ? Math.round((normalizedCompletedSlugs.length / totalLessons) * 100) : 0;
    const nextProgress = Math.max(userCourse.progress || 0, lessonBasedProgress);
    const completed = nextProgress >= 100 || (totalLessons > 0 && normalizedCompletedSlugs.length >= totalLessons);

    try {
      const response = await api.updateCourseProgress(user.id, slug, nextProgress, completed, {
        completedLessonSlugs: normalizedCompletedSlugs,
        currentLessonSlug: nextCurrentLessonSlug,
      });
      setUserCourse(response.data.course);
      if (response.data.awards.length > 0) {
        setCelebrationAwards(response.data.awards);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleLessonSelect = (lessonSlug: string) => {
    setActiveLessonSlug(lessonSlug);
    void syncCourseProgress(completedLessonSlugs, lessonSlug);
  };

  const scrollLessonViewportToTop = () => {
    const viewport = lessonViewportRef.current;
    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToLessonGame = () => {
    const target = lessonGameRef.current;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLessonComplete = () => {
    if (!activeLesson) {
      return;
    }

    const nextCompletedLessonSlugs = Array.from(new Set([...completedLessonSlugs, activeLesson.slug]));
    const nextPendingLesson =
      lessonList.slice(currentLessonIndex + 1).find((lesson) => !nextCompletedLessonSlugs.includes(lesson.slug)) ||
      lessonList[currentLessonIndex + 1] ||
      activeLesson;

    setActiveLessonSlug(nextPendingLesson.slug);
    scrollLessonViewportToTop();
    void syncCourseProgress(nextCompletedLessonSlugs, nextPendingLesson.slug);
  };

  const goToAdjacentLesson = (direction: -1 | 1) => {
    const targetIndex = currentLessonIndex + direction;
    if (targetIndex < 0 || targetIndex >= totalLessons) {
      return;
    }
    handleLessonSelect(lessonList[targetIndex].slug);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="border-b border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="space-y-2">
              <div className="h-5 w-28 animate-pulse rounded bg-gray-700" />
              <div className="h-4 w-40 animate-pulse rounded bg-gray-700/80" />
            </div>
            <div className="hidden md:block">
              <div className="h-2 w-48 animate-pulse rounded-full bg-gray-700" />
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-64px)]">
          <div className="hidden w-80 border-r border-gray-700 bg-gray-800 lg:block">
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`outline-skeleton-${index}`} className="rounded-lg bg-gray-700/70 px-3 py-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-600" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-600/80" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="mb-6 overflow-hidden rounded-xl bg-black">
                <div className="aspect-video animate-pulse bg-gradient-to-br from-gray-900 to-black" />
                <div className="bg-gray-800 px-4 py-3">
                  <div className="h-6 w-1/2 animate-pulse rounded bg-gray-700" />
                  <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-700/80" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <div className="rounded-xl bg-gray-800 p-6">
                    <div className="h-8 w-40 animate-pulse rounded bg-gray-700" />
                    <div className="mt-6 space-y-4">
                      <div className="h-6 w-3/4 animate-pulse rounded bg-gray-700" />
                      <div className="h-4 w-full animate-pulse rounded bg-gray-700/80" />
                      <div className="h-4 w-5/6 animate-pulse rounded bg-gray-700/80" />
                      <div className="rounded-[24px] bg-white p-6">
                        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                        <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
                        <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-100" />
                        <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-slate-100" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={`learn-sidebar-skeleton-${index}`} className="rounded-xl bg-gray-800 p-6">
                      <div className="h-6 w-32 animate-pulse rounded bg-gray-700" />
                      <div className="mt-4 space-y-3">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-700/80" />
                        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-700/80" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-700/80" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user && !isLearner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="max-w-lg rounded-[28px] border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <h1 className="text-2xl font-bold text-white">Learner view only</h1>
          <p className="mt-3 text-sm text-slate-300">
            Instructors review course content from the catalog and manage delivery from the instructor dashboard instead of the learner lesson player.
          </p>
          <button onClick={() => router.push('/instructor/dashboard')} className="mt-6 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950">
            Open instructor dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!course || !userCourse) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Course Not Found</h1>
          <button onClick={() => router.push('/courses')} className="rounded-lg bg-blue-600 px-4 py-2 text-white">
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  if (!activeLesson || totalLessons === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="max-w-xl rounded-[28px] border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <h1 className="text-2xl font-bold text-white">No lessons published yet</h1>
          <p className="mt-3 text-sm text-slate-300">
            This course has a shell or draft curriculum, but learner-ready lessons have not been generated yet. Check back after the instructor publishes the first module.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => router.push(`/courses/${slug}`)} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950">
              Return to course page
            </button>
            <button onClick={() => router.push('/courses')} className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200">
              Browse other courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AchievementCelebrationModal achievements={celebrationAwards} learnerName={user ? user.firstName : 'Learner'} onClose={() => setCelebrationAwards([])} />
      <LessonTutorDrawer
        open={lessonTutorOpen}
        onClose={() => setLessonTutorOpen(false)}
        courseSlug={slug}
        courseTitle={course.title}
        lessonSlug={activeLesson.slug}
        lessonTitle={activeLesson.title}
        currentProgress={progressValue}
      />

      <div className="border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button onClick={() => router.push(`/courses/${slug}`)} className="mr-4 flex items-center text-gray-300 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course
            </button>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-white">{course.title}</h1>
              <p className="text-sm text-gray-400">Lesson {currentLessonIndex + 1} of {totalLessons}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <div className="h-2 w-48 rounded-full bg-gray-700">
                <div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500" style={{ width: `${progressValue}%` }} />
              </div>
              <p className="mt-1 text-xs text-gray-400">{progressValue}% complete</p>
            </div>

            <div className="flex items-center space-x-2">
              <button onClick={() => setSidebarOpen((current) => !current)} className="rounded-xl border border-gray-600 px-3 py-2 text-sm font-semibold text-gray-200 transition hover:border-gray-500 hover:text-white">
                {sidebarOpen ? 'Hide outline' : 'Show outline'}
              </button>
              <button onClick={() => setLessonTutorOpen((current) => !current)} className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20">
                {lessonTutorOpen ? 'Hide Zara' : 'Open Zara'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {sidebarOpen ? (
          <div className="w-80 overflow-y-auto border-r border-gray-700 bg-gray-800">
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Course Content</h2>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1">
                {lessonList.map((lesson, index) => {
                  const isActive = lesson.slug === activeLesson.slug;
                  const isCompleted = completedLessonSet.has(lesson.slug);
                  const hasGame = Boolean(lesson.gameKey);
                  return (
                    <button
                      key={lesson.slug}
                      onClick={() => handleLessonSelect(lesson.slug)}
                      className={`w-full rounded-lg px-3 py-3 text-left transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                      <div className="flex items-center">
                        <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-700">
                          {isCompleted ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Play className="h-3 w-3" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">Lesson {index + 1}: {lesson.title}</div>
                            {hasGame ? (
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                                isActive ? 'bg-white/20 text-white' : 'bg-cyan-500/15 text-cyan-200'
                              }`}>
                                <Gamepad2 className="h-3 w-3" />
                                Game
                              </span>
                            ) : null}
                          </div>
                          <div className="text-sm opacity-75">{lesson.durationMinutes} min / {isCompleted ? 'Completed' : isActive ? 'In progress' : 'Not started'}</div>
                        </div>
                        {isActive ? <ChevronRight className="h-4 w-4" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 border-t border-gray-700 pt-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-400">At a glance</h3>
                <div className="space-y-2">
                  <div className="flex items-center rounded p-2 text-gray-300">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>{activeLesson.moduleTitle}</span>
                  </div>
                  <div className="flex items-center rounded p-2 text-gray-300">
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="capitalize">{activeLesson.contentType}</span>
                  </div>
                  {activeLessonHasGame ? (
                    <button onClick={scrollToLessonGame} className="flex w-full items-center rounded p-2 text-cyan-200 transition hover:bg-gray-700">
                      <Gamepad2 className="mr-2 h-4 w-4" />
                      <span>Play lesson challenge</span>
                    </button>
                  ) : null}
                  <button onClick={() => setLessonTutorOpen(true)} className="flex w-full items-center rounded p-2 text-gray-300 transition hover:bg-gray-700">
                    <Bot className="mr-2 h-4 w-4" />
                    <span>Open Zara</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <div ref={lessonViewportRef} className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6 overflow-hidden rounded-xl bg-black">
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-gray-300">{activeLesson.title} lesson media will play here</p>
                </div>
              </div>
              <div className="bg-gray-800 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Lesson {currentLessonIndex + 1}: {activeLesson.title}</h3>
                    <p className="text-gray-400">{activeLesson.durationMinutes} minutes</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {activeLessonHasGame ? (
                      <button onClick={scrollToLessonGame} className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-cyan-100 transition hover:bg-cyan-500/20">
                        Play Challenge
                      </button>
                    ) : null}
                    <button onClick={() => goToAdjacentLesson(1)} disabled={currentLessonIndex === totalLessons - 1} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                      Next Lesson
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="rounded-xl bg-gray-800 p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Lesson Content</h2>
                    <button onClick={() => setSidebarOpen((current) => !current)} className="p-2 text-gray-400 hover:text-white">
                      {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 text-xl font-semibold text-white">{activeLesson.title}</h3>
                      <p className="text-gray-300">{activeLesson.summary}</p>
                    </div>

                    <div className="rounded-lg bg-gray-700 p-4">
                      <h4 className="mb-2 font-semibold text-white">Lesson snapshot</h4>
                      <div className={`grid gap-3 ${activeLessonHasGame ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                        <div className="rounded-lg bg-gray-800 p-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Module</div>
                          <div className="mt-2 text-sm font-medium text-white">{activeLesson.moduleTitle}</div>
                        </div>
                        <div className="rounded-lg bg-gray-800 p-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Format</div>
                          <div className="mt-2 text-sm font-medium capitalize text-white">{activeLesson.contentType}</div>
                        </div>
                        <div className="rounded-lg bg-gray-800 p-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Estimated time</div>
                          <div className="mt-2 text-sm font-medium text-white">{activeLesson.durationMinutes} minutes</div>
                        </div>
                        {activeLessonHasGame ? (
                          <button onClick={scrollToLessonGame} className="rounded-lg bg-cyan-500/10 p-3 text-left transition hover:bg-cyan-500/20">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">Challenge</div>
                            <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white">
                              <Gamepad2 className="h-4 w-4 text-cyan-300" />
                              Play now
                            </div>
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {activeLesson.learningObjectives?.length ? (
                      <div className="rounded-lg bg-gray-700 p-4">
                        <h4 className="mb-3 text-lg font-semibold text-white">Learning objectives</h4>
                        <ul className="ml-5 list-disc space-y-2 text-sm text-gray-200">
                          {activeLesson.learningObjectives.map((objective) => (
                            <li key={objective}>{objective}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {activeLesson.learningFlow?.length ? (
                      <div className="rounded-lg bg-gray-700 p-4">
                        <h4 className="mb-3 text-lg font-semibold text-white">Learning flow</h4>
                        <ol className="ml-5 list-decimal space-y-2 text-sm text-gray-200">
                          {activeLesson.learningFlow.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    ) : null}

                    <div className="rounded-[24px] bg-white p-6 text-slate-900">
                      <RichContentRenderer content={activeLesson.contentMarkdown || ''} />
                    </div>

                    {activeLesson.visualAidMarkdown ? (
                      <div className="rounded-[24px] border border-cyan-500/20 bg-cyan-500/10 p-6">
                        <h4 className="mb-4 text-lg font-semibold text-white">Visual aid</h4>
                        <div className="rounded-[20px] bg-white p-5 text-slate-900">
                          <RichContentRenderer content={activeLesson.visualAidMarkdown} />
                        </div>
                      </div>
                    ) : null}

                    {activeLessonHasGame ? (
                      <div ref={lessonGameRef}>
                        <LessonGameArcade
                          userId={user?.id || ''}
                          courseSlug={slug}
                          lessonSlug={activeLesson.slug}
                          lessonTitle={activeLesson.title}
                          gameKey={activeLesson.gameKey}
                          onAskZara={() => setLessonTutorOpen(true)}
                          onAwards={(awards) => setCelebrationAwards((current) => [...awards, ...current])}
                        />
                      </div>
                    ) : null}

                    {activeLesson.practicePrompt ? (
                      <div className="rounded-lg border border-blue-800/50 bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4">
                        <div className="mb-2 flex items-center">
                          <Target className="mr-2 h-5 w-5 text-blue-400" />
                          <h5 className="font-semibold text-white">Practice challenge</h5>
                        </div>
                        <p className="mb-3 text-gray-300">{activeLesson.practicePrompt}</p>
                        <button onClick={() => setLessonTutorOpen(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                          Ask Zara
                        </button>
                      </div>
                    ) : null}

                    {activeLesson.quizId ? (
                      <div className="rounded-lg border border-amber-800/50 bg-gradient-to-r from-amber-900/30 to-orange-900/30 p-4">
                        <div className="mb-2 flex items-center">
                          <FileText className="mr-2 h-5 w-5 text-amber-300" />
                          <h5 className="font-semibold text-white">{activeLesson.quizTitle || `${activeLesson.title} assessment`}</h5>
                        </div>
                        <p className="mb-3 text-sm text-gray-300">
                          Open the linked assessment whenever you are ready to prove this lesson in a scored format.
                        </p>
                        <button onClick={() => router.push(`/quiz/${activeLesson.quizId}`)} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400">
                          Start lesson assessment
                        </button>
                      </div>
                    ) : null}

                    {activeLesson.playground ? <LessonCodePlayground playground={activeLesson.playground} /> : null}
                  </div>
                </div>

                <div className="mt-6 flex justify-between gap-4">
                  <button onClick={() => goToAdjacentLesson(-1)} disabled={currentLessonIndex === 0} className="flex items-center rounded-lg bg-gray-800 px-6 py-3 text-gray-300 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous Lesson
                  </button>
                  <button onClick={handleLessonComplete} className="flex items-center rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-white hover:opacity-90">
                    Mark Complete
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </button>
                  <button onClick={() => goToAdjacentLesson(1)} disabled={currentLessonIndex === totalLessons - 1} className="flex items-center rounded-lg bg-gray-800 px-6 py-3 text-gray-300 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50">
                    Next Lesson
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  <div className="rounded-xl border border-blue-800/30 bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6">
                    <h3 className="mb-4 text-lg font-semibold text-white">Your Progress</h3>
                    <div className="mb-4 text-center">
                      <div className="relative mx-auto h-32 w-32">
                        <svg className="h-full w-full" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#374151" strokeWidth="10" />
                          <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${progressValue * 2.83} 283`} transform="rotate(-90 50 50)" />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-white">{progressValue}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Completed Lessons</span>
                        <span className="font-medium text-white">{completedLessonSlugs.length}/{totalLessons}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Estimated remaining</span>
                        <span className="font-medium text-white">{remainingMinutes} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-800 p-6">
                    <h3 className="mb-4 text-lg font-semibold text-white">Course context</h3>
                    <div className="space-y-3">
                      <div className="flex items-center rounded-lg bg-gray-700 p-3">
                        <Video className="mr-3 h-5 w-5 text-blue-400" />
                        <div className="flex-1">
                          <div className="font-medium text-white">Current module</div>
                          <div className="text-sm text-gray-400">{activeLesson.moduleTitle}</div>
                        </div>
                      </div>
                      <div className="flex items-center rounded-lg bg-gray-700 p-3">
                        <FileText className="mr-3 h-5 w-5 text-green-400" />
                        <div className="flex-1">
                          <div className="font-medium text-white">Lesson type</div>
                          <div className="text-sm capitalize text-gray-400">{activeLesson.contentType}</div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-gray-700 p-3">
                        <div className="font-medium text-white">Key takeaways</div>
                        <div className="mt-2 space-y-2 text-sm text-gray-300">
                          {(activeLesson.keyTakeaways || []).slice(0, 3).map((takeaway) => (
                            <div key={takeaway}>{takeaway}</div>
                          ))}
                        </div>
                      </div>
                      {curriculum?.learningFlow?.length ? (
                        <div className="rounded-lg bg-gray-700 p-3">
                          <div className="font-medium text-white">Course flow</div>
                          <div className="mt-2 space-y-2 text-sm text-gray-300">
                            {curriculum.learningFlow.slice(0, 4).map((step: string) => (
                              <div key={step}>{step}</div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      <div className="rounded-lg bg-gray-700 p-3">
                        <div className="font-medium text-white">Interactive challenges</div>
                        <div className="mt-2 text-sm text-gray-300">
                          {gameLessonCount > 0
                            ? `${gameLessonCount} lesson${gameLessonCount === 1 ? '' : 's'} in this course currently include a playable challenge.`
                            : 'No lesson challenges are published for this course yet.'}
                        </div>
                      </div>
                      {activeLessonHasGame ? (
                        <button onClick={scrollToLessonGame} className="group flex w-full items-center rounded-lg bg-cyan-500/10 p-3 text-left transition-colors hover:bg-cyan-500/20">
                          <Gamepad2 className="mr-3 h-5 w-5 text-cyan-300" />
                          <div className="flex-1">
                            <div className="font-medium text-white">This lesson has a challenge</div>
                            <div className="text-sm text-cyan-100/80">Jump straight into the arcade experience for this topic.</div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-cyan-200 group-hover:text-white" />
                        </button>
                      ) : null}
                      <button onClick={() => setLessonTutorOpen(true)} className="group flex w-full items-center rounded-lg bg-gray-700 p-3 text-left transition-colors hover:bg-gray-600">
                        <HelpCircle className="mr-3 h-5 w-5 text-yellow-400" />
                        <div className="flex-1">
                          <div className="font-medium text-white">Need another explanation?</div>
                          <div className="text-sm text-gray-400">Open Zara for examples, clearer wording, and gentle walkthroughs.</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-yellow-800/30 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-6">
                    <div className="mb-4 flex items-center">
                      <Star className="mr-3 h-5 w-5 text-yellow-400" />
                      <h3 className="text-lg font-semibold text-white">Module checkpoint</h3>
                    </div>
                    <p className="mb-4 text-gray-300">
                      {activeModule?.assessmentTitle ? `${activeModule.assessmentTitle} is the next checkpoint for this module.` : 'This module does not yet have a checkpoint configured.'}
                    </p>
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{activeModule?.assessmentQuizId ? `Quiz ID: ${activeModule.assessmentQuizId}` : 'Checkpoint can be added from the curriculum studio.'}</span>
                    </div>
                    {activeModule?.assessmentQuizId ? (
                      <button
                        onClick={() => router.push(`/quiz/${activeModule.assessmentQuizId}`)}
                        className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                      >
                        Start module checkpoint
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button onClick={() => setLessonTutorOpen((current) => !current)} className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-2xl transition hover:bg-cyan-400">
        <Bot className="h-4 w-4" />
        {lessonTutorOpen ? 'Close Zara' : 'Zara'}
      </button>

      {!sidebarOpen ? (
        <button onClick={() => setSidebarOpen(true)} className="fixed bottom-6 left-6 z-40 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-2xl transition hover:bg-slate-100">
          <BookOpen className="h-4 w-4" />
          Show course content
        </button>
      ) : null}
    </div>
  );
};

export default CourseLearnPage;
