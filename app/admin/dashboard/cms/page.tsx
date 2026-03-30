'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Bot, ChevronDown, FileUp, Loader2, Plus, Save, Sparkles, Trash2, WandSparkles } from 'lucide-react';

import { CourseModal } from '@/components/dashboard/courses';
import RichContentRenderer from '@/components/lesson/RichContentRenderer';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error';
import {
  AgentAssignment,
  ContentGenerationSession,
  CourseCatalog,
  CourseCurriculum,
  CourseCurriculumLesson,
  CourseCurriculumModule,
  GeneratedCourseContentPayload,
  GeneratedLessonContentPayload,
  GeneratedModuleContentPayload,
  MilestoneProject,
} from '@/lib/types';

const makeLesson = (courseSlug: string, moduleIndex: number, lessonIndex: number): CourseCurriculumLesson => ({
  title: `Lesson ${lessonIndex + 1}`,
  slug: `${courseSlug || 'course'}-module-${moduleIndex + 1}-lesson-${lessonIndex + 1}`,
  libraryLessonSlug: `${courseSlug || 'course'}-module-${moduleIndex + 1}-lesson-${lessonIndex + 1}`,
  source: 'manual',
  generationStatus: 'generated',
  summary: 'Add a short lesson summary.',
  durationMinutes: 20,
  contentType: 'lesson',
  quizId: '',
  quizTitle: '',
  learningObjectives: ['Explain the core idea clearly.', 'Guide one practical application.'],
  keyTakeaways: ['State the main idea.', 'Use one practice activity before moving on.'],
  learningFlow: ['Introduce the concept.', 'Show a worked example.', 'Give the learner one guided task.'],
  contentMarkdown: '# New lesson\n\n## What this lesson is about\nAdd the core explanation here.',
  visualAidMarkdown: '## Visual aid\n`Concept` -> `Example` -> `Practice`',
  practicePrompt: 'Add a short practical task.',
  instructorNotes: '',
  playground: null,
});

const makeModule = (courseSlug: string, moduleIndex: number): CourseCurriculumModule => ({
  title: `Module ${moduleIndex + 1}`,
  description: 'Describe what the learner completes in this module.',
  order: moduleIndex + 1,
  source: 'manual',
  generationStatus: 'generated',
  lessons: [makeLesson(courseSlug, moduleIndex, 0)],
  assessmentTitle: '',
  assessmentQuizId: '',
});

