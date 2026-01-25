'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { QuizQuestion } from '@/lib/types';
import QuestionModal from '@/components/dashboard/QuestionModal';
import { Copy, Edit, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';

// Define a simple Quiz type derived from questions
interface Quiz {
  id: string;
  title: string;
}

const QuizzesManagementPage: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuizQuestion[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm]);

  // Load all questions and derive quizzes from quizId
  const loadData = async () => {
    try {
      setLoading(true);
      const questionsRes = await api.getAllQuizQuestions();
      const allQuestions = questionsRes.data;

      setQuestions(allQuestions);

      // Derive unique quizzes from questions
      const uniqueQuizzes = Array.from(
        new Map(allQuestions.map(q => [q.quizId, { id: q.quizId, title: `Quiz ${q.quizId}` }])).values()
      );
      setQuizzes(uniqueQuizzes);
    } catch (error) {
      console.error('Failed to load questions:', error);
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
    if (!confirm('Delete this question?')) return;
    try {
      await api.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (error) {
      console.error('Failed to delete question:', error);
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
    if (!confirm('Delete selected questions?')) return;
    try {
      await Promise.all(selectedQuestions.map(id => api.deleteQuestion(id)));
      setQuestions(questions.filter(q => !selectedQuestions.includes(q.id)));
      setSelectedQuestions([]);
    } catch (error) {
      console.error('Failed to delete selected questions:', error);
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
          <p className="text-gray-600">Manage quiz questions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => { setEditingQuestion(undefined); setModalOpen(true); }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Question
          </button>
          <button
            onClick={loadData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </button>
        </div>
      </div>

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
                    onClick={() => handleDelete(q.id)}
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
          <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete Selected</button>
        </div>
      )}

      <QuestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingQuestion}
        quizzes={quizzes} // Pass available quizzes for dropdown inside modal
      />
    </div>
  );
};

export default QuizzesManagementPage;
