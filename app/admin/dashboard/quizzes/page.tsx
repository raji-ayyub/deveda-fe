'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AgenticContentIntakePanel from '@/components/dashboard/AgenticContentIntakePanel';
import { ContentIngestionResult, CourseCatalog, QuizQuestion, QuizWithDetails } from '@/lib/types';
import QuestionModal from '@/components/dashboard/QuestionModal';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { Copy, Edit, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';

const QuizzesManagementPage: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuizQuestion[]>([]);
  const [quizzes, setQuizzes] = useState<QuizWithDetails[]>([]);
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | undefined>(undefined);
  const [error, setError] = useState('');
  const [pendingDeleteQuestionId, setPendingDeleteQuestionId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [questionsRes, quizzesRes, coursesRes] = await Promise.all([
        api.getQuestionsWithDetails(),
        api.getQuizzes().catch(() => ({ data: [] as QuizWithDetails[] })),
        api.getCourseCatalog().catch(() => ({ data: [] as CourseCatalog[] })),
      ]);
      const allQuestions = questionsRes.data;

      setQuestions(allQuestions);
      setQuizzes(quizzesRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
      setError('Unable to load quiz questions right now.');
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = [...questions];
    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredQuestions(filtered);
  };

  const getQuizTitle = (quizId?: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    return quiz ? quiz.title : '-';
  };

  const handleDelete = async (questionId: string) => {
    try {
      await api.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
      setPendingDeleteQuestionId(null);
    } catch (error) {
      console.error('Failed to delete question:', error);
      setError('Unable to delete the selected question right now.');
    }
  };

  const handleDuplicate = async (q: QuizQuestion) => {
    try {
      const copy = { ...q, id: '', question: `${q.question} (Copy)` };
      delete (copy as any).id;
      const created = await api.createQuestion(copy);
      setQuestions([created.data, ...questions]);
    } catch (error) {
      console.error('Failed to duplicate question:', error);
      setError('Unable to duplicate the selected question right now.');
    }
  };

  const handleSave = (savedQuestion: QuizQuestion) => {
    if (editingQuestion) {
      setQuestions(questions.map(q => q.id === savedQuestion.id ? savedQuestion : q));
    } else {
      setQuestions([savedQuestion, ...questions]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedQuestions(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedQuestions.map(id => api.deleteQuestion(id)));
      setQuestions(questions.filter(q => !selectedQuestions.includes(q.id)));
      setSelectedQuestions([]);
      setConfirmBulkDelete(false);
    } catch (error) {
      console.error('Failed to delete selected questions:', error);
      setError('Unable to delete the selected questions right now.');
    }
  };

  const handleBulkDuplicate = async () => {
    try {
      const duplicates = await Promise.all(
        selectedQuestions.map(async id => {
          const q = questions.find(q => q.id === id);
          if (!q) return null;
          const copy = { ...q, id: '', question: `${q.question} (Copy)` };
          delete (copy as any).id;
          return api.createQuestion(copy);
        })
      );
      const newQuestions = duplicates.filter(Boolean).map(r => (r as any).data);
      setQuestions([...newQuestions, ...questions]);
      setSelectedQuestions([]);
    } catch (error) {
      console.error('Failed to duplicate selected questions:', error);
    }
  };

  const handleImportedQuestions = (result: ContentIngestionResult) => {
    if (result.questions.length > 0) {
      loadData();
    }
  };

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quiz Management</h2>
          <p className="text-gray-600">Import quiz files first, then use manual editing only for exceptions.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => { setEditingQuestion(undefined); setModalOpen(true); }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" /> Manual question
          </button>
          <button
            onClick={loadData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <AgenticContentIntakePanel
        title="Upload quiz or question-bank source"
        description="Feed the backend a document or structured JSON and let the intake agent turn it into stored quiz questions. This keeps assessment creation aligned with the new upload-first workflow."
        courses={courses}
        allowedIntents={['quiz', 'question_bank']}
        defaultIntent="quiz"
        onImported={handleImportedQuestions}
      />

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 flex items-center gap-4">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
          <input
            type="checkbox"
            checked={selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0}
            onChange={toggleSelectAll}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <div className="ml-4 grid grid-cols-12 gap-4 flex-1 font-semibold text-gray-900">
            <div className="col-span-8">Question</div>
            <div className="col-span-2">Quiz</div>
            <div className="col-span-2">Actions</div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredQuestions.map(q => (
            <div key={q.id} className="px-6 py-4 hover:bg-gray-50 flex items-center">
              <input
                type="checkbox"
                checked={selectedQuestions.includes(q.id)}
                onChange={() => toggleSelect(q.id)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="ml-4 grid grid-cols-12 gap-4 flex-1 items-center">
                <div className="col-span-8 text-gray-800">{q.question}</div>
                <div className="col-span-2 text-gray-600">{getQuizTitle(q.quizId)}</div>
                <div className="col-span-2 flex items-center space-x-2">
                  <button
                    onClick={() => { setEditingQuestion(q); setModalOpen(true); }}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(q)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                  </button>
                  <button
                    onClick={() => setPendingDeleteQuestionId(q.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 text-gray-500">No questions found</div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedQuestions.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200 flex items-center space-x-4">
          <span className="text-sm text-gray-600">{selectedQuestions.length} questions selected</span>
          <button onClick={handleBulkDuplicate} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Duplicate Selected</button>
          <button onClick={() => setConfirmBulkDelete(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete Selected</button>
        </div>
      )}

      <QuestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingQuestion}
        quizzes={quizzes} // Pass available quizzes for dropdown inside modal
      />

      <ConfirmationDialog
        isOpen={Boolean(pendingDeleteQuestionId)}
        title="Delete question"
        description="This will permanently remove the selected question from the quiz bank."
        confirmLabel="Delete question"
        onCancel={() => setPendingDeleteQuestionId(null)}
        onConfirm={() => {
          if (pendingDeleteQuestionId) {
            void handleDelete(pendingDeleteQuestionId);
          }
        }}
      />

      <ConfirmationDialog
        isOpen={confirmBulkDelete}
        title="Delete selected questions"
        description={`This will permanently remove ${selectedQuestions.length} selected question${selectedQuestions.length === 1 ? '' : 's'} from the quiz bank.`}
        confirmLabel="Delete selected"
        onCancel={() => setConfirmBulkDelete(false)}
        onConfirm={() => {
          void handleBulkDelete();
        }}
      />
    </div>
  );
};

export default QuizzesManagementPage;