const makeProject = (index: number): MilestoneProject => ({
  title: `Milestone ${index + 1}`,
  description: 'Describe the applied project or deliverable.',
  milestoneOrder: index + 1,
  estimatedHours: 4,
  deliverables: ['Working output', 'Short reflection'],
  completionThreshold: 70,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function Preview({ title, content }: { title: string; content: string }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</div>
      <div className="rounded-[20px] border border-slate-200 bg-white p-4">
        <RichContentRenderer content={content} />
      </div>
    </div>
  );
}

function SuggestionList({ title, items }: { title: string; items?: string[] | null }) {
  if (!items?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</div>
      <div className="mt-3 space-y-2 text-sm text-slate-700">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-xl bg-slate-50 px-3 py-2">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentAssistPanel({
  title,
  description,
  prompt,
  onPromptChange,
  onSuggest,
  loading,
  disabled,
  disabledReason,
  error,
  children,
}: {
  title: string;
  description: string;
  prompt: string;
  onPromptChange: (value: string) => void;
  onSuggest: () => void;
  loading: boolean;
  disabled?: boolean;
  disabledReason?: string;
  error?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_55%,#ecfeff_100%)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            <Bot className="h-3.5 w-3.5" />
            Agent Assist
          </div>
          <h3 className="mt-3 text-base font-bold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        <button
          type="button"
          onClick={onSuggest}
          disabled={loading || disabled}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
          {loading ? 'Thinking...' : 'Suggest'}
        </button>
      </div>

      <textarea
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        rows={3}
        placeholder="Add any constraints, learner tone, or teaching emphasis you want the assistant to follow."
        className="mt-4 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />

      {disabledReason ? <p className="mt-2 text-xs text-slate-500">{disabledReason}</p> : null}
      {error ? <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      {children ? <div className="mt-4 space-y-4">{children}</div> : null}
    </div>
  );
}

export default function CMSPage() {
  const searchParams = useSearchParams();
  const preferredCourseSlug = searchParams.get('course') || '';
  const preferredSessionId = searchParams.get('session') || '';

  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [selectedSlug, setSelectedSlug] = useState(preferredCourseSlug);
  const [curriculum, setCurriculum] = useState<CourseCurriculum | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [importingCourse, setImportingCourse] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [sessionAction, setSessionAction] = useState('');
  const [generationSession, setGenerationSession] = useState<ContentGenerationSession | null>(null);
  const [sessionFile, setSessionFile] = useState<File | null>(null);
  const [sessionInstructions, setSessionInstructions] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [agentAssignment, setAgentAssignment] = useState<AgentAssignment | null>(null);
  const [assistantBusyKey, setAssistantBusyKey] = useState('');
  const [assistantErrors, setAssistantErrors] = useState<Record<string, string>>({});
  const [coursePrompt, setCoursePrompt] = useState('');
  const [modulePrompts, setModulePrompts] = useState<Record<string, string>>({});
  const [lessonPrompts, setLessonPrompts] = useState<Record<string, string>>({});
  const [courseSuggestion, setCourseSuggestion] = useState<GeneratedCourseContentPayload | null>(null);
  const [moduleSuggestions, setModuleSuggestions] = useState<Record<string, GeneratedModuleContentPayload>>({});
  const [lessonSuggestions, setLessonSuggestions] = useState<Record<string, GeneratedLessonContentPayload>>({});

  const selectedCourse = useMemo(
    () => courses.find((course) => course.slug === selectedSlug) || null,
    [courses, selectedSlug]
  );
  const lessonCount = useMemo(
    () => curriculum?.modules.reduce((total, module) => total + module.lessons.length, 0) || 0,
    [curriculum]
  );

  const buildDraftPayload = (options?: { moduleIndex?: number; lessonIndex?: number }) => {
    if (!curriculum) {
      return null;
    }

    const payload: Record<string, unknown> = {
      courseSlug: curriculum.courseSlug,
      overview: curriculum.overview,
      learningFlow: curriculum.learningFlow,
      visualAidMarkdown: curriculum.visualAidMarkdown || '',
      modules: curriculum.modules,
      milestoneProjects: curriculum.milestoneProjects,
    };

    if (typeof options?.moduleIndex === 'number') {
      const module = curriculum.modules[options.moduleIndex];
      if (module) {
        payload.moduleOrder = module.order;
        payload.moduleTitle = module.title;
        payload.module = module;

        if (typeof options.lessonIndex === 'number') {
          const lesson = module.lessons[options.lessonIndex];
          if (lesson) {
            payload.lesson = {
              ...lesson,
              moduleTitle: module.title,
              moduleOrder: module.order,
            };
          }
        }
      }
    }

    return payload;
  };

  const setAssistantError = (key: string, value: string) => {
    setAssistantErrors((current) => {
      if (!value) {
        const next = { ...current };
        delete next[key];
        return next;
      }
      return { ...current, [key]: value };
    });
  };

  const updateModulePrompt = (key: string, value: string) => {
    setModulePrompts((current) => ({ ...current, [key]: value }));
  };

  const updateLessonPrompt = (key: string, value: string) => {
    setLessonPrompts((current) => ({ ...current, [key]: value }));
  };

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await api.getCourseCatalog();
      setCourses(response.data);
      if (preferredCourseSlug && !selectedSlug) {
        const match = response.data.find((course) => course.slug === preferredCourseSlug);
        if (match) setSelectedSlug(match.slug);
      }
    } catch (loadError: any) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadCurriculum = async (courseSlug: string) => {
    try {
      setLoadingCurriculum(true);
      const response = await api.getCourseCurriculum(courseSlug);
      setCurriculum(response.data);
      return response.data;
    } catch (loadError: any) {
      setCurriculum(null);
      setError(getErrorMessage(loadError));
      return null;
    } finally {
      setLoadingCurriculum(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [preferredCourseSlug]);

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const response = await api.getAgentAssignments();
        const approvedAssignment =
          response.data.find(
            (assignment) =>
              assignment.agentType === 'course_builder' &&
              assignment.status === 'approved' &&
              assignment.courseSlug === selectedSlug
          ) ||
          response.data.find(
            (assignment) =>
              assignment.agentType === 'course_builder' &&
              assignment.status === 'approved' &&
              !assignment.courseSlug
          ) ||
          response.data.find(
            (assignment) => assignment.agentType === 'course_builder' && assignment.status === 'approved'
          ) ||
          null;
        setAgentAssignment(approvedAssignment);
      } catch (assignmentError) {
        console.error('Failed to load curriculum assistant assignment:', assignmentError);
        setAgentAssignment(null);
      }
    };

    void loadAssignment();
  }, [selectedSlug]);

  useEffect(() => {
    const loadGenerationSession = async () => {
      if (!preferredSessionId || generationSession?.id === preferredSessionId) {
        return;
      }

      try {
        setScanning(true);
        setError('');
        const response = await api.getContentGenerationSession(preferredSessionId);
        await applyGenerationSession(response.data);
      } catch (sessionError: any) {
        setError(getErrorMessage(sessionError));
      } finally {
        setScanning(false);
      }
    };

    void loadGenerationSession();
  }, [generationSession?.id, preferredSessionId]);

  useEffect(() => {
    if (!selectedSlug) {
      setCurriculum(null);
      setCourseSuggestion(null);
      setModuleSuggestions({});
      setLessonSuggestions({});
      setAssistantErrors({});
      return;
    }
    if (generationSession && generationSession.courseSlug && generationSession.courseSlug !== selectedSlug) {
      setGenerationSession(null);
      setSessionFile(null);
      setSessionInstructions('');
    }
    setCourseSuggestion(null);
    setModuleSuggestions({});
    setLessonSuggestions({});
    setAssistantErrors({});
    loadCurriculum(selectedSlug);
  }, [selectedSlug]);

  const updateCurriculum = (updater: (current: CourseCurriculum) => CourseCurriculum) => {
    setCurriculum((current) => (current ? updater(current) : current));
  };

  const updateModule = (moduleIndex: number, updater: (module: CourseCurriculumModule) => CourseCurriculumModule) => {
    updateCurriculum((current) => ({
      ...current,
      modules: current.modules.map((module, index) => (index === moduleIndex ? updater(module) : module)),
    }));
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, updater: (lesson: CourseCurriculumLesson) => CourseCurriculumLesson) => {
    updateModule(moduleIndex, (module) => ({
      ...module,
      lessons: module.lessons.map((lesson, index) => (index === lessonIndex ? updater(lesson) : lesson)),
    }));
  };

  const handleCreateCourse = async (formData: Partial<CourseCatalog>) => {
    try {
      setCreatingCourse(true);
      const response = await api.createCourseCatalog(formData);
      setCourses((current) => [response.data, ...current.filter((course) => course.slug !== response.data.slug)]);
      setSelectedSlug(response.data.slug);
      setShowCreateModal(false);
      setMessage('Course created. You can now import source material or edit the curriculum directly.');
      await loadCurriculum(response.data.slug);
    } catch (createError: any) {
      setError(getErrorMessage(createError));
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleModalImportStart = async (payload: { file: File; instructions: string; courseSlug?: string }) => {
    try {
      setImportingCourse(true);
      setError('');
      setMessage('');
      const sessionResponse = await api.uploadContentGenerationSession({
        file: payload.file,
        courseSlug: payload.courseSlug,
        instructions: payload.instructions,
      });

      let session = sessionResponse.data;
      if (!payload.courseSlug) {
        const shellResponse = await api.runContentGenerationAction(session.id, {
          actionType: 'create_course_shell',
          instructions: payload.instructions,
        });
        session = shellResponse.data;
      }

      await applyGenerationSession(session);
      setShowCreateModal(false);
      setMessage('Document import started. Continue the staged generation flow below.');
    } finally {
      setImportingCourse(false);
    }
  };

  const applyGenerationSession = async (session: ContentGenerationSession) => {
    setGenerationSession(session);
    if (session.courseSlug) {
      if (!courses.some((course) => course.slug === session.courseSlug)) {
        await loadCourses();
      }
      setSelectedSlug(session.courseSlug);
    }
    if (session.curriculum) {
      setCurriculum(session.curriculum);
    } else if (session.courseSlug) {
      await loadCurriculum(session.courseSlug);
    }
  };

  const handleScanUpload = async () => {
    if (!sessionFile) {
      setError('Choose a source file first.');
      return;
    }

    try {
      setScanning(true);
      setError('');
      setMessage('');
      const response = await api.uploadContentGenerationSession({
        file: sessionFile,
        courseSlug: selectedSlug || undefined,
        instructions: sessionInstructions,
      });
      await applyGenerationSession(response.data);
      setMessage('Scan complete. Review the plan below, then generate the course shell and modules step by step.');
    } catch (scanError: any) {
      setError(getErrorMessage(scanError));
    } finally {
      setScanning(false);
    }
  };

  const runGenerationAction = async (
    actionType: 'create_course_shell' | 'generate_overview' | 'generate_module' | 'generate_questions',
    options?: { moduleOrder?: number; questionCount?: number }
  ) => {
    if (!generationSession) {
      return;
    }
    try {
      setSessionAction(actionType + (options?.moduleOrder ? `-${options.moduleOrder}` : ''));
      setError('');
      const response = await api.runContentGenerationAction(generationSession.id, {
        actionType,
        moduleOrder: options?.moduleOrder,
        questionCount: options?.questionCount,
        instructions: sessionInstructions,
      });
      await applyGenerationSession(response.data);
      setMessage(response.message);
    } catch (actionError: any) {
      setError(getErrorMessage(actionError));
    } finally {
      setSessionAction('');
    }
  };

  const saveCurriculum = async () => {
    if (!curriculum) return;
    try {
      setSaving(true);
      const response = await api.updateCourseCurriculum(curriculum.courseSlug, {
        overview: curriculum.overview,
        learningFlow: curriculum.learningFlow,
        visualAidMarkdown: curriculum.visualAidMarkdown || '',
        modules: curriculum.modules,
        milestoneProjects: curriculum.milestoneProjects,
      });
      setCurriculum(response.data);
      setMessage('Curriculum saved successfully.');
      setError('');
    } catch (saveError: any) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const suggestCourseFraming = async () => {
    if (!agentAssignment || !curriculum || !selectedCourse) {
      return;
    }

    const helperKey = 'course';
    try {
      setAssistantBusyKey(helperKey);
      setAssistantError(helperKey, '');
      setError('');
      const response = await api.runAgentAction(agentAssignment.id, {
        actionType: 'generate_course_content',
        courseSlug: curriculum.courseSlug,
        instruction:
          coursePrompt.trim() ||
          `Refresh the course framing for ${selectedCourse.title}. Keep it aligned with the current ${curriculum.modules.length}-module draft, the learner level ${selectedCourse.difficulty}, and suggest the next best module and milestone flow based on what is already written.`,
        draftPayload: buildDraftPayload() || undefined,
      });
      setCourseSuggestion(response.data.payload as unknown as GeneratedCourseContentPayload);
    } catch (assistantError: any) {
      setAssistantError(helperKey, getErrorMessage(assistantError));
    } finally {
      setAssistantBusyKey('');
    }
  };

  const suggestModuleContent = async (moduleIndex: number) => {
    if (!agentAssignment || !curriculum || !selectedCourse) {
      return;
    }

    const module = curriculum.modules[moduleIndex];
    if (!module) {
      return;
    }

    const helperKey = `module-${moduleIndex}`;
    try {
      setAssistantBusyKey(helperKey);
      setAssistantError(helperKey, '');
      setError('');
      const previousTitles = curriculum.modules
        .slice(0, moduleIndex)
        .map((item) => item.title)
        .join(', ');
      const response = await api.runAgentAction(agentAssignment.id, {
        actionType: 'generate_module_content',
        courseSlug: curriculum.courseSlug,
        moduleOrder: module.order,
        instruction:
          modulePrompts[helperKey]?.trim() ||
          `Expand module ${module.order} for ${selectedCourse.title}. Current module title: ${module.title}. Preserve the course pacing, build on earlier modules (${previousTitles || 'none yet'}), and suggest the next best lesson sequence, checkpoint title, and assessment id using the current draft context.`,
        draftPayload: buildDraftPayload({ moduleIndex }) || undefined,
      });
      setModuleSuggestions((current) => ({
        ...current,
        [helperKey]: response.data.payload as unknown as GeneratedModuleContentPayload,
      }));
    } catch (assistantError: any) {
      setAssistantError(helperKey, getErrorMessage(assistantError));
    } finally {
      setAssistantBusyKey('');
    }
  };

  const suggestLessonContent = async (moduleIndex: number, lessonIndex: number) => {
    if (!agentAssignment || !curriculum || !selectedCourse) {
      return;
    }

    const module = curriculum.modules[moduleIndex];
    const lesson = module?.lessons[lessonIndex];
    if (!module || !lesson) {
      return;
    }

    const helperKey = `lesson-${moduleIndex}-${lessonIndex}`;
    const previousLessonTitle = lessonIndex > 0 ? module.lessons[lessonIndex - 1]?.title : '';
    const nextLessonTitle = lessonIndex < module.lessons.length - 1 ? module.lessons[lessonIndex + 1]?.title : '';

    try {
      setAssistantBusyKey(helperKey);
      setAssistantError(helperKey, '');
      setError('');
      const response = await api.runAgentAction(agentAssignment.id, {
        actionType: 'generate_lesson_content',
        courseSlug: curriculum.courseSlug,
        lessonSlug: lesson.slug,
        instruction:
          lessonPrompts[helperKey]?.trim() ||
          `Generate the next best lesson draft for ${lesson.title} in module ${module.order}: ${module.title}. Teach in the context of ${selectedCourse.title}, connect back to ${previousLessonTitle || 'the module opening'}, and prepare the learner for ${nextLessonTitle || 'the module checkpoint'}.`,
        draftPayload: buildDraftPayload({ moduleIndex, lessonIndex }) || undefined,
      });
      setLessonSuggestions((current) => ({
        ...current,
        [helperKey]: response.data.payload as unknown as GeneratedLessonContentPayload,
      }));
    } catch (assistantError: any) {
      setAssistantError(helperKey, getErrorMessage(assistantError));
    } finally {
      setAssistantBusyKey('');
    }
  };

  const applyCourseFramingSuggestion = () => {
    if (!courseSuggestion) {
      return;
    }

    updateCurriculum((current) => ({
      ...current,
      overview: courseSuggestion.curriculum.overview,
      learningFlow: courseSuggestion.curriculum.learningFlow,
      visualAidMarkdown: courseSuggestion.curriculum.visualAidMarkdown || '',
    }));
    setMessage('Applied the suggested course framing to the draft curriculum.');
  };

  const applyCourseOutlineSuggestion = () => {
    if (!courseSuggestion) {
      return;
    }

    updateCurriculum((current) => ({
      ...current,
      overview: courseSuggestion.curriculum.overview,
      learningFlow: courseSuggestion.curriculum.learningFlow,
      visualAidMarkdown: courseSuggestion.curriculum.visualAidMarkdown || '',
      modules: courseSuggestion.curriculum.modules,
      milestoneProjects: courseSuggestion.curriculum.milestoneProjects,
    }));
    setMessage('Applied the full suggested course outline to the draft curriculum.');
  };

  const applyModuleFramingSuggestion = (moduleIndex: number, suggestion: GeneratedModuleContentPayload) => {
    updateModule(moduleIndex, (currentModule) => ({
      ...currentModule,
      title: suggestion.module.title,
      description: suggestion.module.description,
      assessmentTitle: suggestion.module.assessmentTitle || '',
      assessmentQuizId: suggestion.module.assessmentQuizId || '',
    }));
    setMessage(`Applied the suggested framing for module ${suggestion.moduleOrder}.`);
  };

  const applyModuleLessonsSuggestion = (moduleIndex: number, suggestion: GeneratedModuleContentPayload) => {
    updateModule(moduleIndex, (currentModule) => ({
      ...currentModule,
      lessons: suggestion.module.lessons,
    }));
    setMessage(`Applied the suggested lesson sequence for module ${suggestion.moduleOrder}.`);
  };

  const applyModuleSuggestion = (moduleIndex: number, suggestion: GeneratedModuleContentPayload) => {
    updateModule(moduleIndex, () => ({
      ...suggestion.module,
      order: suggestion.module.order || suggestion.moduleOrder,
    } as CourseCurriculumModule));
    setMessage(`Replaced module ${suggestion.moduleOrder} with the suggested draft.`);
  };

  const addNextSuggestedLesson = (moduleIndex: number, suggestion: GeneratedModuleContentPayload) => {
    const currentModule = curriculum?.modules[moduleIndex];
    if (!currentModule) {
      return;
    }

    const nextSuggestedLesson = suggestion.module.lessons[currentModule.lessons.length];
    if (!nextSuggestedLesson) {
      return;
    }

    updateModule(moduleIndex, (module) => ({
      ...module,
      lessons: [...module.lessons, nextSuggestedLesson],
    }));
    setMessage(`Added the next suggested lesson to module ${suggestion.moduleOrder}.`);
  };

  const applyLessonStructureSuggestion = (moduleIndex: number, lessonIndex: number, suggestion: GeneratedLessonContentPayload) => {
    updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
      ...currentLesson,
      title: suggestion.lesson.title,
      slug: suggestion.lesson.slug,
      libraryLessonSlug: suggestion.lesson.libraryLessonSlug || currentLesson.libraryLessonSlug || suggestion.lesson.slug,
      summary: suggestion.lesson.summary,
      durationMinutes: suggestion.lesson.durationMinutes,
      contentType: suggestion.lesson.contentType,
      learningObjectives: suggestion.lesson.learningObjectives || [],
      keyTakeaways: suggestion.lesson.keyTakeaways || [],
      learningFlow: suggestion.lesson.learningFlow || [],
    }));
    setMessage(`Applied the suggested lesson structure for ${suggestion.lesson.title}.`);
  };

  const applyLessonTeachingSuggestion = (moduleIndex: number, lessonIndex: number, suggestion: GeneratedLessonContentPayload) => {
    updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
      ...currentLesson,
      contentMarkdown: suggestion.lesson.contentMarkdown || '',
      visualAidMarkdown: suggestion.lesson.visualAidMarkdown || '',
      practicePrompt: suggestion.lesson.practicePrompt || '',
      instructorNotes: suggestion.lesson.instructorNotes || '',
    }));
    setMessage(`Applied the suggested teaching content for ${suggestion.lesson.title}.`);
  };

  const applyLessonSuggestion = (moduleIndex: number, lessonIndex: number, suggestion: GeneratedLessonContentPayload) => {
    updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({
      ...currentLesson,
      ...suggestion.lesson,
      libraryLessonSlug: suggestion.lesson.libraryLessonSlug || currentLesson.libraryLessonSlug || suggestion.lesson.slug,
    }));
    setMessage(`Replaced the lesson draft for ${suggestion.lesson.title}.`);
  };

  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-6 overflow-x-hidden pb-10">
      <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_60%,#38bdf8_100%)] p-6 text-white shadow-2xl shadow-slate-300 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
          <Sparkles className="h-3.5 w-3.5" />
          Instructor CMS
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight">Curriculum workspace</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-200">
          Create or pick a course, import source material, review the generated structure, then save. Course import replaces the selected course curriculum. Lesson import appends a single lesson.
        </p>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-end">
          <Field label="Course">
            <select
              value={selectedSlug}
              onChange={(event) => {
                setSelectedSlug(event.target.value);
                setMessage('');
                setError('');
              }}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.slug} value={course.slug}>
                  {course.title}
                </option>
              ))}
            </select>
          </Field>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create course
          </button>

          <button
            onClick={saveCurriculum}
            disabled={!curriculum || saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save curriculum'}
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Modules</div>
            <div className="mt-2 text-2xl font-black text-slate-950">{curriculum?.modules.length || 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Lessons</div>
            <div className="mt-2 text-2xl font-black text-slate-950">{lessonCount}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</div>
            <div className="mt-2 text-lg font-black text-slate-950">{selectedCourse ? 'Active course' : 'No course selected'}</div>
          </div>
        </div>

        {selectedCourse ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span>{selectedCourse.category}</span>
            <span>/</span>
            <span>{selectedCourse.difficulty}</span>
            <span>/</span>
            <Link href={`/courses/${selectedCourse.slug}`} className="font-semibold text-blue-700">
              Open learner-facing course page
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            No course is selected yet. Create one with the catalog modal, or upload a source in course mode to generate one from the document.
          </p>
        )}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Staged generation
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-950">Upload and scan source material</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              The file is stored and scanned first. After that, you decide when to create the course shell, generate each module, and generate module questions.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <Field label="Source file">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-blue-400 hover:bg-blue-50/60">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {sessionFile ? sessionFile.name : 'Upload pdf, docx, json, markdown, txt, csv, or html'}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  The backend stores the extracted source and lets the generation agent work in explicit steps.
                </div>
              </div>
              <div className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                <FileUp className="h-4 w-4" />
                Choose file
              </div>
              <input
                type="file"
                accept=".pdf,.docx,.json,.md,.markdown,.txt,.csv,.html,.htm,.yaml,.yml"
                className="hidden"
                onChange={(event) => setSessionFile(event.target.files?.[0] || null)}
              />
            </label>
          </Field>

          <Field label="Generation guidance">
            <textarea
              value={sessionInstructions}
              onChange={(event) => setSessionInstructions(event.target.value)}
              rows={4}
              placeholder="Describe the learner level, desired module count, lesson density, project style, or any constraints the generation agent should follow."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </Field>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleScanUpload}
              disabled={scanning}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {scanning ? 'Scanning source...' : 'Scan document'}
            </button>
            {generationSession ? (
              <span className="text-sm text-slate-600">
                Active session: <span className="font-semibold text-slate-900">{generationSession.fileName}</span>
              </span>
            ) : null}
          </div>

          {generationSession ? (
            <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</div>
                  <div className="mt-2 text-lg font-black text-slate-950">{generationSession.status.replace(/_/g, ' ')}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Modules planned</div>
                  <div className="mt-2 text-lg font-black text-slate-950">{generationSession.scan.modules.length}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Questions generated</div>
                  <div className="mt-2 text-lg font-black text-slate-950">{(generationSession.generation.generatedQuestionModules || []).length}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-900">Scan summary</div>
                <p className="mt-2 text-sm text-slate-700">{generationSession.summary}</p>
                <div className="mt-4 text-sm text-slate-600">
                  Recommended course: <span className="font-semibold text-slate-900">{generationSession.scan.recommendedCourse.title}</span>
                  {' '} / {generationSession.scan.recommendedCourse.category} / {generationSession.scan.recommendedCourse.difficulty}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => runGenerationAction('create_course_shell')}
                  disabled={Boolean(sessionAction)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
                >
                  {sessionAction === 'create_course_shell' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generationSession.generation.shellCreated ? 'Refresh course shell' : 'Create course shell'}
                </button>
                <button
                  onClick={() => runGenerationAction('generate_overview')}
                  disabled={!generationSession.generation.shellCreated || Boolean(sessionAction)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
                >
                  {sessionAction === 'generate_overview' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Refresh framing
                </button>
              </div>

              <div className="space-y-3">
                {generationSession.scan.modules.map((module) => {
                  const moduleGenerated = (generationSession.generation.generatedModules || []).includes(module.order);
                  const questionsGenerated = (generationSession.generation.generatedQuestionModules || []).includes(module.order);
                  return (
                    <div key={`${module.order}-${module.title}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Module {module.order}</div>
                          <div className="mt-1 break-words text-lg font-bold text-slate-950">{module.title}</div>
                          <p className="mt-2 text-sm text-slate-600">{module.description}</p>
                          <div className="mt-3 text-sm text-slate-600">
                            {module.lessonCount} lessons planned / {module.estimatedQuestionCount} questions suggested
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => runGenerationAction('generate_module', { moduleOrder: module.order })}
                            disabled={!generationSession.generation.shellCreated || Boolean(sessionAction)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                          >
                            {sessionAction === `generate_module-${module.order}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            {moduleGenerated ? 'Regenerate module' : 'Generate module'}
                          </button>
                          <button
                            onClick={() => runGenerationAction('generate_questions', { moduleOrder: module.order, questionCount: module.estimatedQuestionCount })}
                            disabled={!moduleGenerated || Boolean(sessionAction)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
                          >
                            {sessionAction === `generate_questions-${module.order}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {questionsGenerated ? 'Regenerate questions' : 'Generate questions'}
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {module.lessonTitles.map((lessonTitle) => (
                          <span key={lessonTitle} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                            {lessonTitle}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {(loadingCourses || loadingCurriculum) ? (
        <div className="flex h-64 items-center justify-center rounded-[28px] border border-slate-200 bg-white shadow-lg shadow-slate-100">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-3 text-sm text-slate-500">{loadingCourses ? 'Loading courses...' : 'Loading curriculum...'}</p>
          </div>
        </div>
      ) : curriculum ? (
        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
            <h2 className="text-xl font-bold text-slate-950">Course framing</h2>
            <p className="mt-1 text-sm text-slate-600">Set the explanation, learner flow, and roadmap learners will see.</p>
            <div className="mt-6 space-y-5">
              <AgentAssistPanel
                title="Suggest course framing and next curriculum moves"
                description="The assistant reads the current overview, module flow, and milestones, then suggests a tighter framing you can accept field by field or as a full outline."
                prompt={coursePrompt}
                onPromptChange={setCoursePrompt}
                onSuggest={suggestCourseFraming}
                loading={assistantBusyKey === 'course'}
                disabled={!agentAssignment}
                disabledReason={!agentAssignment ? 'Approve a course builder agent for this instructor to use inline suggestions here.' : ''}
                error={assistantErrors.course}
              >
                {courseSuggestion ? (
                  <>
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Suggested modules</div>
                        <div className="mt-2 text-2xl font-black text-slate-950">{courseSuggestion.curriculum.modules.length}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Suggested milestones</div>
                        <div className="mt-2 text-2xl font-black text-slate-950">{courseSuggestion.curriculum.milestoneProjects.length}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Focus</div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                          {courseSuggestion.curriculum.modules[0]?.title || 'Refine course promise'}
                        </div>
                      </div>
                    </div>
                    <Field label="Suggested overview">
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                        {courseSuggestion.curriculum.overview}
                      </div>
                    </Field>
                    <SuggestionList title="Suggested learning flow" items={courseSuggestion.curriculum.learningFlow} />
                    <div className="grid gap-4 lg:grid-cols-2">
                      <SuggestionList
                        title="Suggested module path"
                        items={courseSuggestion.curriculum.modules.map((module) => `${module.order}. ${module.title}`)}
                      />
                      <SuggestionList
                        title="Suggested milestones"
                        items={courseSuggestion.curriculum.milestoneProjects.map((project) => project.title)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={applyCourseFramingSuggestion}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4" />
                        Apply framing only
                      </button>
                      <button
                        type="button"
                        onClick={applyCourseOutlineSuggestion}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                      >
                        <Sparkles className="h-4 w-4" />
                        Apply full outline
                      </button>
                    </div>
                  </>
                ) : null}
              </AgentAssistPanel>

              <Field label="Overview">
                <textarea
                  value={curriculum.overview}
                  onChange={(event) => updateCurriculum((current) => ({ ...current, overview: event.target.value }))}
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </Field>
              <Field label="Learning flow">
                <textarea
                  value={(curriculum.learningFlow || []).join('\n')}
                  onChange={(event) => updateCurriculum((current) => ({ ...current, learningFlow: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) }))}
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </Field>
              <Field label="Visual aid">
                <textarea
                  value={curriculum.visualAidMarkdown || ''}
                  onChange={(event) => updateCurriculum((current) => ({ ...current, visualAidMarkdown: event.target.value }))}
                  rows={6}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </Field>
              <Preview title="Course roadmap preview" content={curriculum.visualAidMarkdown || '## Course roadmap\nAdd a simple visual roadmap here.'} />
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Modules and lessons</h2>
                <p className="mt-1 text-sm text-slate-600">Everything stays stacked in one flow so the page fits the screen cleanly.</p>
              </div>
              <button
                onClick={() =>
                  updateCurriculum((current) => ({
                    ...current,
                    modules: [...current.modules, makeModule(current.courseSlug, current.modules.length)],
                  }))
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add module
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {curriculum.modules.map((module, moduleIndex) => (
                <details key={`${module.order}-${module.title}-${moduleIndex}`} className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50" open={moduleIndex === 0}>
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Module {module.order}</div>
                      <div className="mt-1 break-words text-lg font-bold text-slate-950">{module.title}</div>
                      <div className="mt-1 text-sm text-slate-600">{module.lessons.length} lessons</div>
                    </div>
                    <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
                  </summary>

                  <div className="space-y-5 border-t border-slate-200 px-5 py-5">
                    <AgentAssistPanel
                      title={`Suggest content for Module ${module.order}`}
                      description="This keeps the current course draft in view, then suggests stronger framing, a better lesson sequence, and the next lesson to add."
                      prompt={modulePrompts[`module-${moduleIndex}`] || ''}
                      onPromptChange={(value) => updateModulePrompt(`module-${moduleIndex}`, value)}
                      onSuggest={() => suggestModuleContent(moduleIndex)}
                      loading={assistantBusyKey === `module-${moduleIndex}`}
                      disabled={!agentAssignment}
                      disabledReason={!agentAssignment ? 'Approve a course builder agent to unlock inline module suggestions.' : ''}
                      error={assistantErrors[`module-${moduleIndex}`]}
                    >
                      {moduleSuggestions[`module-${moduleIndex}`] ? (
                        <>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Suggested title</div>
                              <div className="mt-2 text-base font-bold text-slate-950">
                                {moduleSuggestions[`module-${moduleIndex}`].module.title}
                              </div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Suggested checkpoint</div>
                              <div className="mt-2 text-base font-bold text-slate-950">
                                {moduleSuggestions[`module-${moduleIndex}`].module.assessmentTitle || 'Applied checkpoint'}
                              </div>
                            </div>
                          </div>
                          <Field label="Suggested module description">
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                              {moduleSuggestions[`module-${moduleIndex}`].module.description}
                            </div>
                          </Field>
                          <SuggestionList
                            title="Suggested lesson path"
                            items={moduleSuggestions[`module-${moduleIndex}`].module.lessons.map(
                              (lesson, index) => `${index + 1}. ${lesson.title} - ${lesson.summary}`
                            )}
                          />
                          {moduleSuggestions[`module-${moduleIndex}`].module.lessons[module.lessons.length] ? (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                              Next suggested lesson: <span className="font-semibold">{moduleSuggestions[`module-${moduleIndex}`].module.lessons[module.lessons.length].title}</span>
                            </div>
                          ) : null}
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => applyModuleFramingSuggestion(moduleIndex, moduleSuggestions[`module-${moduleIndex}`])}
                              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                              <Save className="h-4 w-4" />
                              Apply framing
                            </button>
                            <button
                              type="button"
                              onClick={() => applyModuleLessonsSuggestion(moduleIndex, moduleSuggestions[`module-${moduleIndex}`])}
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                            >
                              <Sparkles className="h-4 w-4" />
                              Apply lessons
                            </button>
                            {moduleSuggestions[`module-${moduleIndex}`].module.lessons[module.lessons.length] ? (
                              <button
                                type="button"
                                onClick={() => addNextSuggestedLesson(moduleIndex, moduleSuggestions[`module-${moduleIndex}`])}
                                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300"
                              >
                                <Plus className="h-4 w-4" />
                                Add next lesson
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => applyModuleSuggestion(moduleIndex, moduleSuggestions[`module-${moduleIndex}`])}
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                            >
                              <WandSparkles className="h-4 w-4" />
                              Replace module draft
                            </button>
                          </div>
                        </>
                      ) : null}
                    </AgentAssistPanel>

                    <div className="flex justify-end">
                      <button
                        onClick={() =>
                          updateCurriculum((current) => ({
                            ...current,
                            modules: current.modules
                              .filter((_, index) => index !== moduleIndex)
                              .map((item, index) => ({ ...item, order: index + 1 })),
                          }))
                        }
                        className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove module
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Module title">
                        <input
                          value={module.title}
                          onChange={(event) => updateModule(moduleIndex, (currentModule) => ({ ...currentModule, title: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      </Field>
                      <Field label="Assessment title">
                        <input
                          value={module.assessmentTitle || ''}
                          onChange={(event) => updateModule(moduleIndex, (currentModule) => ({ ...currentModule, assessmentTitle: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      </Field>
                    </div>

                    <Field label="Module description">
                      <textarea
                        value={module.description}
                        onChange={(event) => updateModule(moduleIndex, (currentModule) => ({ ...currentModule, description: event.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </Field>

                    <Field label="Assessment quiz ID">
                      <input
                        value={module.assessmentQuizId || ''}
                        onChange={(event) => updateModule(moduleIndex, (currentModule) => ({ ...currentModule, assessmentQuizId: event.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </Field>

                    <div className="space-y-4">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <details key={`${lesson.slug}-${lessonIndex}`} className="rounded-[22px] border border-slate-200 bg-white" open={lessonIndex === 0}>
                          <summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-4">
                            <div className="min-w-0">
                              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Lesson {lessonIndex + 1}</div>
                              <div className="mt-1 break-words font-semibold text-slate-950">{lesson.title}</div>
                            </div>
                            <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
                          </summary>

                          <div className="space-y-4 border-t border-slate-200 px-4 py-4">
                            <AgentAssistPanel
                              title={`Suggest content for ${lesson.title || `Lesson ${lessonIndex + 1}`}`}
                              description="The assistant uses the active lesson, surrounding module sequence, and current draft progress to suggest the next best lesson content."
                              prompt={lessonPrompts[`lesson-${moduleIndex}-${lessonIndex}`] || ''}
                              onPromptChange={(value) => updateLessonPrompt(`lesson-${moduleIndex}-${lessonIndex}`, value)}
                              onSuggest={() => suggestLessonContent(moduleIndex, lessonIndex)}
                              loading={assistantBusyKey === `lesson-${moduleIndex}-${lessonIndex}`}
                              disabled={!agentAssignment}
                              disabledReason={!agentAssignment ? 'Approve a course builder agent to unlock inline lesson suggestions.' : ''}
                              error={assistantErrors[`lesson-${moduleIndex}-${lessonIndex}`]}
                            >
                              {lessonSuggestions[`lesson-${moduleIndex}-${lessonIndex}`] ? (
                                <>
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Suggested summary</div>
                                      <div className="mt-2 text-sm text-slate-700">
                                        {lessonSuggestions[`lesson-${moduleIndex}-${lessonIndex}`].lesson.summary}
                                      </div>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Suggested duration</div>
                                      <div className="mt-2 text-sm font-semibold text-slate-900">
                                        {lessonSuggestions[`lesson-${moduleIndex}-${lessonIndex}`].lesson.durationMinutes} minutes
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid gap-4 lg:grid-cols-2">
                                    <SuggestionList
                                      title="Suggested objectives"
                                      items={lessonSuggestions[`lesson-${moduleIndex}-${lessonIndex}`].lesson.learningObjectives}
                                    />
                                    <SuggestionList
                                      title="Suggested takeaways"
                                      items={lessonSuggestions[`lesson-${moduleIndex}-${lessonIndex}`].lesson.keyTakeaways}
                                    />
                                  </div>
                                  <div className="grid gap-4 lg:grid-cols-2">
                                    <SuggestionList
                                      title="Suggested section outline"
                                      items={lessonSuggestions[`lesson-${moduleIndex}-${lessonIndex}`].plan?.sectionOutline}
                                    />
                                    <SuggestionList
                                      title="Suggested practice arc"
                                      items={lessonSuggestions[`lesson-${moduleIndex}-${lessonIndex}`].plan?.practiceArc}
                                    />
                                  </div>
                                  <div className="flex flex-wrap gap-3">
                                    <button
                                      type="button"
                                      onClick={() => applyLessonStructureSuggestion(moduleIndex, lessonIndex, lessonSuggestions[`lesson-${moduleIndex}-${lessonIndex}`])}
                                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                      <Save className="h-4 w-4" />
                                      Apply structure
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => applyLessonTeachingSuggestion(moduleIndex, lessonIndex, lessonSuggestions[`lesson-${moduleIndex}-${lessonIndex}`])}
                                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                                    >
                                      <Sparkles className="h-4 w-4" />
                                      Apply teaching content
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => applyLessonSuggestion(moduleIndex, lessonIndex, lessonSuggestions[`lesson-${moduleIndex}-${lessonIndex}`])}
                                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                                    >
                                      <WandSparkles className="h-4 w-4" />
                                      Replace lesson draft
                                    </button>
                                  </div>
                                </>
                              ) : null}
                            </AgentAssistPanel>

                            <div className="flex justify-end">
                              <button
                                onClick={() =>
                                  updateModule(moduleIndex, (currentModule) => ({
                                    ...currentModule,
                                    lessons: currentModule.lessons.filter((_, index) => index !== lessonIndex),
                                  }))
                                }
                                className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600"
                              >
                                <Trash2 className="h-4 w-4" />
                                Remove lesson
                              </button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <Field label="Lesson title">
                                <input
                                  value={lesson.title}
                                  onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, title: event.target.value }))}
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                              </Field>
                              <Field label="Lesson slug">
                                <input
                                  value={lesson.slug}
                                  onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, slug: event.target.value }))}
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                              </Field>
                              <Field label="Library lesson slug">
                                <input
                                  value={lesson.libraryLessonSlug || ''}
                                  onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, libraryLessonSlug: event.target.value }))}
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                              </Field>
                              <Field label="Duration (minutes)">
                                <input
                                  type="number"
                                  value={String(lesson.durationMinutes)}
                                  onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, durationMinutes: Number(event.target.value) || 0 }))}
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                              </Field>
                            </div>
                            
                            <div className="grid gap-4 md:grid-cols-2">
                              <Field label="Content type">
                                <select
                                  value={lesson.contentType}
                                  onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, contentType: event.target.value }))}
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                >
                                  {['lesson', 'quiz', 'test', 'project', 'resource'].map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </Field>
                              <Field label="Quiz ID">
                                <input
                                  value={lesson.quizId || ''}
                                  onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, quizId: event.target.value }))}
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                              </Field>
                            </div>

                            <Field label="Quiz title">
                              <input
                                value={lesson.quizTitle || ''}
                                onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, quizTitle: event.target.value }))}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                              />
                            </Field>

                            <Field label="Lesson summary">
                              <textarea
                                value={lesson.summary}
                                onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, summary: event.target.value }))}
                                rows={3}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                              />
                            </Field>

                            <Field label="Learning objectives">
                              <textarea
                                value={(lesson.learningObjectives || []).join('\n')}
                                onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, learningObjectives: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) }))}
                                rows={4}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                              />
                            </Field>

                            <Field label="Key takeaways">
                              <textarea
                                value={(lesson.keyTakeaways || []).join('\n')}
                                onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, keyTakeaways: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) }))}
                                rows={4}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                              />
                            </Field>

                            <Field label="Lesson learning flow">
                              <textarea
                                value={(lesson.learningFlow || []).join('\n')}
                                onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, learningFlow: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) }))}
                                rows={4}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                              />
                            </Field>

                            <Field label="Content markdown">
                              <textarea
                                value={lesson.contentMarkdown || ''}
                                onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, contentMarkdown: event.target.value }))}
                                rows={12}
                                spellCheck={false}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                              />
                            </Field>
                            <Preview title="Lesson content preview" content={lesson.contentMarkdown || '# Lesson preview\n\nAdd lesson markdown here.'} />

                            <Field label="Visual aid">
                              <textarea
                                value={lesson.visualAidMarkdown || ''}
                                onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, visualAidMarkdown: event.target.value }))}
                                rows={6}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                              />
                            </Field>
                            <Preview title="Lesson visual aid preview" content={lesson.visualAidMarkdown || '## Visual aid\n`Concept` -> `Example` -> `Practice`'} />

                            <Field label="Practice prompt">
                              <textarea
                                value={lesson.practicePrompt || ''}
                                onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, practicePrompt: event.target.value }))}
                                rows={3}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                              />
                            </Field>

                            <Field label="Instructor notes">
                              <textarea
                                value={lesson.instructorNotes || ''}
                                onChange={(event) => updateLesson(moduleIndex, lessonIndex, (currentLesson) => ({ ...currentLesson, instructorNotes: event.target.value }))}
                                rows={3}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                              />
                            </Field>
                          </div>
                        </details>
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        updateModule(moduleIndex, (currentModule) => ({
                          ...currentModule,
                          lessons: [...currentModule.lessons, makeLesson(curriculum.courseSlug, moduleIndex, currentModule.lessons.length)],
                        }))
                      }
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add lesson
                    </button>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Milestone projects</h2>
                <p className="mt-1 text-sm text-slate-600">Keep project expectations visible, but in the same vertical flow as the rest of the page.</p>
              </div>
              <button
                onClick={() =>
                  updateCurriculum((current) => ({
                    ...current,
                    milestoneProjects: [...current.milestoneProjects, makeProject(current.milestoneProjects.length)],
                  }))
                }
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add milestone
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {curriculum.milestoneProjects.map((project, projectIndex) => (
                <div key={`${project.title}-${projectIndex}`} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() =>
                        updateCurriculum((current) => ({
                          ...current,
                          milestoneProjects: current.milestoneProjects
                            .filter((_, index) => index !== projectIndex)
                            .map((item, index) => ({ ...item, milestoneOrder: index + 1 })),
                        }))
                      }
                      className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                  <div className="mt-4 space-y-4">
                    <Field label="Project title">
                      <input
                        value={project.title}
                        onChange={(event) =>
                          updateCurriculum((current) => ({
                            ...current,
                            milestoneProjects: current.milestoneProjects.map((item, index) => (index === projectIndex ? { ...item, title: event.target.value } : item)),
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </Field>
                    <Field label="Description">
                      <textarea
                        value={project.description}
                        onChange={(event) =>
                          updateCurriculum((current) => ({
                            ...current,
                            milestoneProjects: current.milestoneProjects.map((item, index) => (index === projectIndex ? { ...item, description: event.target.value } : item)),
                          }))
                        }
                        rows={4}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </Field>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Estimated hours">
                        <input
                          type="number"
                          value={String(project.estimatedHours)}
                          onChange={(event) =>
                            updateCurriculum((current) => ({
                              ...current,
                              milestoneProjects: current.milestoneProjects.map((item, index) => (index === projectIndex ? { ...item, estimatedHours: Number(event.target.value) || 0 } : item)),
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      </Field>
                      <Field label="Completion threshold">
                        <input
                          type="number"
                          value={String(project.completionThreshold)}
                          onChange={(event) =>
                            updateCurriculum((current) => ({
                              ...current,
                              milestoneProjects: current.milestoneProjects.map((item, index) => (index === projectIndex ? { ...item, completionThreshold: Number(event.target.value) || 70 } : item)),
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      </Field>
                    </div>
                    <Field label="Deliverables">
                      <textarea
                        value={project.deliverables.join('\n')}
                        onChange={(event) =>
                          updateCurriculum((current) => ({
                            ...current,
                            milestoneProjects: current.milestoneProjects.map((item, index) => (index === projectIndex ? { ...item, deliverables: event.target.value.split('\n').map((entry) => entry.trim()).filter(Boolean) } : item)),
                          }))
                        }
                        rows={4}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </Field>
                  </div>
                </div>
              ))}

              {curriculum.milestoneProjects.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  No milestone projects yet.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : (
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center shadow-lg shadow-slate-100">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-xl font-bold text-slate-950">Create or choose a course</h2>
          <p className="mt-2 text-sm text-slate-600">Start with the course modal if you want a manual shell, or upload a source document in course mode to let the agent build the curriculum from the file.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create course
          </button>
        </div>
      )}

      {showCreateModal ? (
        <CourseModal
          course={null}
          onSubmit={(data) => handleCreateCourse(data)}
          onStartImport={handleModalImportStart}
          loading={creatingCourse}
          importing={importingCourse}
          onClose={() => setShowCreateModal(false)}
        />
      ) : null}
    </div>
  );
}
