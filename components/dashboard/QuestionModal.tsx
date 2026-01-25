'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '@/lib/types';
import { api } from '@/lib/api';
import { X, Save } from 'lucide-react';

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

const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  quizzes = [{id: 1, title:"Agric"}, {id: 2, title:"UI/UX"}, {id: 3, title:"General Coding"}],
}) => {
  const [question, setQuestion] = useState('');
  const [quizId, setQuizId] = useState('');
  const [points, setPoints] = useState(1);
  const [timeLimit, setTimeLimit] = useState(60); // seconds
  const [questionType, setQuestionType] = useState<'single' | 'multiple'>('single');

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question);
      setQuizId(initialData.quizId || '');
      setPoints(initialData.points || 1);
      setTimeLimit((initialData.timeLimit as number) || 60);
      setQuestionType(initialData.questionType as 'single' | 'multiple' || 'single');
    } else {
      setQuestion('');
      setQuizId('');
      setPoints(1);
      setTimeLimit(60);
      setQuestionType('single');
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (!question.trim()) return alert('Question cannot be empty');
    if (!quizId) return alert('Please select a quiz');

    const payload = { question, quizId, points, timeLimit, questionType };

    try {
      let res: any;
      if (initialData) {
        res = await api.updateQuestion(initialData.id, payload);
      } else {
        res = await api.createQuestion(payload);
      }

      const savedQuestion: QuizQuestion = res.data; // unwrap .data
      onSave(savedQuestion);
      onClose();
    } catch (error) {
      console.error('Failed to save question:', error);
      alert('Failed to save question');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {initialData ? 'Edit Question' : 'Add Question'}
          </h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-600" /></button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Quiz Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quiz</label>
            <select
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Quiz --</option>
              <option value={"1"}>{"Agric"}</option>
              {quizzes.map(q => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>
          </div>

          {/* Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
            <input
              type="number"
              value={points}
              min={1}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (seconds)</label>
            <input
              type="number"
              value={timeLimit}
              min={10}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as 'single' | 'multiple')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="single">Single Choice</option>
              <option value="multiple">Multiple Choice</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            {initialData ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
