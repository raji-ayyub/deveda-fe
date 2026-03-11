'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bot, Loader2, Plus, Save, Sparkles, Trash2, WandSparkles } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  AgentArtifact,
  AgentAssignment,
  CourseCatalog,
  CourseCurriculum,
  CourseCurriculumLesson,
  CourseCurriculumModule,
  LessonPlaygroundCheck,
  MilestoneProject,
} from '@/lib/types';

const makeLesson = (moduleIndex: number, lessonIndex: number): CourseCurriculumLesson => ({
  title: `Lesson ${lessonIndex + 1}`,
  slug: `module-${moduleIndex + 1}-lesson-${lessonIndex + 1}`,
  summary: 'Add a short lesson summary.',
  durationMinutes: 20,
  contentType: 'lesson',
  quizId: '',
  quizTitle: '',
  learningObjectives: ['Explain the lesson clearly.', 'Practice the concept once with support.'],
  keyTakeaways: ['Know what the lesson is for.', 'Use the practice task before moving on.'],
  contentMarkdown: '# New lesson\n\n## What this lesson is about\nAdd the core explanation here.',
  practicePrompt: 'Add a short practical task for learners.',
  instructorNotes: '',
  playground: null,
});

const makeModule = (moduleIndex: number): CourseCurriculumModule => ({
  title: `Module ${moduleIndex + 1}`,
  description: 'Describe what learners complete in this module.',
  order: moduleIndex + 1,
  lessons: [makeLesson(moduleIndex, 0)],
  assessmentTitle: '',
  assessmentQuizId: '',
});

const makeProject = (projectIndex: number): MilestoneProject => ({
  title: `Milestone Project ${projectIndex + 1}`,
  description: 'Describe the project goal and acceptance criteria.',
  milestoneOrder: projectIndex + 1,
  estimatedHours: 6,
  deliverables: ['Working codebase', 'README', 'Demo notes'],
  completionThreshold: 70,
});

const makePlaygroundCheck = (): LessonPlaygroundCheck => ({
  label: 'Add a meaningful check',
  type: 'includes',
  target: 'js',
  value: '',
});

