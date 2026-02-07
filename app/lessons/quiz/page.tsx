'use client'
import { useState, useEffect, useRef } from 'react';
import {
  Brain, Trophy, Star, Clock, RefreshCw, CheckCircle,
  XCircle, HelpCircle, Code, AlertCircle, ChevronRight,
  BookOpen, Zap, Target, BarChart3, Home, Award,
  Send, Copy, SkipForward, Volume2, VolumeX
} from 'lucide-react';

type QuestionType = 'multiple-choice' | 'true-false' | 'code-blank';

interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  code?: string;
  blank?: { correct: string; options: string[] };
}

interface QuizResult {
  score: number;
  correct: number;
  total: number;
  timeSpent: number;
  answers: UserAnswer[];
}

interface UserAnswer {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

const QuizPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [hintUsed, setHintUsed] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout>();

  const allQuestions: Question[] = [
    // Multiple Choice Questions about Async/API basics
    {
      id: 1,
      type: 'multiple-choice',
      question: "What does the 'async' keyword do in JavaScript?",
      options: [
        "Makes a function return a Promise",
        "Makes code run faster",
        "Creates a new thread",
        "Stops other code from running"
      ],
      correctAnswer: "Makes a function return a Promise",
      explanation: "The async keyword makes a function return a Promise and allows it to use the await keyword to handle asynchronous operations.",
      difficulty: 'medium',
      category: 'Async/Await'
    },
    {
      id: 2,
      type: 'multiple-choice',
      question: "What does the fetch() function return?",
      options: [
        "A Promise",
        "JSON data",
        "An HTML response",
        "A string"
      ],
      correctAnswer: "A Promise",
      explanation: "fetch() returns a Promise that resolves to the Response object representing the response to the request.",
      difficulty: 'medium',
      category: 'Fetch API'
    },
    {
      id: 3,
      type: 'multiple-choice',
      question: "Which method converts the fetch response to JSON?",
      options: [
        "response.json()",
        "response.text()",
        "JSON.parse()",
        "convertToJSON()"
      ],
      correctAnswer: "response.json()",
      explanation: "The response.json() method parses the response body as JSON and returns a Promise.",
      difficulty: 'easy',
      category: 'Fetch API'
    },
    {
      id: 4,
      type: 'multiple-choice',
      question: "What is the purpose of the 'await' keyword?",
      options: [
        "Pauses execution until Promise resolves",
        "Makes a function async",
        "Handles errors",
        "Speeds up API calls"
      ],
      correctAnswer: "Pauses execution until Promise resolves",
      explanation: "await pauses the execution of an async function until the Promise is settled, then returns the resolved value.",
      difficulty: 'medium',
      category: 'Async/Await'
    },
    {
      id: 5,
      type: 'multiple-choice',
      question: "What does this code do: document.getElementById('weather')?",
      options: [
        "Finds an element with ID 'weather'",
        "Creates a new element",
        "Changes the weather data",
        "Gets weather from an API"
      ],
      correctAnswer: "Finds an element with ID 'weather'",
      explanation: "getElementById() selects a DOM element by its ID attribute, allowing you to manipulate it with JavaScript.",
      difficulty: 'easy',
      category: 'DOM Manipulation'
    },

    // True/False Questions
    {
      id: 6,
      type: 'true-false',
      question: "API calls in JavaScript are synchronous by default.",
      options: ["True", "False"],
      correctAnswer: "False",
      explanation: "API calls are typically asynchronous in JavaScript to prevent blocking the main thread.",
      difficulty: 'easy',
      category: 'API Basics'
    },
    {
      id: 7,
      type: 'true-false',
      question: "The fetch() function automatically parses JSON responses.",
      options: ["True", "False"],
      correctAnswer: "False",
      explanation: "fetch() returns a raw Response object. You need to call .json() to parse JSON data.",
      difficulty: 'easy',
      category: 'Fetch API'
    },
    {
      id: 8,
      type: 'true-false',
      question: "await can be used outside of async functions.",
      options: ["True", "False"],
      correctAnswer: "False",
      explanation: "await can only be used inside functions declared with the async keyword.",
      difficulty: 'medium',
      category: 'Async/Await'
    },

    // Code Fill-in-the-blank Questions
    {
      id: 9,
      type: 'code-blank',
      question: "Complete the weather API fetch function:",
      code: `async function getWeather() {
  const response = await fetch(
    "https://api.openweathermap.org/data/2.5/weather?q=London&units=metric&appid=YOUR_API_KEY"
  );
  
  const data = await response.______();
  
  document.getElementById("temperature").innerText = 
    "Temperature: " + data.main.temp + "°C";
}`,
      blank: {
        correct: "json",
        options: ["json", "text", "html", "parse"]
      },
      correctAnswer: "json",
      explanation: "The response.json() method parses the response body as JSON, which is needed to access the weather data.",
      difficulty: 'medium',
      category: 'Fetch API'
    },
    {
      id: 10,
      type: 'code-blank',
      question: "Complete the function to handle API errors:",
      code: `async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log(data);
  } ______ (error) {
    console.error('Error fetching data:', error);
  }
}`,
      blank: {
        correct: "catch",
        options: ["catch", "try", "finally", "error"]
      },
      correctAnswer: "catch",
      explanation: "The catch block handles any errors that occur in the try block, such as network failures or invalid responses.",
      difficulty: 'medium',
      category: 'Error Handling'
    },
    {
      id: 11,
      type: 'code-blank',
      question: "Complete the DOM update after fetching data:",
      code: `async function updateWeather() {
  const data = await fetchWeatherData();
  
  document.______('temperature-display').innerText = 
    \`\${data.temperature}°C in \${data.city}\`;
}`,
      blank: {
        correct: "getElementById",
        options: ["getElementById", "querySelector", "getElementsByClassName", "findElement"]
      },
      correctAnswer: "getElementById",
      explanation: "getElementById finds an element by its ID, which is the standard way to select a specific DOM element.",
      difficulty: 'easy',
      category: 'DOM Manipulation'
    },
    {
      id: 12,
      type: 'code-blank',
      question: "Complete the basic async function structure:",
      code: `______ function fetchFromAPI(url) {
  const response = await fetch(url);
  return response.json();
}`,
      blank: {
        correct: "async",
        options: ["async", "function", "await", "return"]
      },
      correctAnswer: "async",
      explanation: "The async keyword is required before function to use await inside it for asynchronous operations.",
      difficulty: 'easy',
      category: 'Async/Await'
    },

    // More multiple choice questions
    {
      id: 13,
      type: 'multiple-choice',
      question: "What is the purpose of try...catch in async functions?",
      options: [
        "Handle errors gracefully",
        "Make code run faster",
        "Convert sync to async",
        "Prevent API calls"
      ],
      correctAnswer: "Handle errors gracefully",
      explanation: "try...catch allows you to handle errors without crashing the entire application.",
      difficulty: 'medium',
      category: 'Error Handling'
    },
    {
      id: 14,
      type: 'multiple-choice',
      question: "What does innerText do?",
      options: [
        "Sets or gets text content of an element",
        "Changes element color",
        "Hides an element",
        "Adds HTML tags"
      ],
      correctAnswer: "Sets or gets text content of an element",
      explanation: "innerText gets or sets the text content of an element, ignoring any HTML tags.",
      difficulty: 'easy',
      category: 'DOM Manipulation'
    },
    {
      id: 15,
      type: 'multiple-choice',
      question: "Why do we use async/await instead of .then()?",
      options: [
        "Makes asynchronous code look synchronous",
        "It's faster",
        "Works with all browsers",
        "No reason, they're the same"
      ],
      correctAnswer: "Makes asynchronous code look synchronous",
      explanation: "async/await makes asynchronous code easier to read and write by making it look like synchronous code.",
      difficulty: 'medium',
      category: 'Async/Await'
    },
    {
      id: 16,
      type: 'multiple-choice',
      question: "What happens if you don't use await with fetch()?",
      options: [
        "Gets a Promise instead of data",
        "Code crashes",
        "Nothing happens",
        "Gets HTML instead of JSON"
      ],
      correctAnswer: "Gets a Promise instead of data",
      explanation: "Without await, fetch() returns a Promise object immediately, not the actual response data.",
      difficulty: 'medium',
      category: 'Fetch API'
    },
    {
      id: 17,
      type: 'multiple-choice',
      question: "What does this URL part do: '?q=London&units=metric'?",
      options: [
        "Adds query parameters to API request",
        "Encrypts the request",
        "Changes HTTP method",
        "Adds authentication"
      ],
      correctAnswer: "Adds query parameters to API request",
      explanation: "Query parameters (after ?) specify additional options like city name and measurement units.",
      difficulty: 'easy',
      category: 'API Basics'
    },
    {
      id: 18,
      type: 'multiple-choice',
      question: "What is the correct order for fetching and displaying data?",
      options: [
        "Fetch → Parse → Update DOM",
        "Update DOM → Fetch → Parse",
        "Parse → Fetch → Update DOM",
        "Fetch → Update DOM → Parse"
      ],
      correctAnswer: "Fetch → Parse → Update DOM",
      explanation: "First fetch data, then parse it (like with .json()), then update the DOM with the parsed data.",
      difficulty: 'easy',
      category: 'Workflow'
    },
    {
      id: 19,
      type: 'multiple-choice',
      question: "What happens when you await a Promise?",
      options: [
        "Code waits for Promise to resolve",
        "Promise is cancelled",
        "Error is thrown",
        "Nothing, await does nothing"
      ],
      correctAnswer: "Code waits for Promise to resolve",
      explanation: "await pauses execution until the Promise settles, then continues with the resolved value.",
      difficulty: 'medium',
      category: 'Async/Await'
    },
    {
      id: 20,
      type: 'multiple-choice',
      question: "Why update DOM after API call completes?",
      options: [
        "To show fresh data to users",
        "To make page load faster",
        "To hide the API call",
        "To prevent errors"
      ],
      correctAnswer: "To show fresh data to users",
      explanation: "Updating the DOM displays the new data from the API so users can see current information.",
      difficulty: 'easy',
      category: 'DOM Manipulation'
    }
  ];

