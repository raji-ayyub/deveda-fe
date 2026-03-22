'use client';

import React, { useEffect, useState } from 'react';
import { Copy, Download, Edit, HelpCircle, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';

import AgenticContentIntakePanel from '@/components/dashboard/AgenticContentIntakePanel';
import QuestionModal from '@/components/dashboard/QuestionModal';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { api } from '@/lib/api';
import { ContentIngestionResult, CourseCatalog, QuestionWithDetails, QuizWithDetails } from '@/lib/types';

export default function QuestionsManagementPage() {
  const [questions, setQuestions] = useState<QuestionWithDetails[]>([]);
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [quizzes, setQuizzes] = useState<QuizWithDetails[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [quizFilter, setQuizFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithDetails | null>(null);
  const [error, setError] = useState('');
  const [pendingDeleteQuestionId, setPendingDeleteQuestionId] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    let filtered = [...questions];

    if (searchTerm) {
      filtered = filtered.filter(
        (question) =>
          question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.quizId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (quizFilter !== 'all') {
      filtered = filtered.filter((question) => question.quizId === quizFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((question) => question.difficulty === difficultyFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((question) => (statusFilter === 'active' ? question.isActive : !question.isActive));
    }

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, quizFilter, difficultyFilter, statusFilter]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError('');
      const [questionsRes, coursesRes, quizzesRes] = await Promise.all([
        api.getQuestionsWithDetails(),
        api.getCourseCatalog().catch(() => ({ data: [] as CourseCatalog[] })),
        api.getQuizzes().catch(() => ({ data: [] as QuizWithDetails[] })),
      ]);
      const response = questionsRes;
      setQuestions(response.data);
      setCourses(coursesRes.data || []);
      setQuizzes(quizzesRes.data || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
      setError('Unable to load the question bank right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportedQuestions = (result: ContentIngestionResult) => {
    if (result.questions.length > 0) {
      loadQuestions();
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await api.deleteQuestion(questionId);
      setQuestions((current) => current.filter((question) => question.id !== questionId));
      setPendingDeleteQuestionId(null);
    } catch (error) {
      console.error('Failed to delete question:', error);
      setError('Unable to delete the selected question right now.');
    }
  };

  const handleDuplicateQuestion = async (question: QuestionWithDetails) => {
    try {
      setError('');
      const { id, createdAt, updatedAt, createdBy, ...rest } = question;
      const response = await api.createQuestion({
        ...rest,
        question: `${question.question} (Copy)`,
      });
      setQuestions((current) => [response.data, ...current]);
    } catch (error) {
      console.error('Failed to duplicate question:', error);
      setError('Unable to duplicate this question right now.');
    }
  };

  const getQuizTitle = (quizId: string) => quizzes.find((quiz) => quiz.id === quizId)?.title || quizId;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Question Bank</h2>
          <p className="text-gray-600">Import quiz content first, then use manual edit only for final cleanup.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Manual question
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <AgenticContentIntakePanel
        title="Upload assessment source"
        description="Drop in structured question JSON, marked-up docs, or teaching material the backend can turn into quiz questions. This is the preferred creation path now; the manual modal stays for edits and quick touch-ups."
        courses={courses}
        allowedIntents={['question_bank', 'quiz']}
        defaultIntent="question_bank"
        onImported={handleImportedQuestions}
      />

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={quizFilter}
            onChange={(event) => setQuizFilter(event.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Quizzes</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(event) => setDifficultyFilter(event.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <button
            onClick={loadQuestions}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuestions.map((question) => (
          <div key={question.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{question.question}</h3>
                  <p className="text-sm text-gray-500">{getQuizTitle(question.quizId)}</p>
                  </div>
                </div>
              <div className="flex items-center space-x-1">
                <button onClick={() => handleDuplicateQuestion(question)} className="p-1 hover:bg-gray-100 rounded" title="Duplicate">
                  <Copy className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                </button>
                <button
                  onClick={() => {
                    setEditingQuestion(question);
                    setShowEditModal(true);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                </button>
                <button onClick={() => setPendingDeleteQuestionId(question.id)} className="p-1 hover:bg-gray-100 rounded" title="Delete">
                  <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">{question.questionType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Difficulty:</span>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    question.difficulty === 'Easy'
                      ? 'bg-green-100 text-green-800'
                      : question.difficulty === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {question.difficulty}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Points:</span>
                <span className="font-medium">{question.points} pts</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center p-2 rounded-lg ${
                      option === question.correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                        option === question.correctAnswer ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className={option === question.correctAnswer ? 'text-sm text-green-700' : 'text-sm text-gray-700'}>{option}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${question.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-xs ${question.isActive ? 'text-green-700' : 'text-red-700'}`}>
                      {question.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Updated: {new Date(question.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
          <HelpCircle className="w-16 h-16 text-gray-300 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No questions found</h3>
          <p className="mt-2 text-gray-500">
            {questions.length === 0 ? 'Get started by adding your first question.' : 'Try adjusting your search or filters.'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </button>
        </div>
      )}

      <QuestionModal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setEditingQuestion(null);
        }}
        onSave={(savedQuestion) => {
          if (editingQuestion) {
            setQuestions((current) =>
              current.map((question) => (question.id === savedQuestion.id ? { ...question, ...savedQuestion } : question))
            );
          } else {
            setQuestions((current) => [savedQuestion as QuestionWithDetails, ...current]);
          }
          setShowCreateModal(false);
          setShowEditModal(false);
          setEditingQuestion(null);
        }}
        initialData={editingQuestion || undefined}
        quizzes={quizzes}
      />

      <ConfirmationDialog
        isOpen={Boolean(pendingDeleteQuestionId)}
        title="Delete question"
        description="This will permanently remove the selected question from the bank and any quiz using it."
        confirmLabel="Delete question"
        onCancel={() => setPendingDeleteQuestionId(null)}
        onConfirm={() => {
          if (pendingDeleteQuestionId) {
            void handleDeleteQuestion(pendingDeleteQuestionId);
          }
        }}
      />
    </div>
  );
}
