'use client';

import React, { useEffect, useState } from 'react';
import { Bot, Loader2, Save, WandSparkles, X } from 'lucide-react';

import { api } from '@/lib/api';
import { AgentAssignment, GeneratedQuestionContentPayload, QuizQuestion } from '@/lib/types';

interface Quiz {
  id: string;
  title: string;
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: QuizQuestion) => void;
  initialData?: QuizQuestion;
  quizzes?: Quiz[];
}

const emptyOptions = ['', '', '', ''];

const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  quizzes = [],
}) => {
  const [formData, setFormData] = useState({
    quizId: '',
    question: '',
    options: emptyOptions,
    correctAnswer: '',
    explanation: '',
    points: 1,
    timeLimit: 60,
    questionType: 'multiple_choice',
    difficulty: 'Medium',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [agentAssignment, setAgentAssignment] = useState<AgentAssignment | null>(null);
  const [agentPrompt, setAgentPrompt] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [agentError, setAgentError] = useState('');
  const [agentSuggestion, setAgentSuggestion] = useState<GeneratedQuestionContentPayload | null>(null);
  const [validationError, setValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const selectedQuizTitle = quizzes.find((quiz) => quiz.id === formData.quizId)?.title || '';

  useEffect(() => {
    setAgentSuggestion(null);
    if (!initialData) {
      setFormData({
        quizId: '',
        question: '',
        options: emptyOptions,
        correctAnswer: '',
        explanation: '',
        points: 1,
        timeLimit: 60,
        questionType: 'multiple_choice',
        difficulty: 'Medium',
        isActive: true,
      });
      return;
    }

    setFormData({
      quizId: initialData.quizId || '',
      question: initialData.question || '',
      options: initialData.options?.length ? initialData.options : emptyOptions,
      correctAnswer: initialData.correctAnswer || '',
      explanation: initialData.explanation || '',
      points: initialData.points || 1,
      timeLimit: initialData.timeLimit || 60,
      questionType: initialData.questionType || 'multiple_choice',
      difficulty: initialData.difficulty || 'Medium',
      isActive: initialData.isActive ?? true,
    });
  }, [initialData]);

  useEffect(() => {
    if (!isOpen) {
      setValidationError('');
      setSubmitError('');
      setAgentError('');
      setAgentPrompt('');
      setAgentSuggestion(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const response = await api.getAgentAssignments();
        const approvedAssignment = response.data.find(
          (assignment) => assignment.agentType === 'course_builder' && assignment.status === 'approved'
        ) || null;
        setAgentAssignment(approvedAssignment);
      } catch (error) {
        console.error('Failed to load question agent assignment:', error);
        setAgentAssignment(null);
      }
    };

    if (isOpen) {
      loadAssignment();
    }
  }, [isOpen]);

  const updateOption = (index: number, value: string) => {
    setFormData((current) => {
      const nextOptions = [...current.options];
      nextOptions[index] = value;

      return {
        ...current,
        options: nextOptions,
        correctAnswer: current.correctAnswer === current.options[index] ? value : current.correctAnswer,
      };
    });
  };

  const addOption = () => {
    setFormData((current) => ({
      ...current,
      options: current.options.length < 6 ? [...current.options, ''] : current.options,
    }));
  };

  const removeOption = (index: number) => {
    setFormData((current) => {
      if (current.options.length <= 2) {
        return current;
      }

      const removed = current.options[index];
      const nextOptions = current.options.filter((_, optionIndex) => optionIndex !== index);
      return {
        ...current,
        options: nextOptions,
        correctAnswer: current.correctAnswer === removed ? '' : current.correctAnswer,
      };
    });
  };

  const handleSubmit = async () => {
    const cleanedOptions = formData.options.map((option) => option.trim()).filter(Boolean);
    setValidationError('');
    setSubmitError('');

    if (!formData.quizId.trim() || !formData.question.trim()) {
      setValidationError('Quiz ID and question text are required.');
      return;
    }

    if (cleanedOptions.length < 2) {
      setValidationError('Add at least two answer options.');
      return;
    }

    if (!formData.correctAnswer.trim() || !cleanedOptions.includes(formData.correctAnswer.trim())) {
      setValidationError('Select a valid correct answer from the options.');
      return;
    }

    const payload = {
      ...formData,
      quizId: formData.quizId.trim(),
      question: formData.question.trim(),
      options: cleanedOptions,
      correctAnswer: formData.correctAnswer.trim(),
      explanation: formData.explanation.trim(),
    };

    try {
      setSubmitting(true);
      const response = initialData
        ? await api.updateQuestion(initialData.id, payload)
        : await api.createQuestion(payload);

      onSave(response.data);
      onClose();
    } catch (error) {
      console.error('Failed to save question:', error);
      setSubmitError('Failed to save question.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDraftWithAgent = async () => {
    if (!agentAssignment) {
      return;
    }

    try {
      setDrafting(true);
      setAgentError('');
      setAgentSuggestion(null);
      const response = await api.runAgentAction(agentAssignment.id, {
        actionType: 'generate_question_content',
        instruction:
          agentPrompt.trim() ||
          `Generate one complete question for ${selectedQuizTitle || formData.quizId || 'this quiz'} using the current quiz context, the existing draft progress, and a plausible learner checkpoint.`,
        draftPayload: {
          ...formData,
          quizTitle: selectedQuizTitle,
        },
      });
      const generated = response.data.payload as unknown as GeneratedQuestionContentPayload;
      setAgentSuggestion(generated);
    } catch (error: any) {
      setAgentError(error.message || 'Unable to generate a question draft right now.');
    } finally {
      setDrafting(false);
    }
  };

  const applyAgentSuggestion = () => {
    if (!agentSuggestion) {
      return;
    }

    setFormData((current) => ({
      ...current,
      ...agentSuggestion,
      options: agentSuggestion.options?.length ? agentSuggestion.options : current.options,
    }));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-300">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h3 className="text-xl font-bold text-slate-950">{initialData ? 'Edit Question' : 'Create Question'}</h3>
            <p className="mt-1 text-sm text-slate-600">Define the prompt, answers, and grading metadata.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          {validationError ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{validationError}</div> : null}
          {submitError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</div> : null}
          {agentAssignment ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Bot className="h-4 w-4 text-blue-700" />
                Agent autofill
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Ask the course builder to suggest a complete question draft, review it in context, then accept it into the form.
              </p>
              <div className="mt-3 flex flex-col gap-3 md:flex-row">
                <textarea
                  value={agentPrompt}
                  onChange={(event) => setAgentPrompt(event.target.value)}
                  rows={3}
                  placeholder="Describe the concept to assess, the skill level, and any constraint for the question."
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={handleDraftWithAgent}
                  disabled={drafting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {drafting ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
                  Suggest question
                </button>
              </div>
              {agentError ? <p className="mt-3 text-sm text-rose-600">{agentError}</p> : null}
              {agentSuggestion ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Suggested question</div>
                      <div className="mt-2 text-base font-semibold text-slate-950">{agentSuggestion.question}</div>
                    </div>
                    <button
                      type="button"
                      onClick={applyAgentSuggestion}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4" />
                      Accept suggestion
                    </button>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Answer options</div>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        {agentSuggestion.options.map((option, index) => (
                          <div key={`${option}-${index}`} className="rounded-xl bg-white px-3 py-2">
                            {option}
                            {agentSuggestion.correctAnswer === option ? (
                              <span className="ml-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Correct</span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Explanation</div>
                      <div className="mt-3 text-sm text-slate-700">{agentSuggestion.explanation}</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Quiz</label>
              <select
                value={formData.quizId}
                onChange={(event) => setFormData((current) => ({ ...current, quizId: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Select quiz</option>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Points" type="number" value={String(formData.points)} onChange={(value) => setFormData((current) => ({ ...current, points: Number(value) || 1 }))} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Question</label>
            <textarea
              value={formData.question}
              onChange={(event) => setFormData((current) => ({ ...current, question: event.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">Answer options</label>
              <button onClick={addOption} type="button" className="text-sm font-semibold text-blue-700">
                Add option
              </button>
            </div>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={`${index}-${option}`} className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                  <input
                    value={option}
                    onChange={(event) => updateOption(index, event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />
                  <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswer === option}
                      onChange={() => setFormData((current) => ({ ...current, correctAnswer: option }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    Correct
                  </label>
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Explanation</label>
            <textarea
              value={formData.explanation}
              onChange={(event) => setFormData((current) => ({ ...current, explanation: event.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Time limit (seconds)" type="number" value={String(formData.timeLimit)} onChange={(value) => setFormData((current) => ({ ...current, timeLimit: Number(value) || 60 }))} />
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(event) => setFormData((current) => ({ ...current, difficulty: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Question type</label>
              <select
                value={formData.questionType}
                onChange={(event) => setFormData((current) => ({ ...current, questionType: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="multiple_choice">Single correct answer</option>
                <option value="multiple">Multiple choice</option>
                <option value="single">Single choice</option>
              </select>
            </div>
            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(event) => setFormData((current) => ({ ...current, isActive: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Active in live quizzes
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
          <button onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {submitting ? 'Saving...' : initialData ? 'Update question' : 'Create question'}
          </button>
        </div>
      </div>
    </div>
  );
};

function Field({
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
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

export default QuestionModal;
