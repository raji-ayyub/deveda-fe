'use client';

import { useEffect, useState } from 'react';
import { FileUp, Loader2, Sparkles } from 'lucide-react';

import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error';
import { ContentIngestionResult, CourseCatalog } from '@/lib/types';

type IntakeIntent = 'course' | 'lesson' | 'quiz' | 'question_bank';

interface AgenticContentIntakePanelProps {
  title: string;
  description: string;
  courses?: CourseCatalog[];
  allowedIntents?: IntakeIntent[];
  defaultIntent?: IntakeIntent;
  defaultCourseSlug?: string;
  onImported?: (result: ContentIngestionResult) => void;
}

const intentLabels: Record<IntakeIntent, string> = {
  course: 'Course build',
  lesson: 'Lesson import',
  quiz: 'Quiz import',
  question_bank: 'Question bank',
};

export default function AgenticContentIntakePanel({
  title,
  description,
  courses = [],
  allowedIntents = ['course', 'lesson', 'question_bank'],
  defaultIntent = 'course',
  defaultCourseSlug = '',
  onImported,
}: AgenticContentIntakePanelProps) {
  const [intent, setIntent] = useState<IntakeIntent>(defaultIntent);
  const [courseSlug, setCourseSlug] = useState(defaultCourseSlug);
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ContentIngestionResult | null>(null);

  useEffect(() => {
    setIntent(defaultIntent);
    setError('');
    setResult(null);
  }, [defaultIntent]);

  useEffect(() => {
    setCourseSlug(defaultCourseSlug);
    setError('');
    setResult(null);
  }, [defaultCourseSlug]);

  const requiresCourse = intent === 'lesson';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      setError('Choose a source file first.');
      return;
    }

    if (requiresCourse && !courseSlug) {
      setError('Select the course that should own this imported lesson.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.ingestLearningContent({
        intent,
        file,
        courseSlug: courseSlug || undefined,
        instructions,
      });
      setResult(response.data);
      setFile(null);
      setInstructions('');
      onImported?.(response.data);
    } catch (requestError: any) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            Agentic intake
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Import type</label>
            <select
              value={intent}
              onChange={(event) => setIntent(event.target.value as IntakeIntent)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {allowedIntents.map((option) => (
                <option key={option} value={option}>
                  {intentLabels[option]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Target course</label>
            <select
              value={courseSlug}
              onChange={(event) => setCourseSlug(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">{requiresCourse ? 'Select course' : 'Optional course link'}</option>
              {courses.map((course) => (
                <option key={course.slug} value={course.slug}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Source file</label>
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-blue-400 hover:bg-blue-50/60">
            <div>
              <div className="text-sm font-semibold text-slate-900">{file ? file.name : 'Upload pdf, docx, json, markdown, txt, csv, or html'}</div>
              <div className="mt-1 text-xs text-slate-500">The backend extracts the source, then the agent restructures it into the frontend course schema.</div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              <FileUp className="h-4 w-4" />
              Choose file
            </div>
            <input
              type="file"
              accept=".pdf,.docx,.json,.md,.markdown,.txt,.csv,.html,.htm,.yaml,.yml"
              className="hidden"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Instructor guidance</label>
          <textarea
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            rows={4}
            placeholder="Add any tone, structure, level, or outcome constraints you want the intake agent to honor."
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'Importing source...' : 'Run import'}
        </button>
      </form>

      {result ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <div className="font-semibold">Import complete</div>
          <p className="mt-2">{result.summary}</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-white/80 px-3 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Lessons</div>
              <div className="mt-2 text-lg font-bold">{result.stats.lessonCount}</div>
            </div>
            <div className="rounded-2xl bg-white/80 px-3 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Questions</div>
              <div className="mt-2 text-lg font-bold">{result.stats.questionCount}</div>
            </div>
            <div className="rounded-2xl bg-white/80 px-3 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Quizzes</div>
              <div className="mt-2 text-lg font-bold">{result.stats.quizCount}</div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
