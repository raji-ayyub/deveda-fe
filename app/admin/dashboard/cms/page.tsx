'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Save, Sparkles, Trash2 } from 'lucide-react';

import { api } from '@/lib/api';
import { CourseCatalog, CourseCurriculum, CourseCurriculumLesson, CourseCurriculumModule, MilestoneProject } from '@/lib/types';

const makeLesson = (moduleIndex: number, lessonIndex: number): CourseCurriculumLesson => ({
  title: `Lesson ${lessonIndex + 1}`,
  slug: `module-${moduleIndex + 1}-lesson-${lessonIndex + 1}`,
  summary: 'Add a short lesson summary.',
  durationMinutes: 20,
  contentType: 'lesson',
  quizId: '',
  quizTitle: '',
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

export default function CMSPage() {
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [curriculum, setCurriculum] = useState<CourseCurriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const response = await api.getCourseCatalog();
        setCourses(response.data);
        if (response.data[0]) {
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
  }, []);

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

  const updateCurriculum = (updater: (current: CourseCurriculum) => CourseCurriculum) => {
    setCurriculum((current) => (current ? updater(current) : current));
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

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_60%,#38bdf8_100%)] p-8 text-white shadow-2xl shadow-slate-300">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
          <Sparkles className="h-3.5 w-3.5" />
          Instructor Studio
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight">Curriculum Builder</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-200">
          Build module-based lessons, attach quizzes after lessons, and define milestone projects for each coding path.
        </p>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
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

          <button
            onClick={saveCurriculum}
            disabled={!curriculum || saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save curriculum
          </button>
        </div>

        {message && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
        {error && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      </section>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-[28px] border border-slate-200 bg-white shadow-lg shadow-slate-100">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-3 text-sm text-slate-500">Loading curriculum...</p>
          </div>
        </div>
      ) : curriculum ? (
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <section className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Course overview</label>
              <textarea
                value={curriculum.overview}
                onChange={(event) => updateCurriculum((current) => ({ ...current, overview: event.target.value }))}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-4">
              {curriculum.modules.map((module, moduleIndex) => (
                <div key={`${module.title}-${moduleIndex}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <input
                      value={module.title}
                      onChange={(event) =>
                        updateCurriculum((current) => ({
                          ...current,
                          modules: current.modules.map((item, index) =>
                            index === moduleIndex ? { ...item, title: event.target.value } : item
                          ),
                        }))
                      }
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
                    onChange={(event) =>
                      updateCurriculum((current) => ({
                        ...current,
                        modules: current.modules.map((item, index) =>
                          index === moduleIndex ? { ...item, description: event.target.value } : item
                        ),
                      }))
                    }
                    rows={3}
                    className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <SimpleField
                      label="Assessment title"
                      value={module.assessmentTitle || ''}
                      onChange={(value) =>
                        updateCurriculum((current) => ({
                          ...current,
                          modules: current.modules.map((item, index) =>
                            index === moduleIndex ? { ...item, assessmentTitle: value } : item
                          ),
                        }))
                      }
                    />
                    <SimpleField
                      label="Assessment quiz ID"
                      value={module.assessmentQuizId || ''}
                      onChange={(value) =>
                        updateCurriculum((current) => ({
                          ...current,
                          modules: current.modules.map((item, index) =>
                            index === moduleIndex ? { ...item, assessmentQuizId: value } : item
                          ),
                        }))
                      }
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={`${lesson.slug}-${lessonIndex}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-500">Lesson {lessonIndex + 1}</p>
                          <button
                            onClick={() =>
                              updateCurriculum((current) => ({
                                ...current,
                                modules: current.modules.map((item, index) =>
                                  index === moduleIndex
                                    ? { ...item, lessons: item.lessons.filter((_, currentLessonIndex) => currentLessonIndex !== lessonIndex) }
                                    : item
                                ),
                              }))
                            }
                            className="text-sm font-semibold text-rose-600"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                          <SimpleField
                            label="Title"
                            value={lesson.title}
                            onChange={(value) => {
                              updateCurriculum((current) => ({
                                ...current,
                                modules: current.modules.map((item, index) =>
                                  index === moduleIndex
                                    ? {
                                        ...item,
                                        lessons: item.lessons.map((currentLesson, currentLessonIndex) =>
                                          currentLessonIndex === lessonIndex ? { ...currentLesson, title: value } : currentLesson
                                        ),
                                      }
                                    : item
                                ),
                              }));
                            }}
                          />
                          <SimpleField
                            label="Slug"
                            value={lesson.slug}
                            onChange={(value) => {
                              updateCurriculum((current) => ({
                                ...current,
                                modules: current.modules.map((item, index) =>
                                  index === moduleIndex
                                    ? {
                                        ...item,
                                        lessons: item.lessons.map((currentLesson, currentLessonIndex) =>
                                          currentLessonIndex === lessonIndex ? { ...currentLesson, slug: value } : currentLesson
                                        ),
                                      }
                                    : item
                                ),
                              }));
                            }}
                          />
                          <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Summary</label>
                            <textarea
                              value={lesson.summary}
                              onChange={(event) =>
                                updateCurriculum((current) => ({
                                  ...current,
                                  modules: current.modules.map((item, index) =>
                                    index === moduleIndex
                                      ? {
                                          ...item,
                                          lessons: item.lessons.map((currentLesson, currentLessonIndex) =>
                                            currentLessonIndex === lessonIndex ? { ...currentLesson, summary: event.target.value } : currentLesson
                                          ),
                                        }
                                      : item
                                  ),
                                }))
                              }
                              rows={3}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                          </div>
                          <SimpleField
                            label="Duration (minutes)"
                            type="number"
                            value={String(lesson.durationMinutes)}
                            onChange={(value) =>
                              updateCurriculum((current) => ({
                                ...current,
                                modules: current.modules.map((item, index) =>
                                  index === moduleIndex
                                    ? {
                                        ...item,
                                        lessons: item.lessons.map((currentLesson, currentLessonIndex) =>
                                          currentLessonIndex === lessonIndex ? { ...currentLesson, durationMinutes: Number(value) || 0 } : currentLesson
                                        ),
                                      }
                                    : item
                                ),
                              }))
                            }
                          />
                          <SimpleField
                            label="Quiz after lesson"
                            value={lesson.quizId || ''}
                            onChange={(value) =>
                              updateCurriculum((current) => ({
                                ...current,
                                modules: current.modules.map((item, index) =>
                                  index === moduleIndex
                                    ? {
                                        ...item,
                                        lessons: item.lessons.map((currentLesson, currentLessonIndex) =>
                                          currentLessonIndex === lessonIndex ? { ...currentLesson, quizId: value } : currentLesson
                                        ),
                                      }
                                    : item
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
                        modules: current.modules.map((item, index) =>
                          index === moduleIndex ? { ...item, lessons: [...item.lessons, makeLesson(moduleIndex, item.lessons.length)] } : item
                        ),
                      }))
                    }
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
                          milestoneProjects: current.milestoneProjects.filter((_, index) => index !== projectIndex).map((item, index) => ({ ...item, milestoneOrder: index + 1 })),
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
