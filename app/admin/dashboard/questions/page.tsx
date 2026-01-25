// app/dashboard/questions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { QuestionWithDetails } from '@/lib/types';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Download,
  MoreVertical
} from 'lucide-react';

const QuestionsManagementPage: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionWithDetails[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [quizFilter, setQuizFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithDetails | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, quizFilter, difficultyFilter, statusFilter]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.getQuestionsWithDetails();
      setQuestions(response.data);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = [...questions];

    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.quizId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (quizFilter !== 'all') {
      filtered = filtered.filter(question => question.quizId === quizFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(question => 
        question.difficulty === difficultyFilter
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(question => 
        statusFilter === 'active' ? question.isActive : !question.isActive
      );
    }

    setFilteredQuestions(filtered);
  };

  const handleCreateQuestion = async (formData: any) => {
    try {
      const response = await api.createQuestion(formData);
      setQuestions([response.data, ...questions]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create question:', error);
    }
  };

  const handleUpdateQuestion = async (questionId: string, formData: any) => {
    try {
      const response = await api.updateQuestion(questionId, formData);
      setQuestions(questions.map(q => 
        q.id === questionId ? response.data : q
      ));
      setShowEditModal(false);
      setEditingQuestion(null);
    } catch (error) {
      console.error('Failed to update question:', error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await api.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  const handleDuplicateQuestion = (question: QuestionWithDetails) => {
    const { id, ...rest } = question;

    const newQuestion = {
      ...rest,
      question: `${question.question} (Copy)`,
      createdAt: new Date().toISOString(),
    };

    handleCreateQuestion(newQuestion);
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
          <h2 className="text-2xl font-bold text-gray-900">Question Bank</h2>
          <p className="text-gray-600">Manage quiz questions and answers</p>
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
            Add Question
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quiz Filter */}
          <select
            value={quizFilter}
            onChange={(e) => setQuizFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Quizzes</option>
            {Array.from(new Set(questions.map(q => q.quizId))).map(quizId => (
              <option key={quizId} value={quizId}>{quizId}</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={loadQuestions}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuestions.map((question) => (
          <div key={question.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            {/* Question Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {question.question}
                  </h3>
                  <p className="text-sm text-gray-500">{question.quizId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleDuplicateQuestion(question)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Duplicate"
                >
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
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                </button>
              </div>
            </div>

            {/* Question Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {question.questionType}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Difficulty:</span>
                <span className={`px-2 py-1 text-xs rounded ${
                  question.difficulty === 'Easy' 
                    ? 'bg-green-100 text-green-800' 
                    : question.difficulty === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {question.difficulty}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Points:</span>
                <span className="font-medium">{question.points} pts</span>
              </div>
            </div>

            {/* Options */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center p-2 rounded-lg ${
                      option === question.correctAnswer
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                      option === question.correctAnswer
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className={`text-sm ${
                      option === question.correctAnswer ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {question.isActive ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs text-green-700">Active</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-xs text-red-700">Inactive</span>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    Updated: {new Date(question.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <button className="text-blue-600 text-xs font-medium hover:text-blue-700">
                  Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredQuestions.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
          <HelpCircle className="w-16 h-16 text-gray-300 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No questions found</h3>
          <p className="mt-2 text-gray-500">
            {questions.length === 0 
              ? 'Get started by adding your first question.'
              : 'Try adjusting your search or filters.'}
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

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <QuestionModal
          question={editingQuestion}
          onSubmit={editingQuestion ? 
            (data) => handleUpdateQuestion(editingQuestion.id, data) : 
            handleCreateQuestion
          }
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
};

// Modal Component for Create/Edit
const QuestionModal: React.FC<{
  question: QuestionWithDetails | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
}> = ({ question, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    quizId: question?.quizId || '',
    question: question?.question || '',
    options: question?.options || ['', '', '', ''],
    correctAnswer: question?.correctAnswer || '',
    explanation: question?.explanation || '',
    points: question?.points || 1,
    questionType: question?.questionType || 'multiple_choice',
    difficulty: question?.difficulty || 'Easy',
    isActive: question?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({
        ...formData,
        options: [...formData.options, ''],
      });
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        options: newOptions,
        correctAnswer: formData.correctAnswer === formData.options[index] ? '' : formData.correctAnswer,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {question ? 'Edit Question' : 'Create New Question'}
                </h3>
                
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quiz ID
                      </label>
                      <input
                        type="text"
                        value={formData.quizId}
                        onChange={(e) => setFormData({ ...formData, quizId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Difficulty
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Question */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Text
                    </label>
                    <textarea
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      required
                    />
                  </div>

                  {/* Options */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Answer Options
                      </label>
                      <button
                        type="button"
                        onClick={addOption}
                        className="text-sm text-blue-600 hover:text-blue-700"
                        disabled={formData.options.length >= 6}
                      >
                        + Add Option
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-6 h-6 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            required
                          />
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={formData.correctAnswer === option}
                              onChange={() => setFormData({ ...formData, correctAnswer: option })}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-500">Correct</span>
                            {formData.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation & Points */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Explanation (Optional)
                      </label>
                      <textarea
                        value={formData.explanation}
                        onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Points
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active (visible in quizzes)</span>
                    </label>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-base font-medium text-white hover:opacity-90 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            >
              {question ? 'Update Question' : 'Create Question'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionsManagementPage;