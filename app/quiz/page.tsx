// app/quiz/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaArrowRight, 
  FaArrowLeft,
  FaRedo,
  FaChartBar,
  FaTrophy,
  FaLightbulb,
  FaClock
} from 'react-icons/fa';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizResult {
  questionId: number;
  selectedAnswer: number | null;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What does HTML stand for?",
    options: [
      "Hyper Trainer Marking Language",
      "Hyper Text Markup Language",
      "Hyper Text Marketing Language",
      "Hyperlink and Text Markup Language"
    ],
    correctAnswer: 1,
    explanation: "HTML stands for Hyper Text Markup Language. It's the standard markup language for creating web pages."
  },
  {
    id: 2,
    question: "Which tag is used to define the largest heading in HTML?",
    options: ["&lt;h6&gt;", "&lt;heading&gt;", "&lt;h1&gt;", "&lt;head&gt;"],
    correctAnswer: 2,
    explanation: "&lt;h1&gt; defines the largest heading. HTML has six heading levels from &lt;h1&gt; (largest) to &lt;h6&gt; (smallest)."
  },
  {
    id: 3,
    question: "Which HTML tag is used to insert a line break?",
    options: ["&lt;break&gt;", "&lt;lb&gt;", "&lt;br&gt;", "&lt;line&gt;"],
    correctAnswer: 2,
    explanation: "&lt;br&gt; inserts a line break. It's a self-closing tag that creates a new line without starting a new paragraph."
  },
  {
    id: 4,
    question: "What does CSS stand for?",
    options: [
      "Color Style Sheets",
      "Cascading Style Sheets",
      "Creative Style System",
      "Computer Styled Sections"
    ],
    correctAnswer: 1,
    explanation: "CSS stands for Cascading Style Sheets. It's used to style and layout web pages."
  },
  {
    id: 5,
    question: "Which CSS property controls the text size?",
    options: ["font-style", "text-size", "font-size", "text-style"],
    correctAnswer: 2,
    explanation: "The font-size property controls the text size in CSS. It can be set using pixels, ems, rems, or percentages."
  },
  {
    id: 6,
    question: "How do you select an element with id 'header' in CSS?",
    options: [".header", "#header", "*header", "header"],
    correctAnswer: 1,
    explanation: "#header selects an element with id='header'. The hash (#) symbol is used for ID selectors in CSS."
  },
  {
    id: 7,
    question: "Which HTML attribute is used to define inline styles?",
    options: ["class", "font", "styles", "style"],
    correctAnswer: 3,
    explanation: "The style attribute is used to define inline styles in HTML. It overrides any external or internal styles."
  },
  {
    id: 8,
    question: "Which property is used to change the background color in CSS?",
    options: ["color", "bgcolor", "background-color", "background"],
    correctAnswer: 2,
    explanation: "background-color is used to change the background color. You can also use the shorthand 'background' property."
  },
  {
    id: 9,
    question: "How do you make a list that lists its items with bullets?",
    options: ["&lt;ol&gt;", "&lt;list&gt;", "&lt;ul&gt;", "&lt;dl&gt;"],
    correctAnswer: 2,
    explanation: "&lt;ul&gt; creates an unordered (bulleted) list. &lt;ol&gt; creates an ordered (numbered) list."
  },
  {
    id: 10,
    question: "What is the correct HTML for creating a hyperlink?",
    options: [
      "&lt;a url='http://example.com'&gt;Example&lt;/a&gt;",
      "&lt;a href='http://example.com'&gt;Example&lt;/a&gt;",
      "&lt;a&gt;http://example.com&lt;/a&gt;",
      "&lt;link&gt;http://example.com&lt;/link&gt;"
    ],
    correctAnswer: 1,
    explanation: "&lt;a href='http://example.com'&gt;Example&lt;/a&gt; creates a hyperlink. The href attribute specifies the link destination."
  }
];

