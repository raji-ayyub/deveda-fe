// app/quiz/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { QuizQuestion, CourseCatalog } from '@/lib/types';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Trophy,
  Send
} from 'lucide-react';

const QuizPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const quizId = params.id as string;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [courseInfo, setCourseInfo] = useState<CourseCatalog | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    passed: boolean;
    correctAnswers: number;
  } | null>(null);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmit();
    }
  }, [timeLeft, showResults]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await api.getQuizQuestions(quizId);
      setQuestions(response.data);
      
      // Try to find course info if quiz is associated with a course
      const courseSlug = quizId.split('_')[0]; // Assuming format: "course_slug_quiz_id"
      const catalogRes = await api.getCourseCatalog({ search: courseSlug });
      if (catalogRes.data.length > 0) {
        setCourseInfo(catalogRes.data[0]);
      }
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    const score = (correct / questions.length) * 100;
    return { score, correctAnswers: correct };
  };

  const handleSubmit = async () => {
    if (questions.length === 0) return;
    
    if (Object.keys(answers).length < questions.length) {
      if (!confirm('You have unanswered questions. Submit anyway?')) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const { score, correctAnswers } = calculateScore();
      const passed = score >= 60;
      
      setQuizResult({
        score,
        passed,
        correctAnswers,
      });

      if (user) {
        // Submit quiz attempt to backend
        await api.submitQuizAttempt(user.id, {
          quizId,
          score: Math.round(score),
          courseSlug: courseInfo?.slug,
        });
      }

      setShowResults(true);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Quiz Not Found</h2>
          <p className="text-gray-600 mt-2">The quiz you're looking for doesn't exist or has no questions yet.</p>
          <button
            onClick={() => router.back()}
            className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (showResults && quizResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-blue-600 mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Courses
          </button>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className={`p-8 text-center ${
              quizResult.passed 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-red-500 to-pink-500'
            } text-white`}>
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                {quizResult.passed ? (
                  <CheckCircle className="w-12 h-12" />
                ) : (
                  <XCircle className="w-12 h-12" />
                )}
              </div>
              <h1 className="text-3xl font-bold mt-6">
                {quizResult.passed ? 'Congratulations!' : 'Keep Learning!'}
              </h1>
              <p className="mt-2 opacity-90">
                {quizResult.passed 
                  ? 'You have successfully passed the quiz!'
                  : 'You need more practice to pass this quiz.'
                }
              </p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {quizResult.score.toFixed(1)}%
                  </div>
                  <p className="text-gray-600 mt-2">Final Score</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-green-600">
                    {quizResult.correctAnswers}/{questions.length}
                  </div>
                  <p className="text-gray-600 mt-2">Correct Answers</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-purple-600">
                    {quizResult.passed ? 'PASSED' : 'FAILED'}
                  </div>
                  <p className="text-gray-600 mt-2">Result</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Review</h3>
                <div className="space-y-6">
                  {questions.map((question, index) => {
                    const userAnswer = answers[question.id];
                    const isCorrect = userAnswer === question.correctAnswer;
                    
                    return (
                      <div key={question.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                              {index + 1}
                            </span>
                            <h4 className="font-medium text-gray-900">{question.question}</h4>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isCorrect 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isCorrect ? '+1 Point' : '0 Points'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                          {question.options.map((option, idx) => {
                            let bgClass = 'bg-gray-50 hover:bg-gray-100';
                            let textClass = 'text-gray-700';
                            
                            if (option === question.correctAnswer) {
                              bgClass = 'bg-green-50 border-green-200';
                              textClass = 'text-green-800';
                            } else if (option === userAnswer && !isCorrect) {
                              bgClass = 'bg-red-50 border-red-200';
                              textClass = 'text-red-800';
                            }
                            
                            return (
                              <div
                                key={idx}
                                className={`border rounded-lg p-4 transition-colors ${bgClass}`}
                              >
                                <div className="flex items-center">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                                    option === question.correctAnswer
                                      ? 'bg-green-500 text-white'
                                      : option === userAnswer && !isCorrect
                                      ? 'bg-red-500 text-white'
                                      : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {String.fromCharCode(65 + idx)}
                                  </span>
                                  <span className={textClass}>{option}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {question.explanation && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => router.push('/courses')}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Explore More Courses
                </button>
                <button
                  onClick={() => router.push(`/quiz/${quizId}`)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-red-500" />
                <span className="font-mono font-bold text-lg text-gray-900">
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <span className="font-medium">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              
              <div className="hidden md:block">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {courseInfo?.difficulty || 'Mixed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Question */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Question Header */}
              <div className="mb-8">
                {courseInfo && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{courseInfo.title} - Quiz</h2>
                      <p className="text-gray-600">Test your knowledge</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      getDifficultyColor(currentQuestionData?.difficulty || 'Beginner')
                    }`}>
                      {currentQuestionData?.difficulty || 'Beginner'}
                    </span> */}
                    <span className="text-sm text-gray-500">
                      Points: {currentQuestionData?.points || 1}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Multiple Choice
                  </span>
                </div>
              </div>

              {/* Question */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {currentQuestionData?.question}
                </h3>
                
                <div className="space-y-4">
                  {currentQuestionData?.options.map((option, index) => {
                    const isSelected = answers[currentQuestionData.id] === option;
                    const letter = String.fromCharCode(65 + index);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(currentQuestionData.id, option)}
                        className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <span className="font-bold">{letter}</span>
                          </div>
                          <span className={`text-lg ${
                            isSelected ? 'text-blue-700' : 'text-gray-700'
                          }`}>
                            {option}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-4">
                  {currentQuestion < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestion(currentQuestion + 1)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 inline mr-2" />
                          Submit Quiz
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Progress & Instructions */}
          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Progress</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Answered</span>
                    <span>{Object.keys(answers).length}/{questions.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Current Score</span>
                    <span>{calculateScore().score.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${calculateScore().score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Question List */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${
                      currentQuestion === index
                        ? 'bg-blue-500 text-white'
                        : answers[questions[index].id]
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
                  <span>Unanswered</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Quiz Instructions</h3>
              <ul className="space-y-3 text-sm opacity-90">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Each question has only one correct answer
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  You need 60% to pass the quiz
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Quiz will auto-submit when time runs out
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Passing quizzes increases course progress
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;