  const shuffleQuestions = () => {
    const shuffled = [...allQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 20)
      .map((q, i) => ({ ...q, id: i + 1 }));
    setQuestions(shuffled);
  };

  const startQuiz = () => {
    shuffleQuestions();
    setQuizStarted(true);
    setQuizCompleted(false);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setSelectedOption('');
    setTimeRemaining(300);
    setQuizResults(null);
    setHintUsed(false);
    setCurrentHint('');
    setShowExplanation(false);

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          completeQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;
    let userAnswer = '';

    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') {
      userAnswer = selectedOption;
      isCorrect = selectedOption === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'code-blank') {
      userAnswer = selectedOption;
      isCorrect = selectedOption === currentQuestion.correctAnswer;
    }

    const answer: UserAnswer = {
      questionId: currentQuestion.id,
      userAnswer,
      isCorrect,
      timeSpent: 300 - timeRemaining
    };

    setUserAnswers(prev => [...prev, answer]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption('');
      setHintUsed(false);
      setCurrentHint('');
      setShowExplanation(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const score = Math.round((correctCount / questions.length) * 100);
    
    const results: QuizResult = {
      score,
      correct: correctCount,
      total: questions.length,
      timeSpent: 300 - timeRemaining,
      answers: userAnswers
    };

    setQuizResults(results);
    setQuizCompleted(true);

    if (audioEnabled) {
      const audio = new Audio('/quiz-complete.mp3');
      audio.play().catch(() => {});
    }
  };

  const skipQuestion = () => {
    const answer: UserAnswer = {
      questionId: questions[currentQuestionIndex].id,
      userAnswer: 'skipped',
      isCorrect: false,
      timeSpent: 300 - timeRemaining
    };

    setUserAnswers(prev => [...prev, answer]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption('');
      setHintUsed(false);
      setCurrentHint('');
      setShowExplanation(false);
    } else {
      completeQuiz();
    }
  };

  const getHint = () => {
    const question = questions[currentQuestionIndex];
    let hint = '';
    
    if (question.type === 'multiple-choice') {
      const correctIndex = question.options?.indexOf(question.correctAnswer as string) ?? -1;
      hint = `The correct answer is option ${String.fromCharCode(65 + correctIndex)}.`;
    } else if (question.type === 'true-false') {
      hint = `The answer is ${question.correctAnswer}.`;
    } else if (question.type === 'code-blank') {
      hint = `The missing code is related to ${question.explanation.split(' ').slice(0, 3).join(' ')}...`;
    }
    
    setCurrentHint(hint);
    setHintUsed(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryStats = () => {
    const stats: {[key: string]: { total: number, correct: number }} = {};
    
    userAnswers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (question) {
        if (!stats[question.category]) {
          stats[question.category] = { total: 0, correct: 0 };
        }
        stats[question.category].total++;
        if (answer.isCorrect) {
          stats[question.category].correct++;
        }
      }
    });
    
    return stats;
  };

  const getDifficultyStats = () => {
    const stats = { easy: { total: 0, correct: 0 }, medium: { total: 0, correct: 0 }, hard: { total: 0, correct: 0 } };
    
    userAnswers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (question) {
        stats[question.difficulty].total++;
        if (answer.isCorrect) {
          stats[question.difficulty].correct++;
        }
      }
    });
    
