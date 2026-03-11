// app/courses/[slug]/learn/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AchievementCelebrationModal } from '@/components/achievements/AchievementCelebrationModal';
import LessonTutorDrawer from '@/components/agents/LessonTutorDrawer';
import RichContentRenderer from '@/components/lesson/RichContentRenderer';
import LessonCodePlayground from '@/components/lesson/LessonCodePlayground';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  ArrowLeft, Play, CheckCircle, BookOpen,
  Clock, ChevronRight, ChevronLeft,
  Target, Star, Video, FileText,
  HelpCircle,
  Bot
} from 'lucide-react';
import { CourseCurriculum, UserAchievement } from '@/lib/types';

const CourseLearnPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const isLearner = user?.role === 'Student';
  
  const slug = params.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<CourseCurriculum | null>(null);
  const [userCourse, setUserCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [celebrationAwards, setCelebrationAwards] = useState<UserAchievement[]>([]);
  const [lessonTutorOpen, setLessonTutorOpen] = useState(false);

  useEffect(() => {
    if (slug && user && isLearner) {
      loadCourseData();
    } else if (user && !isLearner) {
      setLoading(false);
    }
  }, [slug, user, isLearner]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // Get course details
      const courseRes = await api.getCourseBySlug(slug);
      setCourse(courseRes.data);

      const curriculumRes = await api.getCourseCurriculum(slug);
      setCurriculum(curriculumRes.data);
      
      // Get user progress
      const userCoursesRes = await api.getUserCourses(user!.id);
      const userCourseData = userCoursesRes.data.find(c => c.courseSlug === slug);
      setUserCourse(userCourseData || null);
      
    } catch (error) {
      console.error('Failed to load course:', error);
      router.push(`/courses/${slug}`);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (progress: number) => {
    if (!user || !userCourse) return;

    try {
      const completed = progress >= 100;
      const response = await api.updateCourseProgress(
        user.id,
        slug,
        progress,
        completed
      );

      setUserCourse(response.data.course);
      if (response.data.awards.length > 0) {
        setCelebrationAwards(response.data.awards);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleLessonComplete = () => {
    if (!course || !userCourse || totalLessons === 0) return;
    
    const lessonProgress = 100 / totalLessons;
    const newProgress = Math.min(userCourse.progress + lessonProgress, 100);
    
    updateProgress(newProgress);
    setCurrentLesson(Math.min(currentLesson + 1, totalLessons - 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course content...</p>
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
          <button
            onClick={() => router.push('/instructor/dashboard')}
            className="mt-6 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950"
          >
            Open instructor dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!course || !userCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <button
            onClick={() => router.push('/courses')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  const lessonList =
    curriculum?.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        ...lesson,
        moduleTitle: module.title,
        moduleOrder: module.order,
        assessmentTitle: module.assessmentTitle,
      }))
    ) || [];
  const totalLessons = lessonList.length;
  const activeLesson = lessonList[currentLesson];
  const completedLessons = Math.floor((userCourse.progress / 100) * totalLessons);
  const remainingMinutes = lessonList.slice(currentLesson).reduce((total, lesson) => total + lesson.durationMinutes, 0);
  const activeModule = curriculum?.modules.find((module) => module.title === activeLesson?.moduleTitle) || null;

  if (totalLessons === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="max-w-xl rounded-[28px] border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <h1 className="text-2xl font-bold text-white">No lessons published yet</h1>
          <p className="mt-3 text-sm text-slate-300">
            This course has been created, but the lesson curriculum has not been published yet. Check back after the instructor adds the first lessons.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => router.push(`/courses/${slug}`)}
              className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950"
            >
              Return to course page
            </button>
            <button
              onClick={() => router.push('/courses')}
              className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200"
            >
              Browse other courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AchievementCelebrationModal
        achievements={celebrationAwards}
        learnerName={user ? user.firstName : 'Learner'}
        onClose={() => setCelebrationAwards([])}
      />
      {course && (
        <LessonTutorDrawer
          open={lessonTutorOpen}
          onClose={() => setLessonTutorOpen(false)}
          courseSlug={slug}
          courseTitle={course.title}
          lessonSlug={activeLesson?.slug}
          lessonTitle={activeLesson?.title}
          currentProgress={Math.round(userCourse.progress)}
        />
      )}
      {/* Top Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => router.push(`/courses/${slug}`)}
              className="flex items-center text-gray-300 hover:text-white mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </button>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-white">{course.title}</h1>
              <p className="text-sm text-gray-400">
                Lesson {currentLesson + 1} of {totalLessons}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <div className="w-48 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${userCourse.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {userCourse.progress.toFixed(1)}% complete
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSidebarOpen((current) => !current)}
                className="rounded-xl border border-gray-600 px-3 py-2 text-sm font-semibold text-gray-200 transition hover:border-gray-500 hover:text-white"
              >
                {sidebarOpen ? 'Hide outline' : 'Show outline'}
              </button>
              <button
                onClick={() => setLessonTutorOpen((current) => !current)}
                className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
              >
                {lessonTutorOpen ? 'Hide tutor' : 'Open tutor'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Course Content</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-1">
                {lessonList.map((lesson, index) => (
                  <button
                    key={lesson.slug}
                    onClick={() => setCurrentLesson(index)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                      currentLesson === index
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                        {index < currentLesson ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          Lesson {index + 1}: {lesson.title}
                        </div>
                        <div className="text-sm opacity-75">
                          {lesson.durationMinutes} min / {index < currentLesson ? 'Completed' : 'Not started'}
                        </div>
                      </div>
                      {index === currentLesson && (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">At a glance</h3>
                <div className="space-y-2">
                  <div className="flex items-center rounded p-2 text-gray-300">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>{activeLesson?.moduleTitle || 'Current module'}</span>
                  </div>
                  <div className="flex items-center rounded p-2 text-gray-300">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="capitalize">{activeLesson?.contentType || 'lesson'}</span>
                  </div>
                  <button onClick={() => setLessonTutorOpen(true)} className="flex w-full items-center rounded p-2 text-gray-300 transition hover:bg-gray-700">
                    <Bot className="w-4 h-4 mr-2" />
                    <span>Open lesson tutor</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Video Player */}
            <div className="bg-black rounded-xl overflow-hidden mb-6">
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-300">{activeLesson?.title || `Lesson ${currentLesson + 1}`} video will play here</p>
                </div>
              </div>
              <div className="bg-gray-800 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Lesson {currentLesson + 1}: {activeLesson?.title || 'Current lesson'}
                    </h3>
                    <p className="text-gray-400">{activeLesson?.durationMinutes || 15} minutes</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setCurrentLesson(Math.min(totalLessons - 1, currentLesson + 1))}
                      disabled={currentLesson === totalLessons - 1}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next Lesson
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Lesson Content</h2>
                    <button
                      onClick={() => setSidebarOpen((current) => !current)}
                      className="p-2 text-gray-400 hover:text-white"
                    >
                      {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 text-xl font-semibold text-white">
                        {activeLesson?.title || 'Current lesson'}
                      </h3>
                      <p className="text-gray-300">
                        {activeLesson?.summary || 'This lesson summary will appear here once the curriculum is available.'}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-700 p-4">
                      <h4 className="mb-2 font-semibold text-white">Lesson snapshot</h4>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-lg bg-gray-800 p-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Module</div>
                          <div className="mt-2 text-sm font-medium text-white">{activeLesson?.moduleTitle || 'Current module'}</div>
                        </div>
                        <div className="rounded-lg bg-gray-800 p-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Format</div>
                          <div className="mt-2 text-sm font-medium capitalize text-white">{activeLesson?.contentType || 'lesson'}</div>
                        </div>
                        <div className="rounded-lg bg-gray-800 p-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Estimated time</div>
                          <div className="mt-2 text-sm font-medium text-white">{activeLesson?.durationMinutes || 0} minutes</div>
                        </div>
                      </div>
                    </div>

                    {activeLesson?.learningObjectives?.length ? (
                      <div className="rounded-lg bg-gray-700 p-4">
                        <h4 className="mb-3 text-lg font-semibold text-white">Learning objectives</h4>
                        <ul className="ml-5 list-disc space-y-2 text-sm text-gray-200">
                          {activeLesson.learningObjectives.map((objective) => (
                            <li key={objective}>{objective}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="rounded-[24px] bg-white p-6 text-slate-900">
                      <RichContentRenderer content={activeLesson?.contentMarkdown || ''} />
                    </div>

                    {activeLesson?.practicePrompt ? (
                      <div className="rounded-lg border border-blue-800/50 bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4">
                        <div className="mb-2 flex items-center">
                          <Target className="mr-2 h-5 w-5 text-blue-400" />
                          <h5 className="font-semibold text-white">Practice challenge</h5>
                        </div>
                        <p className="mb-3 text-gray-300">{activeLesson.practicePrompt}</p>
                        <button
                          onClick={() => setLessonTutorOpen(true)}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        >
                          Ask lesson tutor
                        </button>
                      </div>
                    ) : null}

                    {activeLesson?.playground ? <LessonCodePlayground playground={activeLesson.playground} /> : null}
                  </div>
                </div>
                
                {/* Navigation */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
                    disabled={currentLesson === 0}
                    className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous Lesson
                  </button>
                  <button
                    onClick={handleLessonComplete}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 flex items-center"
                  >
                    Mark Complete
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </button>
                  <button
                    onClick={() => setCurrentLesson(Math.min(totalLessons - 1, currentLesson + 1))}
                    disabled={currentLesson === totalLessons - 1}
                    className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    Next Lesson
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  {/* Progress Card */}
                  <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-800/30">
                    <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
                    <div className="text-center mb-4">
                      <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#374151"
                            strokeWidth="10"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${userCourse.progress * 2.83} 283`}
                            transform="rotate(-90 50 50)"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-white">{userCourse.progress.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Completed Lessons</span>
                        <span className="text-white font-medium">
                          {completedLessons}/{totalLessons}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Estimated remaining</span>
                        <span className="text-white font-medium">{remainingMinutes} min</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Course context */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Course context</h3>
                    <div className="space-y-3">
                      <div className="flex items-center rounded-lg bg-gray-700 p-3">
                        <Video className="w-5 h-5 text-blue-400 mr-3" />
                        <div className="flex-1">
                          <div className="text-white font-medium">Current module</div>
                          <div className="text-sm text-gray-400">{activeLesson?.moduleTitle || 'Current module details appear here.'}</div>
                        </div>
                      </div>
                      <div className="flex items-center rounded-lg bg-gray-700 p-3">
                        <FileText className="w-5 h-5 text-green-400 mr-3" />
                        <div className="flex-1">
                          <div className="text-white font-medium">Lesson type</div>
                          <div className="text-sm capitalize text-gray-400">{activeLesson?.contentType || 'lesson'}</div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-gray-700 p-3">
                        <div className="text-white font-medium">Key takeaways</div>
                        <div className="mt-2 space-y-2 text-sm text-gray-300">
                          {(activeLesson?.keyTakeaways || []).slice(0, 3).map((takeaway) => (
                            <div key={takeaway}>{takeaway}</div>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => setLessonTutorOpen(true)} className="group flex w-full items-center rounded-lg bg-gray-700 p-3 text-left transition-colors hover:bg-gray-600">
                        <HelpCircle className="w-5 h-5 text-yellow-400 mr-3" />
                        <div className="flex-1">
                          <div className="text-white font-medium">Need another explanation?</div>
                          <div className="text-sm text-gray-400">Open the lesson tutor for examples and step-by-step help.</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Module checkpoint */}
                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-6 border border-yellow-800/30">
                    <div className="flex items-center mb-4">
                      <Star className="w-5 h-5 text-yellow-400 mr-3" />
                      <h3 className="text-lg font-semibold text-white">Module checkpoint</h3>
                    </div>
                    <p className="text-gray-300 mb-4">
                      {activeModule?.assessmentTitle
                        ? `${activeModule.assessmentTitle} is the next checkpoint for this module.`
                        : 'This module does not yet have a checkpoint configured.'}
                    </p>
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{activeModule?.assessmentQuizId ? `Quiz ID: ${activeModule.assessmentQuizId}` : 'Checkpoint can be added from the curriculum studio.'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setLessonTutorOpen((current) => !current)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-2xl transition hover:bg-cyan-400"
      >
        <Bot className="h-4 w-4" />
        {lessonTutorOpen ? 'Close tutor' : 'Lesson tutor'}
      </button>

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 left-6 z-40 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-2xl transition hover:bg-slate-100"
        >
          <BookOpen className="h-4 w-4" />
          Show course content
        </button>
      )}
    </div>
  );
};

export default CourseLearnPage;