export default function QuizPage() {
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(Array(quizQuestions.length).fill(-1));
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [quizStatus, setQuizStatus] = useState<'idle' | 'active' | 'completed' | 'review'>('idle');
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // 5 minutes in seconds
  const [timeSpentOnQuestion, setTimeSpentOnQuestion] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [quizStats, setQuizStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
    totalTime: 0
  });

  // Start quiz
  const startQuiz = () => {
    setQuizStatus('active');
    setCurrentQuestionIndex(0);
    setSelectedAnswers(Array(quizQuestions.length).fill(-1));
    setQuizResults([]);
    setTimeRemaining(300);
    setTimeSpentOnQuestion(0);
    
    // Start main timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          completeQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start question timer
    questionTimerRef.current = setInterval(() => {
      setTimeSpentOnQuestion(prev => prev + 1);
    }, 1000);
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  // Move to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      // Record time spent on current question
      const currentQuestion = quizQuestions[currentQuestionIndex];
      const isCorrect = selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer;
      
      setQuizResults(prev => [
        ...prev,
        {
          questionId: currentQuestion.id,
          selectedAnswer: selectedAnswers[currentQuestionIndex],
          isCorrect,
          timeSpent: timeSpentOnQuestion
        }
      ]);

      // Reset question timer
      setTimeSpentOnQuestion(0);
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeQuiz();
    }
  };

  // Move to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Complete quiz
  const completeQuiz = () => {
    setQuizStatus('completed');
    
    // Clear timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    
    // Calculate final results
    const results: QuizResult[] = [];
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;
    let totalTime = 0;

    quizQuestions.forEach((question, index) => {
      const selectedAnswer = selectedAnswers[index];
      const isCorrect = selectedAnswer === question.correctAnswer;
      const isSkipped = selectedAnswer === -1;
      
      if (isCorrect) correct++;
      else if (isSkipped) skipped++;
      else incorrect++;

      // For demo, use estimated time (we don't have actual time for all questions)
      const timeSpent = index === currentQuestionIndex ? timeSpentOnQuestion : Math.floor(Math.random() * 30) + 5;
      totalTime += timeSpent;

      results.push({
        questionId: question.id,
        selectedAnswer,
        isCorrect,
        timeSpent
      });
    });

    setQuizResults(results);
    setQuizStats({ correct, incorrect, skipped, totalTime });
  };

  // Restart quiz
  const restartQuiz = () => {
    setQuizStatus('idle');
    setCurrentQuestionIndex(0);
    setSelectedAnswers(Array(quizQuestions.length).fill(-1));
    setQuizResults([]);
    setTimeRemaining(300);
    setTimeSpentOnQuestion(0);
  };

  // Enter review mode
  const enterReviewMode = () => {
    setQuizStatus('review');
    setCurrentQuestionIndex(0);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  // Current question
  const currentQuestion = quizQuestions[currentQuestionIndex];

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, []);

  // Parse HTML entities in options
  const parseHtmlEntities = (text: string) => {
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-dark p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Quiz Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-accent">
            🧠 Coding Quiz Challenge
          </h1>
          <p className="text-gray-300 text-center text-lg max-w-3xl mx-auto">
            Test your web development knowledge with {quizQuestions.length} questions. 
            You have 5 minutes to complete the quiz!
          </p>
        </header>

        {/* Main Quiz Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Progress & Timer */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FaChartBar className="text-accent" /> Quiz Progress
              </h2>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-accent to-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Question Navigation */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {quizQuestions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                      index === currentQuestionIndex
                        ? 'bg-accent text-white scale-110'
                        : selectedAnswers[index] !== -1
                        ? 'bg-secondary text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Timer */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-gray-300">
                    <FaClock className="text-accent" />
                    <span className="font-medium">Time Remaining</span>
                  </div>
                  <div className={`text-2xl font-bold ${
                    timeRemaining < 60 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {formatTime(timeRemaining)}
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
                    style={{ width: `${(timeRemaining / 300) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            {quizStatus === 'active' && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
              >
                <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Answered</span>
                    <span className="text-green-400 font-bold">
                      {selectedAnswers.filter(a => a !== -1).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Remaining</span>
                    <span className="text-yellow-400 font-bold">
                      {selectedAnswers.filter(a => a === -1).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Time/Question</span>
                    <span className="text-blue-400 font-bold">
                      {formatTime(timeSpentOnQuestion)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {quizStatus === 'idle' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center border border-gray-700 shadow-2xl"
              >
                <div className="max-w-2xl mx-auto">
                  <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-r from-accent to-secondary flex items-center justify-center text-6xl">
                    🚀
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Ready to Test Your Skills?
                  </h2>
                  <p className="text-gray-300 text-lg mb-8">
                    This quiz contains {quizQuestions.length} questions covering HTML and CSS fundamentals. 
                    You'll have 5 minutes to complete it. Try to score as high as possible!
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-gray-800/50 p-6 rounded-xl">
                      <div className="text-3xl text-accent mb-2">{quizQuestions.length}</div>
                      <div className="text-gray-300">Questions</div>
                    </div>
                    <div className="bg-gray-800/50 p-6 rounded-xl">
                      <div className="text-3xl text-accent mb-2">5:00</div>
                      <div className="text-gray-300">Time Limit</div>
                    </div>
                    <div className="bg-gray-800/50 p-6 rounded-xl">
                      <div className="text-3xl text-accent mb-2">70%</div>
                      <div className="text-gray-300">Passing Score</div>
                    </div>
                  </div>

                  <button
                    onClick={startQuiz}
                    className="px-10 py-4 bg-gradient-to-r from-accent to-secondary text-white text-xl font-bold rounded-xl hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
                  >
                    Start Quiz Now
                  </button>
                </div>
              </motion.div>
            )}

            {/* Active Quiz */}
            {quizStatus === 'active' && currentQuestion && (
              <motion.div 
                key={currentQuestion.id}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl"
              >
                {/* Question Header */}
                <div className="flex justify-between text-black items-start mb-8">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Question {currentQuestionIndex + 1}</div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                      {currentQuestion.question}
                    </h2>
                  </div>
                  <div className="text-sm text-gray-400 bg-gray-800 px-4 py-2 rounded-lg">
                    Time: {formatTime(timeSpentOnQuestion)}
                  </div>
                </div>

                {/* Answer Options */}
                <div className="space-y-4 mb-10">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === index;
                    const isCorrect = index === currentQuestion.correctAnswer;
                    
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full text-left p-6 rounded-xl transition-all duration-300 border-2 ${
                          isSelected
                            ? 'border-accent bg-accent/10'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            isSelected 
                              ? 'bg-accent text-white' 
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div className="flex-1">
                            <div className="text-lg text-white">
                              {parseHtmlEntities(option)}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="text-accent">
                              <FaCheckCircle className="text-xl" />
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-8 border-t border-gray-700">
                  <button
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      currentQuestionIndex === 0
                        ? 'opacity-50 cursor-not-allowed bg-gray-800 text-gray-500'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    <FaArrowLeft /> Previous
                  </button>

                  <div className="text-gray-400 text-sm">
                    Select an answer to continue
                  </div>

                  <button
                    onClick={goToNextQuestion}
                    disabled={selectedAnswers[currentQuestionIndex] === -1}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                      selectedAnswers[currentQuestionIndex] === -1
                        ? 'opacity-50 cursor-not-allowed bg-gray-800 text-gray-500'
                        : 'bg-gradient-to-r from-accent to-secondary text-white hover:scale-105'
                    }`}
                  >
                    {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    <FaArrowRight />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Results Screen */}
            {quizStatus === 'completed' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl"
              >
                <div className="text-center mb-10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-accent to-secondary flex items-center justify-center text-4xl">
                    <FaTrophy />
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-4">Quiz Completed!</h2>
                  <p className="text-gray-300 text-lg">
                    Great job completing the coding quiz!
                  </p>
                </div>

                {/* Score Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                  <div className="bg-gray-800/50 p-6 rounded-xl text-center border border-green-500/20">
                    <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">{quizStats.correct}</div>
                    <div className="text-gray-300">Correct</div>
                  </div>
                  <div className="bg-gray-800/50 p-6 rounded-xl text-center border border-red-500/20">
                    <div className="text-3xl md:text-4xl font-bold text-red-400 mb-2">{quizStats.incorrect}</div>
                    <div className="text-gray-300">Incorrect</div>
                  </div>
                  <div className="bg-gray-800/50 p-6 rounded-xl text-center border border-yellow-500/20">
                    <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">{quizStats.skipped}</div>
                    <div className="text-gray-300">Skipped</div>
                  </div>
                  <div className="bg-gray-800/50 p-6 rounded-xl text-center border border-blue-500/20">
                    <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
                      {formatTime(quizStats.totalTime)}
                    </div>
                    <div className="text-gray-300">Total Time</div>
                  </div>
                </div>

                {/* Score Circle */}
                <div className="relative w-64 h-64 mx-auto mb-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#374151" 
                      strokeWidth="10"
                    />
                    {/* Progress circle */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="url(#gradient)" 
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(quizStats.correct / quizQuestions.length) * 283} 283`}
                      transform="rotate(-90 50 50)"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold text-white">
                      {Math.round((quizStats.correct / quizQuestions.length) * 100)}%
                    </div>
                    <div className="text-gray-400">Final Score</div>
                  </div>
                </div>

                {/* Performance Message */}
                <div className="text-center mb-10">
                  <div className={`text-2xl font-bold mb-2 ${
                    (quizStats.correct / quizQuestions.length) >= 0.7 
                      ? 'text-green-400' 
                      : 'text-yellow-400'
                  }`}>
                    {quizStats.correct >= 7 ? '🎉 Excellent! ' : '👍 Good Effort! '}
                    {quizStats.correct >= 7 
                      ? 'You have solid web development knowledge!' 
                      : 'Keep practicing to improve your skills!'}
                  </div>
                  <p className="text-gray-300">
                    You answered {quizStats.correct} out of {quizQuestions.length} questions correctly.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={restartQuiz}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-accent to-secondary text-white font-bold rounded-xl hover:scale-105 transition-transform"
                  >
                    <FaRedo /> Try Again
                  </button>
                  <button
                    onClick={enterReviewMode}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors border border-gray-700"
                  >
                    <FaLightbulb /> Review Answers
                  </button>
                </div>
              </motion.div>
            )}

            {/* Review Mode */}
            {quizStatus === 'review' && currentQuestion && (
              <motion.div 
                key={`review-${currentQuestion.id}`}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl"
              >
                {/* Review Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Review Question {currentQuestionIndex + 1}</div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                      {currentQuestion.question}
                    </h2>
                  </div>
                  <div className={`px-4 py-2 rounded-lg font-bold ${
                    quizResults[currentQuestionIndex]?.isCorrect 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {quizResults[currentQuestionIndex]?.isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                </div>

                {/* Answer Options in Review Mode */}
                <div className="space-y-4 mb-10">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = quizResults[currentQuestionIndex]?.selectedAnswer === index;
                    const isCorrectAnswer = index === currentQuestion.correctAnswer;
                    
                    return (
                      <div
                        key={index}
                        className={`w-full p-6 rounded-xl border-2 ${
                          isCorrectAnswer
                            ? 'border-green-500 bg-green-500/10'
                            : isSelected && !isCorrectAnswer
                            ? 'border-red-500 bg-red-500/10'
                            : 'border-gray-700 bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            isCorrectAnswer
                              ? 'bg-green-500 text-white'
                              : isSelected && !isCorrectAnswer
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div className="flex-1">
                            <div className="text-lg text-white">
                              {parseHtmlEntities(option)}
                            </div>
                          </div>
                          <div className="text-xl">
                            {isCorrectAnswer && <FaCheckCircle className="text-green-400" />}
                            {isSelected && !isCorrectAnswer && <FaTimesCircle className="text-red-400" />}
                          </div>
                        </div>
                        {isSelected && !isCorrectAnswer && (
                          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <div className="text-red-400 text-sm font-medium">Your Answer</div>
                          </div>
                        )}
                        {isCorrectAnswer && (
                          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <div className="text-green-400 text-sm font-medium">Correct Answer</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FaLightbulb className="text-yellow-400" /> Explanation
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>

                {/* Review Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                    <div className="text-sm text-gray-400 mb-1">Your Answer</div>
                    <div className={`text-xl font-bold ${
                      quizResults[currentQuestionIndex]?.isCorrect 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {quizResults[currentQuestionIndex]?.selectedAnswer !== undefined 
                        ? String.fromCharCode(65 + quizResults[currentQuestionIndex].selectedAnswer!)
                        : '—'
                      }
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                    <div className="text-sm text-gray-400 mb-1">Correct Answer</div>
                    <div className="text-xl font-bold text-green-400">
                      {String.fromCharCode(65 + currentQuestion.correctAnswer)}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                    <div className="text-sm text-gray-400 mb-1">Time Spent</div>
                    <div className="text-xl font-bold text-blue-400">
                      {formatTime(quizResults[currentQuestionIndex]?.timeSpent || 0)}
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-8 border-t border-gray-700">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    disabled={currentQuestionIndex === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      currentQuestionIndex === 0
                        ? 'opacity-50 cursor-not-allowed bg-gray-800 text-gray-500'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    <FaArrowLeft /> Previous
                  </button>

                  <div className="text-gray-400">
                    {currentQuestionIndex + 1} of {quizQuestions.length}
                  </div>

                  <button
                    onClick={() => {
                      if (currentQuestionIndex === quizQuestions.length - 1) {
                        restartQuiz();
                      } else {
                        setCurrentQuestionIndex(prev => prev + 1);
                      }
                    }}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-accent to-secondary text-white font-bold rounded-xl hover:scale-105 transition-transform"
                  >
                    {currentQuestionIndex === quizQuestions.length - 1 ? 'Restart Quiz' : 'Next Question'}
                    <FaArrowRight />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Quiz Tips */}
        {quizStatus === 'active' && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-8 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              💡 Quick Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  1
                </div>
                <div>
                  <div className="font-medium text-white">Read Carefully</div>
                  <div className="text-sm text-gray-400">Take your time to understand each question</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  2
                </div>
                <div>
                  <div className="font-medium text-white">Time Management</div>
                  <div className="text-sm text-gray-400">Don't spend too long on one question</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  3
                </div>
                <div>
                  <div className="font-medium text-white">Review Answers</div>
                  <div className="text-sm text-gray-400">You can always come back to skipped questions</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}