    return stats;
  };

  const getBadge = (score: number) => {
    if (score >= 90) return { name: 'API Master', color: 'from-yellow-500 to-orange-500', icon: <Trophy className="w-6 h-6" /> };
    if (score >= 75) return { name: 'API Expert', color: 'from-purple-500 to-pink-500', icon: <Award className="w-6 h-6" /> };
    if (score >= 60) return { name: 'API Learner', color: 'from-blue-500 to-cyan-500', icon: <Star className="w-6 h-6" /> };
    return { name: 'API Beginner', color: 'from-gray-500 to-gray-700', icon: <BookOpen className="w-6 h-6" /> };
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="bg-gradient-to-r from-purple-900 to-blue-900 border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Async API Quiz</h1>
                <p className="text-purple-200 text-sm">Test your understanding of async JavaScript, fetch API, and DOM updates</p>
              </div>
            </div>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!quizStarted ? (
          // Start Screen
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 mb-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Async API Challenge</h2>
                <p className="text-gray-300 text-lg mb-8">
                  Test your understanding with 20 questions about async JavaScript, fetch API, and DOM manipulation
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">5 Minute Timer</h3>
                  <p className="text-gray-400 text-sm">Complete all questions before time runs out!</p>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">20 Questions</h3>
                  <p className="text-gray-400 text-sm">Multiple choice, true/false, and code completion</p>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Earn Badges</h3>
                  <p className="text-gray-400 text-sm">Get ranked based on your performance with unique badges</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-800 mb-8">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Quiz Rules
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Answer all 20 questions within 5 minutes</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>All questions use consistent button-based options</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>You can use hints, but they affect your final score</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Questions shuffle each time you restart</span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <button
                  onClick={startQuiz}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 text-white rounded-xl font-bold text-lg flex items-center justify-center space-x-3 mx-auto transition-all"
                >
                  <span>Start Quiz Challenge</span>
                </button>
                <p className="text-gray-400 mt-4 text-sm">Press Start when you're ready to begin!</p>
              </div>
            </div>
          </div>
        ) : !quizCompleted ? (
          // Quiz in Progress
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar with Stats */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 sticky top-8">
                {/* Timer */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium">Time Remaining</span>
                    </div>
                    <span className={`text-lg font-bold ${
                      timeRemaining < 60 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        timeRemaining < 60 ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(timeRemaining / 300) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium">Progress</span>
                    </div>
                    <span className="text-sm font-medium">
                      {currentQuestionIndex + 1} / {questions.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question Navigation */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Questions</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, index) => (
                      <button
                        key={q.id}
                        onClick={() => {
                          if (index <= currentQuestionIndex) {
                            setCurrentQuestionIndex(index);
                            setSelectedOption('');
                            setHintUsed(false);
                            setCurrentHint('');
                            setShowExplanation(false);
                          }
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                          index === currentQuestionIndex
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                            : index < currentQuestionIndex
                            ? userAnswers[index]?.isCorrect
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                {currentQuestion && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Current Question</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Category:</span>
                        <span className="text-sm font-medium">{currentQuestion.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Difficulty:</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded ${
                          currentQuestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                          currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {currentQuestion.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Type:</span>
                        <span className="text-sm font-medium capitalize">
                          {currentQuestion.type.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-3">
                  <button
                    onClick={getHint}
                    disabled={hintUsed}
                    className="w-full py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 hover:opacity-90 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 transition-opacity"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>{hintUsed ? 'Hint Used' : 'Get Hint'}</span>
                  </button>
                  <button
                    onClick={skipQuestion}
                    className="w-full py-2.5 bg-gradient-to-r from-gray-700 to-gray-800 hover:bg-gray-700 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                  >
                    <SkipForward className="w-4 h-4" />
                    <span>Skip Question</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Question Area */}
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-8 mb-8">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold">Question {currentQuestionIndex + 1}</h2>
                    <p className="text-gray-400">Select the correct option</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentQuestion?.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                      currentQuestion?.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {currentQuestion?.difficulty}
                    </div>
                    <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                      {currentQuestion?.category}
                    </div>
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-6">{currentQuestion?.question}</h3>

                  {/* Code Block for Code Questions */}
                  {currentQuestion?.type === 'code-blank' && currentQuestion.code && (
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 mb-6">
                      <div className="flex space-x-2 mb-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                      </div>
                      <pre className="font-mono text-sm overflow-x-auto">
                        <code className="text-gray-300">
                          {currentQuestion.code.split('______').map((part, index) => (
                            <span key={index}>
                              <span>{part}</span>
                              {index < currentQuestion.code!.split('______').length - 1 && (
                                <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded mx-1">
                                  {selectedOption || '______'}
                                </span>
                              )}
                            </span>
                          ))}
                        </code>
                      </pre>
                    </div>
                  )}

                  {/* Options */}
                  {currentQuestion?.type === 'multiple-choice' && (
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedOption(option)}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${
                            selectedOption === option
                              ? 'bg-blue-500/20 border-blue-500'
                              : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              selectedOption === option
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-700 text-gray-400'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span>{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* True/False Options */}
                  {currentQuestion?.type === 'true-false' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setSelectedOption('True')}
                        className={`p-6 rounded-xl border transition-all ${
                          selectedOption === 'True'
                            ? 'bg-green-500/20 border-green-500'
                            : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-3">
                          <CheckCircle className="w-6 h-6 text-green-400" />
                          <span className="text-lg font-medium">True</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedOption('False')}
                        className={`p-6 rounded-xl border transition-all ${
                          selectedOption === 'False'
                            ? 'bg-red-500/20 border-red-500'
                            : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-3">
                          <XCircle className="w-6 h-6 text-red-400" />
                          <span className="text-lg font-medium">False</span>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Code Blank Options */}
                  {currentQuestion?.type === 'code-blank' && currentQuestion.blank && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-300 mb-3">
                        Select the missing code:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentQuestion.blank.options.map((option, optionIndex) => (
                          <button
                            key={optionIndex}
                            onClick={() => setSelectedOption(option)}
                            className={`p-3 rounded-lg border text-sm ${
                              selectedOption === option
                                ? 'bg-blue-500/20 border-blue-500'
                                : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                            }`}
                          >
                            <code className="font-mono">{option}</code>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hint Display */}
                {currentHint && (
                  <div className="mb-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/20 rounded-xl p-4 border border-yellow-800">
                    <div className="flex items-center space-x-2 text-yellow-300 mb-2">
                      <HelpCircle className="w-5 h-5" />
                      <span className="font-medium">Hint</span>
                    </div>
                    <p className="text-yellow-200/80">{currentHint}</p>
                  </div>
                )}

                {/* Explanation Toggle */}
                {showExplanation && (
                  <div className="mb-6 bg-gradient-to-r from-blue-900/30 to-cyan-900/20 rounded-xl p-4 border border-blue-800">
                    <div className="flex items-center space-x-2 text-blue-300 mb-2">
                      <BookOpen className="w-5 h-5" />
                      <span className="font-medium">Explanation</span>
                    </div>
                    <p className="text-blue-200/80">{currentQuestion?.explanation}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{showExplanation ? 'Hide Explanation' : 'Show Explanation'}</span>
                  </button>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={skipQuestion}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                    >
                      <SkipForward className="w-4 h-4" />
                      <span>Skip</span>
                    </button>
                    <button
                      onClick={handleAnswer}
                      disabled={!selectedOption}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 rounded-lg font-bold flex items-center space-x-2 disabled:opacity-50 transition-opacity"
                    >
                      <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Results Screen
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 mb-8">
              {/* Results Header */}
              <div className="text-center mb-12">
                <div className={`w-32 h-32 bg-gradient-to-r ${getBadge(quizResults!.score).color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  {getBadge(quizResults!.score).icon}
                </div>
                <h2 className="text-4xl font-bold mb-4">Quiz Complete!</h2>
                <p className="text-gray-300 text-lg">
                  You earned the <span className="font-bold">{getBadge(quizResults!.score).name}</span> badge
                </p>
              </div>

              {/* Score Card */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-6 border border-blue-800">
                  <div className="text-4xl font-bold text-blue-400 mb-2">{quizResults!.score}%</div>
                  <div className="text-sm text-blue-300">Final Score</div>
                </div>
                <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl p-6 border border-green-800">
                  <div className="text-4xl font-bold text-green-400 mb-2">{quizResults!.correct}</div>
                  <div className="text-sm text-green-300">Correct Answers</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-xl p-6 border border-yellow-800">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">{formatTime(quizResults!.timeSpent)}</div>
                  <div className="text-sm text-yellow-300">Time Taken</div>
                </div>
                <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl p-6 border border-purple-800">
                  <div className="text-4xl font-bold text-purple-400 mb-2">
                    {Math.round((quizResults!.correct / quizResults!.timeSpent) * 60)}/min
                  </div>
                  <div className="text-sm text-purple-300">Questions per Minute</div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Category Performance */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="font-semibold text-lg mb-6 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                    Performance by Category
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(getCategoryStats()).map(([category, stats]) => (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{category}</span>
                          <span className="text-sm">{stats.correct}/{stats.total}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty Performance */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="font-semibold text-lg mb-6 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-400" />
                    Performance by Difficulty
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(getDifficultyStats()).map(([difficulty, stats]) => (
                      <div key={difficulty}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{difficulty}</span>
                          <span className="text-sm">{stats.correct}/{stats.total}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              difficulty === 'easy' ? 'bg-green-500' :
                              difficulty === 'medium' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Answers */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
                <h3 className="font-semibold text-lg mb-6 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-yellow-400" />
                  Review Your Answers
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {userAnswers.map((answer, index) => {
                    const question = questions.find(q => q.id === answer.questionId);
                    return (
                      <div 
                        key={answer.questionId}
                        className={`p-4 rounded-lg border ${
                          answer.isCorrect
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              answer.isCorrect
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                            }`}>
                              {answer.isCorrect ? '✓' : '✗'}
                            </div>
                            <span className="font-medium">Question {index + 1}</span>
                          </div>
                          <span className="text-sm text-gray-400">{question?.category}</span>
                        </div>
                        <div className="text-sm mb-2">{question?.question}</div>
                        {question?.type === 'code-blank' && question.code && (
                          <div className="bg-gray-900 rounded p-3 mb-2 font-mono text-xs">
                            <code className="text-gray-300">
                              {question?.type === 'code-blank' && question.code && (
                                <div className="bg-gray-900 rounded p-3 mb-2 font-mono text-xs">
                                    <code className="text-gray-300">
                                     {question?.type === 'code-blank' && question.code && (
                                        <div className="bg-gray-900 rounded p-3 mb-2 font-mono text-xs">
                                            <code className="text-gray-300">
                                            {question.code.split('______').map((part, i, arr) => (
                                                <span key={i}>
                                                {part}
                                                {i < arr.length - 1 && (
                                                    <span className={`px-1 ${answer.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                    {answer.userAnswer || '______'}
                                                    </span>
                                                )}
                                                </span>
                                            ))}
                                            </code>
                                        </div>
                                        )}
                                    </code>
                                </div>
                                )}
                            </code>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Your answer:</span>{' '}
                            <span className={answer.isCorrect ? 'text-green-400' : 'text-red-400'}>
                              {answer.userAnswer || 'No answer'}
                            </span>
                          </div>
                          {!answer.isCorrect && (
                            <div>
                              <span className="text-gray-400">Correct answer:</span>{' '}
                              <span className="text-green-400">
                                {Array.isArray(question?.correctAnswer) 
                                  ? question?.correctAnswer.join(', ')
                                  : question?.correctAnswer}
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            const q = questions.find(q => q.id === answer.questionId);
                            setCurrentHint(q?.explanation || '');
                            setShowExplanation(true);
                          }}
                          className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                        >
                          View explanation
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <button
                  onClick={startQuiz}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 rounded-xl font-bold flex items-center space-x-2 transition-opacity"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Restart Quiz</span>
                </button>
                <button
                  onClick={() => {
                    const resultsText = `I scored ${quizResults!.score}% on the Async API Quiz! 🎯\nCorrect: ${quizResults!.correct}/${quizResults!.total}\nTime: ${formatTime(quizResults!.timeSpent)}\nBadge: ${getBadge(quizResults!.score).name}`;
                    navigator.clipboard.writeText(resultsText);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 rounded-xl font-bold flex items-center space-x-2 transition-opacity"
                >
                  <Copy className="w-5 h-5" />
                  <span>Copy Results</span>
                </button>
                <button
                  onClick={() => {
                    setQuizStarted(false);
                    setQuizCompleted(false);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-xl font-bold flex items-center space-x-2 transition-opacity"
                >
                  <Home className="w-5 h-5" />
                  <span>Back to Home</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;