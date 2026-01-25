'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { QuizQuestion, CourseCatalog } from '@/lib/types';
import {
  BookOpen,
  Trophy,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

type QuizSummary = {
  quizId: string;
  title: string;
  courseSlug?: string;
  difficulty?: string;
  questionCount: number;
};

const QuizListPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);

      // Fetch all quiz questions
      const questionRes = await api.getAllQuizQuestions();
      const questions: QuizQuestion[] = questionRes.data;

      // Group questions by quizId
      const quizMap: Record<string, QuizQuestion[]> = {};
      questions.forEach(q => {
        if (!quizMap[q.quizId]) quizMap[q.quizId] = [];
        quizMap[q.quizId].push(q);
      });

      // Fetch course catalog
      const catalogRes = await api.getCourseCatalog();
      setCourses(catalogRes.data || []);

      const summaries: QuizSummary[] = Object.entries(quizMap).map(
        ([quizId, qs]) => {
          const courseSlug = quizId.split('_')[0];
          const course = catalogRes.data?.find(
            (c: CourseCatalog) => c.slug === courseSlug
          );

          return {
            quizId,
            title: course ? `${course.title} Quiz` : quizId.replace(/_/g, ' '),
            courseSlug,
            difficulty: course?.difficulty,
            questionCount: qs.length,
          };
        }
      );

      setQuizzes(summaries);
    } catch (err) {
      console.error('Failed to load quizzes', err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">
            No Quizzes Available
          </h2>
          <p className="text-gray-600 mt-2">
            Quizzes will appear here once they are created.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
          <p className="text-gray-600 mt-2">
            Test your knowledge and track your progress
          </p>
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {quizzes.map(quiz => (
            <div
              key={quiz.quizId}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                      quiz.difficulty
                    )}`}
                  >
                    {quiz.difficulty || 'Mixed'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {quiz.title}
                </h3>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {quiz.questionCount} Questions
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    30 Minutes
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push(`/quiz/${quiz.quizId}`)}
                className="mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Start Quiz
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizListPage;