export default function CMSPage() {
  const searchParams = useSearchParams();
  const preferredCourseSlug = searchParams.get('course') || '';
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [curriculum, setCurriculum] = useState<CourseCurriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [agentAssignment, setAgentAssignment] = useState<AgentAssignment | null>(null);
  const [suggestingLessonSlug, setSuggestingLessonSlug] = useState('');
  const [lessonSuggestions, setLessonSuggestions] = useState<Record<string, AgentArtifact>>({});

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const response = await api.getCourseCatalog();
        setCourses(response.data);
        const preferredCourse = response.data.find((course) => course.slug === preferredCourseSlug);
        if (preferredCourse) {
          setSelectedSlug(preferredCourse.slug);
        } else if (response.data[0]) {
          setSelectedSlug(response.data[0].slug);
        }
      } catch (loadError) {
        console.error('Failed to load courses:', loadError);
        setError('Unable to load courses for the curriculum studio.');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [preferredCourseSlug]);

  useEffect(() => {
    if (!preferredCourseSlug || courses.length === 0) {
      return;
    }

    const preferredCourse = courses.find((course) => course.slug === preferredCourseSlug);
    if (preferredCourse && preferredCourse.slug !== selectedSlug) {
      setSelectedSlug(preferredCourse.slug);
    }
  }, [courses, preferredCourseSlug, selectedSlug]);

  useEffect(() => {
    if (!selectedSlug) {
      return;
    }

    const loadCurriculum = async () => {
      try {
        setLoading(true);
        setMessage('');
        setError('');
        const response = await api.getCourseCurriculum(selectedSlug);
        setCurriculum(response.data);
      } catch (loadError) {
        console.error('Failed to load curriculum:', loadError);
        setError('Unable to load curriculum.');
      } finally {
        setLoading(false);
      }
    };

    loadCurriculum();
  }, [selectedSlug]);

  useEffect(() => {
    if (!selectedSlug || !user || user.role === 'Student') {
      setAgentAssignment(null);
      setLessonSuggestions({});
      return;
    }

    const loadAgentSupport = async () => {
      try {
        const assignmentsRes = await api.getAgentAssignments();
        const approvedAssignment =
          assignmentsRes.data.find(
            (assignment) =>
              assignment.agentType === 'course_builder' &&
              assignment.status === 'approved' &&
              assignment.courseSlug === selectedSlug
          ) ||
          assignmentsRes.data.find(
            (assignment) =>
              assignment.agentType === 'course_builder' &&
              assignment.status === 'approved' &&
              !assignment.courseSlug
          ) ||
          null;

        setAgentAssignment(approvedAssignment);

        if (!approvedAssignment) {
          setLessonSuggestions({});
          return;
        }

        const artifactsRes = await api.getAgentArtifacts(approvedAssignment.id);
        const suggestionMap = artifactsRes.data
          .filter(
            (artifact) =>
              artifact.artifactType === 'lesson_content_suggestion' &&
              artifact.payload?.courseSlug === selectedSlug &&
              typeof artifact.payload?.lessonSlug === 'string'
          )
          .reduce<Record<string, AgentArtifact>>((accumulator, artifact) => {
            accumulator[String(artifact.payload.lessonSlug)] = artifact;
            return accumulator;
          }, {});
        setLessonSuggestions(suggestionMap);
      } catch (loadError) {
        console.error('Failed to load agent support:', loadError);
        setAgentAssignment(null);
        setLessonSuggestions({});
      }
    };

    loadAgentSupport();
  }, [selectedSlug, user]);

  const totalLessons = useMemo(
    () => curriculum?.modules.reduce((total, module) => total + module.lessons.length, 0) || 0,
    [curriculum]
  );

  const updateCurriculum = (updater: (current: CourseCurriculum) => CourseCurriculum) => {
    setCurriculum((current) => (current ? updater(current) : current));
  };

  const updateModule = (moduleIndex: number, updater: (module: CourseCurriculumModule) => CourseCurriculumModule) => {
    updateCurriculum((current) => ({
      ...current,
      modules: current.modules.map((module, index) => (index === moduleIndex ? updater(module) : module)),
    }));
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    updater: (lesson: CourseCurriculumLesson) => CourseCurriculumLesson
  ) => {
    updateModule(moduleIndex, (module) => ({
      ...module,
      lessons: module.lessons.map((lesson, index) => (index === lessonIndex ? updater(lesson) : lesson)),
    }));
  };

  const saveCurriculum = async () => {
    if (!curriculum) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      const response = await api.updateCourseCurriculum(curriculum.courseSlug, {
        overview: curriculum.overview,
        modules: curriculum.modules,
        milestoneProjects: curriculum.milestoneProjects,
      });
      setCurriculum(response.data);
      setMessage('Curriculum saved successfully.');
    } catch (saveError: any) {
      setError(saveError.message || 'Unable to save curriculum.');
    } finally {
      setSaving(false);
    }
  };

  const requestLessonSuggestion = async (lessonSlug: string) => {
    if (!agentAssignment) {
      return;
    }

    try {
      setSuggestingLessonSlug(lessonSlug);
      setError('');
      const response = await api.runAgentAction(agentAssignment.id, {
        actionType: 'suggest_lesson_content',
        courseSlug: selectedSlug,
        lessonSlug,
        instruction: 'Generate a richer lesson body, learning objectives, practice prompt, and playground suggestion for this lesson.',
      });
      setLessonSuggestions((current) => ({
        ...current,
        [lessonSlug]: response.data,
      }));
    } catch (suggestionError: any) {
      setError(suggestionError.message || 'Unable to generate a lesson suggestion right now.');
    } finally {
      setSuggestingLessonSlug('');
    }
  };

  const applyLessonSuggestion = (moduleIndex: number, lessonIndex: number, lessonSlug: string) => {
    const artifact = lessonSuggestions[lessonSlug];
    const suggestedLesson = artifact?.payload?.lesson as CourseCurriculumLesson | undefined;
    if (!suggestedLesson) {
      return;
    }

    updateLesson(moduleIndex, lessonIndex, () => suggestedLesson);
    setLessonSuggestions((current) => {
      const next = { ...current };
      delete next[lessonSlug];
      return next;
    });
    setMessage('Applied the latest agent lesson suggestion. Save curriculum to keep it.');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_60%,#38bdf8_100%)] p-8 text-white shadow-2xl shadow-slate-300">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
          <Sparkles className="h-3.5 w-3.5" />
          Instructor Studio
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight">Curriculum Builder</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-200">
          Build module structure, write full lesson documentation in markdown, add learning objectives, attach practice work, and configure a runnable code workspace where learners need hands-on practice.
        </p>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Course</label>
              <select
                value={selectedSlug}
                onChange={(event) => setSelectedSlug(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {courses.map((course) => (
                  <option key={course.slug} value={course.slug}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="font-semibold text-slate-900">{totalLessons} lessons</div>
              <div className="mt-1">Live content authoring is enabled for this course.</div>
            </div>
          </div>

          <button
            onClick={saveCurriculum}
            disabled={!curriculum || saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save curriculum
          </button>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Bot className="h-4 w-4 text-blue-700" />
              Agent support
            </div>
            <p className="mt-2 text-slate-600">
              {agentAssignment
                ? `${agentAssignment.displayName || 'Course Builder'} is approved for this workspace.`
                : 'Approve a Course Builder agent for this instructor to generate lesson suggestions while authoring.'}
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-[28px] border border-slate-200 bg-white shadow-lg shadow-slate-100">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-3 text-sm text-slate-500">Loading curriculum...</p>
          </div>
        </div>
      ) : curriculum ? (
        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <section className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Course overview</label>
              <textarea
                value={curriculum.overview}
                onChange={(event) => updateCurriculum((current) => ({ ...current, overview: event.target.value }))}
                rows={5}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-5">
              {curriculum.modules.map((module, moduleIndex) => (
                <div key={`${module.title}-${moduleIndex}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <input
                      value={module.title}
                      onChange={(event) => updateModule(moduleIndex, (currentModule) => ({ ...currentModule, title: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    <button
                      onClick={() =>
                        updateCurriculum((current) => ({
                          ...current,
                          modules: current.modules.filter((_, index) => index !== moduleIndex).map((item, index) => ({ ...item, order: index + 1 })),
                        }))
                      }
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>

                  <textarea
                    value={module.description}
                    onChange={(event) => updateModule(moduleIndex, (currentModule) => ({ ...currentModule, description: event.target.value }))}
                    rows={3}
                    className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <SimpleField
                      label="Assessment title"
                      value={module.assessmentTitle || ''}
                      onChange={(value) => updateModule(moduleIndex, (currentModule) => ({ ...currentModule, assessmentTitle: value }))}
                    />
                    <SimpleField
                      label="Assessment quiz ID"
                      value={module.assessmentQuizId || ''}
                      onChange={(value) => updateModule(moduleIndex, (currentModule) => ({ ...currentModule, assessmentQuizId: value }))}
                    />
                  </div>

                  <div className="mt-5 space-y-4">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const suggestion = lessonSuggestions[lesson.slug];
                      const playground = lesson.playground;
                      return (
                        <div key={`${lesson.slug}-${lessonIndex}`} className="rounded-[24px] border border-slate-200 bg-white p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                              Lesson {lessonIndex + 1}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {agentAssignment ? (
                                <button
                                  onClick={() => requestLessonSuggestion(lesson.slug)}
                                  disabled={suggestingLessonSlug === lesson.slug}
                                  className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-400 disabled:opacity-60"
                                >
                                  {suggestingLessonSlug === lesson.slug ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <WandSparkles className="h-4 w-4" />
                                  )}
                                  Suggest with agent
                                </button>
                              ) : null}
                              <button
                                onClick={() =>
                                  updateModule(moduleIndex, (currentModule) => ({
                                    ...currentModule,
                                    lessons: currentModule.lessons.filter((_, index) => index !== lessonIndex),
                                  }))
                                }
                                className="text-sm font-semibold text-rose-600"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          {suggestion ? (
                            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <div className="text-sm font-semibold text-blue-900">{suggestion.title}</div>
                                  <p className="mt-1 text-sm text-blue-800">{suggestion.summary}</p>
                                </div>
                                <button
                                  onClick={() => applyLessonSuggestion(moduleIndex, lessonIndex, lesson.slug)}
                                  className="rounded-2xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                                >
                                  Apply suggestion
                                </button>
                              </div>
                            </div>
                          ) : null}

                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <SimpleField
                              label="Title"
                              value={lesson.title}
                              onChange={(value) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, title: value }))}
                            />
                            <SimpleField
                              label="Slug"
                              value={lesson.slug}
                              onChange={(value) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, slug: value }))}
                            />
                            <div className="md:col-span-2">
                              <label className="mb-2 block text-sm font-semibold text-slate-700">Summary</label>
                              <textarea
                                value={lesson.summary}
                                onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, summary: event.target.value }))}
                                rows={3}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                              />
                            </div>
                            <SimpleField
                              label="Duration (minutes)"
                              type="number"
                              value={String(lesson.durationMinutes)}
                              onChange={(value) =>
                                updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
                                  ...currentLesson,
                                  durationMinutes: Number(value) || 0,
                                }))
                              }
                            />
                            <SimpleField
                              label="Content type"
                              value={lesson.contentType}
                              onChange={(value) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, contentType: value }))}
                            />
                            <SimpleField
                              label="Quiz after lesson"
                              value={lesson.quizId || ''}
                              onChange={(value) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, quizId: value }))}
                            />
                            <SimpleField
                              label="Quiz title"
                              value={lesson.quizTitle || ''}
                              onChange={(value) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, quizTitle: value }))}
                            />
                          </div>

                          <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <MultiLineListField
                              label="Learning objectives"
                              values={lesson.learningObjectives || []}
                              onChange={(values) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, learningObjectives: values }))}
                            />
                            <MultiLineListField
                              label="Key takeaways"
                              values={lesson.keyTakeaways || []}
                              onChange={(values) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, keyTakeaways: values }))}
                            />
                          </div>

                          <div className="mt-5 space-y-4">
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-slate-700">Lesson content markup</label>
                              <textarea
                                value={lesson.contentMarkdown || ''}
                                onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, contentMarkdown: event.target.value }))}
                                rows={14}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Practice prompt</label>
                                <textarea
                                  value={lesson.practicePrompt || ''}
                                  onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, practicePrompt: event.target.value }))}
                                  rows={4}
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Instructor notes</label>
                                <textarea
                                  value={lesson.instructorNotes || ''}
                                  onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, instructorNotes: event.target.value }))}
                                  rows={4}
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-slate-900">Hands-on code workspace</div>
                                <p className="mt-1 text-sm text-slate-600">Enable this when learners should write and run code during the lesson or test.</p>
                              </div>
                              <button
                                onClick={() =>
                                  updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
                                    ...currentLesson,
                                    playground: currentLesson.playground
                                      ? null
                                      : {
                                          mode: 'web',
                                          instructions: 'Use the code workspace to complete the lesson task.',
                                          starterHtml: '<div class="app">Start here</div>',
                                          starterCss: '.app {\n  padding: 24px;\n}',
                                          starterJs: 'console.log(\"Ready\");',
                                          checks: [],
                                        },
                                  }))
                                }
                                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                              >
                                {playground ? 'Disable workspace' : 'Enable workspace'}
                              </button>
                            </div>
                            {playground ? (
                              <div className="mt-4 space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <SimpleField
                                    label="Mode"
                                    value={playground.mode}
                                    onChange={(value) =>
                                      updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
                                        ...currentLesson,
                                        playground: currentLesson.playground
                                          ? {
                                              ...currentLesson.playground,
                                              mode: value === 'javascript' ? 'javascript' : 'web',
                                            }
                                          : currentLesson.playground,
                                      }))
                                    }
                                  />
                                  <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Workspace instructions</label>
                                    <textarea
                                      value={playground.instructions}
                                      onChange={(event) =>
                                        updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
                                          ...currentLesson,
                                          playground: currentLesson.playground
                                            ? { ...currentLesson.playground, instructions: event.target.value }
                                            : currentLesson.playground,
                                        }))
                                      }
                                      rows={3}
                                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />
                                  </div>
                                </div>

                                {playground.mode === 'web' ? (
                                  <div className="grid gap-4 md:grid-cols-3">
                                    <CodeArea
                                      label="Starter HTML"
                                      value={playground.starterHtml || ''}
                                      onChange={(value) =>
                                        updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
                                          ...currentLesson,
                                          playground: currentLesson.playground
                                            ? { ...currentLesson.playground, starterHtml: value }
                                            : currentLesson.playground,
                                        }))
                                      }
                                    />
                                    <CodeArea
                                      label="Starter CSS"
                                      value={playground.starterCss || ''}
                                      onChange={(value) =>
                                        updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
                                          ...currentLesson,
                                          playground: currentLesson.playground
                                            ? { ...currentLesson.playground, starterCss: value }
                                            : currentLesson.playground,
                                        }))
                                      }
                                    />
                                    <CodeArea
                                      label="Starter JS"
                                      value={playground.starterJs || ''}
                                      onChange={(value) =>
                                        updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
                                          ...currentLesson,
                                          playground: currentLesson.playground
                                            ? { ...currentLesson.playground, starterJs: value }
                                            : currentLesson.playground,
                                        }))
                                      }
                                    />
                                  </div>
                                ) : (
                                  <CodeArea
                                    label="Starter JavaScript"
                                    value={playground.starterJs || ''}
                                    onChange={(value) =>
                                      updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
                                        ...currentLesson,
                                        playground: currentLesson.playground
                                          ? { ...currentLesson.playground, starterJs: value }
                                          : currentLesson.playground,
                                      }))
                                    }
                                  />
                                )}

                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold text-slate-900">Workspace checks</div>
                                    <button
                                      onClick={() =>
                                        updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
                                          ...currentLesson,
                                          playground: currentLesson.playground
                                            ? {
                                                ...currentLesson.playground,
                                                checks: [...currentLesson.playground.checks, makePlaygroundCheck()],
                                              }
                                            : currentLesson.playground,
                                        }))
                                      }
                                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                                    >
                                      <Plus className="h-4 w-4" />
                                      Add check
                                    </button>
                                  </div>
                                  {playground.checks.map((check, checkIndex) => (
                                    <div key={`${check.label}-${checkIndex}`} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr_auto]">
                                      <SimpleField
                                        label="Label"
                                        value={check.label}
                                        onChange={(value) =>
                                          updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
                                            ...currentLesson,
                                            playground: currentLesson.playground
                                              ? {
                                                  ...currentLesson.playground,
                                                  checks: currentLesson.playground.checks.map((currentCheck, index) =>
                                                    index === checkIndex ? { ...currentCheck, label: value } : currentCheck
                                                  ),
                                                }
                                              : currentLesson.playground,
                                          }))
                                        }
                                      />
                                      <SimpleField
                                        label="Type"
                                        value={check.type}
                                        onChange={(value) =>
                                          updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
                                            ...currentLesson,
                                            playground: currentLesson.playground
                                              ? {
                                                  ...currentLesson.playground,
                                                  checks: currentLesson.playground.checks.map((currentCheck, index) =>
                                                    index === checkIndex
                                                      ? { ...currentCheck, type: value === 'output' ? 'output' : 'includes' }
                                                      : currentCheck
                                                  ),
                                                }
                                              : currentLesson.playground,
                                          }))
                                        }
                                      />
                                      <SimpleField
                                        label="Target"
                                        value={check.target}
                                        onChange={(value) =>
                                          updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
                                            ...currentLesson,
                                            playground: currentLesson.playground
                                              ? {
                                                  ...currentLesson.playground,
                                                  checks: currentLesson.playground.checks.map((currentCheck, index) =>
                                                    index === checkIndex
                                                      ? {
                                                          ...currentCheck,
                                                          target: ['html', 'css', 'js', 'console'].includes(value) ? (value as LessonPlaygroundCheck['target']) : 'js',
                                                        }
                                                      : currentCheck
                                                  ),
                                                }
                                              : currentLesson.playground,
                                          }))
                                        }
                                      />
                                      <SimpleField
                                        label="Expected value"
                                        value={check.value}
                                        onChange={(value) =>
                                          updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
                                            ...currentLesson,
                                            playground: currentLesson.playground
                                              ? {
                                                  ...currentLesson.playground,
                                                  checks: currentLesson.playground.checks.map((currentCheck, index) =>
                                                    index === checkIndex ? { ...currentCheck, value } : currentCheck
                                                  ),
                                                }
                                              : currentLesson.playground,
                                          }))
                                        }
                                      />
                                      <button
                                        onClick={() =>
                                          updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
                                            ...currentLesson,
                                            playground: currentLesson.playground
                                              ? {
                                                  ...currentLesson.playground,
                                                  checks: currentLesson.playground.checks.filter((_, index) => index !== checkIndex),
                                                }
                                              : currentLesson.playground,
                                          }))
                                        }
                                        className="mt-7 text-sm font-semibold text-rose-600"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => updateModule(moduleIndex, (currentModule) => ({ ...currentModule, lessons: [...currentModule.lessons, makeLesson(moduleIndex, currentModule.lessons.length)] }))}
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add lesson
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => updateCurriculum((current) => ({ ...current, modules: [...current.modules, makeModule(current.modules.length)] }))}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add module
            </button>
          </section>

          <section className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Milestone projects</h2>
              <p className="mt-1 text-sm text-slate-600">Add a project after each major checkpoint.</p>
            </div>

            <div className="space-y-4">
              {curriculum.milestoneProjects.map((project, projectIndex) => (
                <div key={`${project.title}-${projectIndex}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">Milestone {project.milestoneOrder}</p>
                    <button
                      onClick={() =>
                        updateCurriculum((current) => ({
                          ...current,
                          milestoneProjects: current.milestoneProjects
                            .filter((_, index) => index !== projectIndex)
                            .map((item, index) => ({ ...item, milestoneOrder: index + 1 })),
                        }))
                      }
                      className="text-sm font-semibold text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-4 space-y-4">
                    <SimpleField
                      label="Project title"
                      value={project.title}
                      onChange={(value) =>
                        updateCurriculum((current) => ({
                          ...current,
                          milestoneProjects: current.milestoneProjects.map((item, index) =>
                            index === projectIndex ? { ...item, title: value } : item
                          ),
                        }))
                      }
                    />
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                      <textarea
                        value={project.description}
                        onChange={(event) =>
                          updateCurriculum((current) => ({
                            ...current,
                            milestoneProjects: current.milestoneProjects.map((item, index) =>
                              index === projectIndex ? { ...item, description: event.target.value } : item
                            ),
                          }))
                        }
                        rows={4}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <SimpleField
                        label="Estimated hours"
                        type="number"
                        value={String(project.estimatedHours)}
                        onChange={(value) =>
                          updateCurriculum((current) => ({
                            ...current,
                            milestoneProjects: current.milestoneProjects.map((item, index) =>
                              index === projectIndex ? { ...item, estimatedHours: Number(value) || 0 } : item
                            ),
                          }))
                        }
                      />
                      <SimpleField
                        label="Completion threshold"
                        type="number"
                        value={String(project.completionThreshold)}
                        onChange={(value) =>
                          updateCurriculum((current) => ({
                            ...current,
                            milestoneProjects: current.milestoneProjects.map((item, index) =>
                              index === projectIndex ? { ...item, completionThreshold: Number(value) || 70 } : item
                            ),
                          }))
                        }
                      />
                    </div>
                    <MultiLineListField
                      label="Deliverables"
                      values={project.deliverables}
                      onChange={(values) =>
                        updateCurriculum((current) => ({
                          ...current,
                          milestoneProjects: current.milestoneProjects.map((item, index) =>
                            index === projectIndex ? { ...item, deliverables: values } : item
                          ),
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() =>
                updateCurriculum((current) => ({
                  ...current,
                  milestoneProjects: [...current.milestoneProjects, makeProject(current.milestoneProjects.length)],
                }))
              }
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              <Plus className="h-4 w-4" />
              Add milestone project
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function SimpleField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function MultiLineListField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <textarea
        value={values.join('\n')}
        onChange={(event) =>
          onChange(
            event.target.value
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean)
          )
        }
        rows={5}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function CodeArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={10}
        spellCheck={false}
        className="w-full rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}
