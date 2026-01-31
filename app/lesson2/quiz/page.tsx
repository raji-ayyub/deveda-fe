'use client'

import { useState, useEffect, useRef } from 'react';
import {
  Brain, Trophy, Star, Clock, RefreshCw, CheckCircle,
  XCircle, HelpCircle, Code, AlertCircle, ChevronRight,
  BookOpen, Zap, Target, BarChart3, Home, Award,
  Send, Copy, SkipForward, Volume2, VolumeX
} from 'lucide-react';

type QuestionType = 'multiple-choice' | 'true-false' | 'code-blank' | 'short-answer';

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
  blanks?: { position: number; correct: string; options: string[] }[];
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
  const [fillInBlanks, setFillInBlanks] = useState<{[key: number]: string}>({});
  const [hintUsed, setHintUsed] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout>();

  const allQuestions: Question[] = [
    // Multiple Choice Questions
    {
      id: 1,
      type: 'multiple-choice',
      question: "What does API stand for?",
      options: [
        "Application Programming Interface",
        "Advanced Programming Interface",
        "Application Protocol Interface",
        "Automated Programming Interface"
      ],
      correctAnswer: "Application Programming Interface",
      explanation: "API stands for Application Programming Interface. It's a set of rules that allows programs to talk to each other.",
      difficulty: 'easy',
      category: 'API Basics'
    },
    {
      id: 2,
      type: 'multiple-choice',
      question: "Which HTTP method is used to retrieve data from an API?",
      options: ["POST", "GET", "PUT", "DELETE"],
      correctAnswer: "GET",
      explanation: "The GET method is used to retrieve data from a server. POST is for creating, PUT for updating, and DELETE for removing data.",
      difficulty: 'easy',
      category: 'API Basics'
    },
    {
      id: 3,
      type: 'multiple-choice',
      question: "What does the 'async' keyword do in JavaScript?",
      options: [
        "Makes a function synchronous",
        "Allows a function to use await",
        "Speeds up the function execution",
        "Makes the function private"
      ],
      correctAnswer: "Allows a function to use await",
      explanation: "The async keyword makes a function return a Promise and allows it to use the await keyword to handle asynchronous operations.",
      difficulty: 'medium',
      category: 'Async/Await'
    },
    {
      id: 4,
      type: 'multiple-choice',
      question: "What is JSON?",
      options: [
        "JavaScript Object Notation",
        "JavaScript Online Network",
        "Java Source Object Notation",
        "JavaScript Object Network"
      ],
      correctAnswer: "JavaScript Object Notation",
      explanation: "JSON stands for JavaScript Object Notation. It's a lightweight data format that's easy for humans to read and write, and easy for machines to parse.",
      difficulty: 'easy',
      category: 'Data Formats'
    },
    {
      id: 5,
      type: 'multiple-choice',
      question: "Which method converts a JSON string to a JavaScript object?",
      options: [
        "JSON.parse()",
        "JSON.stringify()",
        "JSON.convert()",
        "JSON.toObject()"
      ],
      correctAnswer: "JSON.parse()",
      explanation: "JSON.parse() converts a JSON string into a JavaScript object. JSON.stringify() does the opposite.",
      difficulty: 'easy',
      category: 'Data Formats'
    },
    {
      id: 6,
      type: 'multiple-choice',
      question: "What does the fetch() function return?",
      options: [
        "A string",
        "A Promise",
        "An array",
        "A boolean"
      ],
      correctAnswer: "A Promise",
      explanation: "fetch() returns a Promise that resolves to the Response object representing the response to the request.",
      difficulty: 'medium',
      category: 'Fetch API'
    },
    {
      id: 7,
      type: 'multiple-choice',
      question: "Which of these is NOT a valid HTTP status code?",
      options: ["200", "404", "500", "999"],
      correctAnswer: "999",
      explanation: "HTTP status codes are standardized. 200 (OK), 404 (Not Found), and 500 (Internal Server Error) are valid. 999 is not a standard HTTP status code.",
      difficulty: 'medium',
      category: 'HTTP Basics'
    },
    {
      id: 8,
      type: 'multiple-choice',
      question: "What is CORS?",
      options: [
        "Cross-Origin Resource Sharing",
        "Cross-Origin Request Security",
        "Cross-Object Resource Sharing",
        "Cross-Origin Response Security"
      ],
      correctAnswer: "Cross-Origin Resource Sharing",
      explanation: "CORS (Cross-Origin Resource Sharing) is a security feature that allows or restricts resources on a web page to be requested from another domain.",
      difficulty: 'hard',
      category: 'Security'
    },
    {
      id: 9,
      type: 'multiple-choice',
      question: "Which of these is used to handle errors in async/await?",
      options: [
        "try...catch",
        "if...else",
        "switch",
        "for...of"
      ],
      correctAnswer: "try...catch",
      explanation: "try...catch blocks are used to handle errors in async/await functions. This allows you to catch and handle any errors that occur during the async operation.",
      difficulty: 'medium',
      category: 'Error Handling'
    },
    {
      id: 10,
      type: 'multiple-choice',
      question: "What does .then() do in a Promise chain?",
      options: [
        "Handles successful promise resolution",
        "Handles promise rejection",
        "Starts a new promise",
        "Cancels the promise"
      ],
      correctAnswer: "Handles successful promise resolution",
      explanation: ".then() is called when a Promise is fulfilled (resolved successfully). .catch() handles rejections.",
      difficulty: 'medium',
      category: 'Promises'
    },

    // True/False Questions
    {
      id: 11,
      type: 'true-false',
      question: "API calls are always synchronous.",
      options: ["True", "False"],
      correctAnswer: "False",
      explanation: "API calls are typically asynchronous, meaning your code continues executing while waiting for the response.",
      difficulty: 'easy',
      category: 'API Basics'
    },
    {
      id: 12,
      type: 'true-false',
      question: "The fetch() function can only be used with GET requests.",
      options: ["True", "False"],
      correctAnswer: "False",
      explanation: "fetch() can be used with various HTTP methods including GET, POST, PUT, DELETE, etc., by passing an options object.",
      difficulty: 'easy',
      category: 'Fetch API'
    },
    {
      id: 13,
      type: 'true-false',
      question: "JSON keys must be in double quotes.",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "In JSON, all keys must be strings enclosed in double quotes, unlike JavaScript objects.",
      difficulty: 'medium',
      category: 'Data Formats'
    },
    {
      id: 14,
      type: 'true-false',
      question: "await can only be used inside async functions.",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "The await keyword can only be used inside functions declared with the async keyword.",
      difficulty: 'medium',
      category: 'Async/Await'
    },
    {
      id: 15,
      type: 'true-false',
      question: "All APIs require authentication.",
      options: ["True", "False"],
      correctAnswer: "False",
      explanation: "While many APIs require authentication (like API keys), there are also public APIs that don't require any authentication.",
      difficulty: 'easy',
      category: 'API Basics'
    },

    // Code Fill-in-the-blank Questions
    {
      id: 16,
      type: 'code-blank',
      question: "Complete the fetch function to get data from an API:",
      code: `async function getData() {
  const response = await fetch('______');
  const data = await response.______();
  return data;
}`,
      blanks: [
        { 
          position: 1, 
          correct: "'https://api.example.com/data'",
          options: ["'https://api.example.com/data'", "'http://api.example.com'", "'api.example.com'", "'example.com/api'"]
        },
        { 
          position: 2, 
          correct: "json",
          options: ["json", "text", "html", "xml"]
        }
      ],
      correctAnswer: ["'https://api.example.com/data'", "json"],
      explanation: "The fetch() function needs a URL string as its first parameter. The response.json() method parses the response as JSON.",
      difficulty: 'easy',
      category: 'Fetch API'
    },
    {
      id: 17,
      type: 'code-blank',
      question: "Complete the error handling for an async function:",
      code: `async function fetchData() {
  ______ {
    const response = await fetch('...');
    const data = await response.json();
    console.log(data);
  } ______ (error) {
    console.error('Error:', ______);
  }
}`,
      blanks: [
        { 
          position: 1, 
          correct: "try",
          options: ["try", "catch", "finally", "error"]
        },
        { 
          position: 2, 
          correct: "catch",
          options: ["catch", "try", "finally", "if"]
        },
        { 
          position: 3, 
          correct: "error",
          options: ["error", "err", "e", "exception"]
        }
      ],
      correctAnswer: ["try", "catch", "error"],
      explanation: "try...catch blocks are essential for handling errors in async functions. The catch block receives the error object.",
      difficulty: 'medium',
      category: 'Error Handling'
    },
    {
      id: 18,
      type: 'code-blank',
      question: "Complete the Promise chain:",
      code: `fetch('https://api.example.com/data')
  .then(response => response.______())
  .then(data => {
    console.log(data);
    document.getElementById('result').______ = data.message;
  })
  .______(error => console.error('Failed:', error));`,
      blanks: [
        { 
          position: 1, 
          correct: "json",
          options: ["json", "text", "blob", "arrayBuffer"]
        },
        { 
          position: 2, 
          correct: "innerText",
          options: ["innerText", "innerHTML", "textContent", "value"]
        },
        { 
          position: 3, 
          correct: "catch",
          options: ["catch", "then", "finally", "error"]
        }
      ],
      correctAnswer: ["json", "innerText", "catch"],
      explanation: "response.json() parses JSON, innerText sets element text, and catch() handles errors in promise chains.",
      difficulty: 'medium',
      category: 'Promises'
    },
    {
      id: 19,
      type: 'code-blank',
      question: "Complete the function to update DOM with API data:",
      code: `function displayWeather(data) {
  const tempElement = document.______('temperature');
  tempElement.______ = \`\${data.main.temp}°C\`;
  
  const descElement = document.querySelector('______');
  descElement.textContent = data.weather[0].description;
}`,
      blanks: [
        { 
          position: 1, 
          correct: "getElementById",
          options: ["getElementById", "querySelector", "getElementsByClassName", "getElementByTagName"]
        },
        { 
          position: 2, 
          correct: "innerText",
          options: ["innerText", "innerHTML", "value", "text"]
        },
        { 
          position: 3, 
          correct: ".weather-desc",
          options: [".weather-desc", "#weather", ".description", "weather"]
        }
      ],
      correctAnswer: ["getElementById", "innerText", ".weather-desc"],
      explanation: "getElementById finds elements by ID, innerText sets text content, and querySelector uses CSS selectors.",
      difficulty: 'medium',
      category: 'DOM Manipulation'
    },
    {
      id: 20,
      type: 'code-blank',
      question: "Complete the API call with query parameters:",
      code: `async function getWeather(city) {
  const apiKey = 'your_api_key';
  const url = \`https://api.openweathermap.org/data/2.5/weather?______=\${city}&______=metric&______=\${apiKey}\`;
  
  const response = await fetch(url);
  return await response.json();
}`,
      blanks: [
        { 
          position: 1, 
          correct: "q",
          options: ["q", "city", "location", "name"]
        },
        { 
          position: 2, 
          correct: "units",
          options: ["units", "system", "temp", "measurement"]
        },
        { 
          position: 3, 
          correct: "appid",
          options: ["appid", "key", "apiKey", "token"]
        }
      ],
      correctAnswer: ["q", "units", "appid"],
      explanation: "Common OpenWeatherMap parameters: q for city, units for measurement system, appid for API key.",
      difficulty: 'hard',
      category: 'API Usage'
    },

    // Short Answer Questions (converted to multiple choice for consistency)
    {
      id: 21,
      type: 'multiple-choice',
      question: "What does the 'await' keyword do in JavaScript?",
      options: [
        "Pauses execution until promise resolves",
        "Makes code run faster",
        "Creates a new thread",
        "Cancels the current operation"
      ],
      correctAnswer: "Pauses execution until promise resolves",
      explanation: "The await keyword pauses the execution of an async function until a Promise is settled (resolved or rejected), then resumes execution and returns the resolved value.",
      difficulty: 'medium',
      category: 'Async/Await'
    },
    {
      id: 22,
      type: 'multiple-choice',
      question: "Which two methods can be used to select DOM elements in JavaScript?",
      options: [
        "getElementById and querySelector",
        "getElementByClass and findElement",
        "selectElement and findById",
        "getDOMElement and queryElement"
      ],
      correctAnswer: "getElementById and querySelector",
      explanation: "getElementById selects by ID, querySelector uses CSS selectors. Other methods include getElementsByClassName and querySelectorAll.",
      difficulty: 'easy',
      category: 'DOM Manipulation'
    },
    {
      id: 23,
      type: 'multiple-choice',
      question: "What does HTTP stand for?",
      options: [
        "HyperText Transfer Protocol",
        "High Traffic Transfer Protocol",
        "Hyper Transfer Text Protocol",
        "Hyperlink Transfer Protocol"
      ],
      correctAnswer: "HyperText Transfer Protocol",
      explanation: "HTTP is the protocol used for transferring hypertext requests and information on the web.",
      difficulty: 'easy',
      category: 'HTTP Basics'
    },
    {
      id: 24,
      type: 'multiple-choice',
      question: "What is the main difference between innerText and textContent?",
      options: [
        "innerText is aware of styling, textContent is not",
        "textContent is faster than innerText",
        "innerText works with HTML tags, textContent doesn't",
        "textContent is deprecated, innerText is modern"
      ],
      correctAnswer: "innerText is aware of styling, textContent is not",
      explanation: "innerText is aware of CSS styling and won't return hidden text, while textContent returns all text regardless of styling.",
      difficulty: 'hard',
      category: 'DOM Manipulation'
    },
    {
      id: 25,
      type: 'multiple-choice',
      question: "What is an API endpoint?",
      options: [
        "A specific URL where API can be accessed",
        "A type of API authentication",
        "The final result of an API call",
        "A programming language for APIs"
      ],
      correctAnswer: "A specific URL where API can be accessed",
      explanation: "An API endpoint is a specific URL where an API can be accessed to perform certain operations or retrieve specific resources.",
      difficulty: 'medium',
      category: 'API Basics'
    },

    // More Questions...
    {
      id: 26,
      type: 'multiple-choice',
      question: "Which status code indicates 'Created'?",
      options: ["200", "201", "404", "500"],
      correctAnswer: "201",
      explanation: "HTTP status code 201 indicates that a request was successful and a resource was created as a result.",
      difficulty: 'medium',
      category: 'HTTP Basics'
    },
    {
      id: 27,
      type: 'true-false',
      question: "All browsers automatically handle CORS errors.",
      options: ["True", "False"],
      correctAnswer: "False",
      explanation: "Browsers enforce CORS policies and will block requests that violate them unless the server includes proper CORS headers.",
      difficulty: 'hard',
      category: 'Security'
    },
    {
      id: 28,
      type: 'code-blank',
      question: "Complete the function to handle loading state:",
      code: `async function loadData() {
  const loader = document.getElementById('loader');
  loader.style.display = '______';
  
  try {
    const data = await fetchData();
    displayData(data);
  } finally {
    loader.style.display = '______';
  }
}`,
      blanks: [
        { 
          position: 1, 
          correct: "'block'",
          options: ["'block'", "'visible'", "'show'", "'flex'"]
        },
        { 
          position: 2, 
          correct: "'none'",
          options: ["'none'", "'hidden'", "'invisible'", "'hide'"]
        }
      ],
      correctAnswer: ["'block'", "'none'"],
      explanation: "Show loader before fetch, hide it after (in finally block to ensure it runs regardless of success/error).",
      difficulty: 'medium',
      category: 'UI/UX'
    },
    {
      id: 29,
      type: 'multiple-choice',
      question: "What is the main purpose of an API key?",
      options: [
        "Authentication and rate limiting",
        "Encrypting API responses",
        "Making API calls faster",
        "Converting JSON to XML"
      ],
      correctAnswer: "Authentication and rate limiting",
      explanation: "API keys identify the requester for authentication, authorization, and rate limiting purposes.",
      difficulty: 'medium',
      category: 'Security'
    },
    {
      id: 30,
      type: 'multiple-choice',
      question: "Which method would you use to update existing data via API?",
      options: ["GET", "POST", "PUT", "DELETE"],
      correctAnswer: "PUT",
      explanation: "PUT is used to update existing resources. POST creates new resources, GET retrieves, DELETE removes.",
      difficulty: 'medium',
      category: 'HTTP Methods'
    },
    {
      id: 31,
      type: 'true-false',
      question: "fetch() automatically throws an error for HTTP error status codes.",
      options: ["True", "False"],
      correctAnswer: "False",
      explanation: "fetch() only rejects on network failure. HTTP error status codes (404, 500, etc.) don't cause automatic rejection.",
      difficulty: 'hard',
      category: 'Fetch API'
    },
    {
      id: 32,
      type: 'code-blank',
      question: "Complete the POST request with JSON data:",
      code: `async function createUser(userData) {
  const response = await fetch('/api/users', {
    method: '______',
    headers: {
      'Content-Type': '______'
    },
    body: JSON.______(userData)
  });
  return response.json();
}`,
      blanks: [
        { 
          position: 1, 
          correct: "POST",
          options: ["POST", "GET", "PUT", "DELETE"]
        },
        { 
          position: 2, 
          correct: "'application/json'",
          options: ["'application/json'", "'text/html'", "'application/xml'", "'text/plain'"]
        },
        { 
          position: 3, 
          correct: "stringify",
          options: ["stringify", "parse", "encode", "convert"]
        }
      ],
      correctAnswer: ["POST", "'application/json'", "stringify"],
      explanation: "POST method for creation, Content-Type header specifies JSON format, JSON.stringify converts object to string.",
      difficulty: 'hard',
      category: 'Fetch API'
    },
    {
      id: 33,
      type: 'multiple-choice',
      question: "What is rate limiting in APIs?",
      options: [
        "Restricting number of requests per time period",
        "Limiting the size of API responses",
        "Slowing down API response times",
        "Limiting API access to specific countries"
      ],
      correctAnswer: "Restricting number of requests per time period",
      explanation: "Rate limiting controls how many requests a client can make to an API in a given time period to prevent abuse.",
      difficulty: 'medium',
      category: 'API Basics'
    },
    {
      id: 34,
      type: 'multiple-choice',
      question: "What does this code do: 'data?.user?.name'?",
      options: [
        "Uses optional chaining to safely access nested properties",
        "Always returns the user name",
        "Throws an error if user doesn't exist",
        "Checks if data is an array"
      ],
      correctAnswer: "Uses optional chaining to safely access nested properties",
      explanation: "Optional chaining (?.) allows you to safely access deeply nested properties without checking each level.",
      difficulty: 'medium',
      category: 'JavaScript'
    },
    {
      id: 35,
      type: 'true-false',
      question: "You can use await at the top level of a module.",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "In modern JavaScript modules, you can use top-level await without wrapping it in an async function.",
      difficulty: 'hard',
      category: 'Async/Await'
    },
    {
      id: 36,
      type: 'code-blank',
      question: "Complete the function to cache API responses:",
      code: `const cache = {};

async function getCachedData(url) {
  if (cache[url]) {
    return ______[url];
  }
  
  const response = await fetch(url);
  const data = await response.json();
  cache[url] = ______;
  return data;
}`,
      blanks: [
        { 
          position: 1, 
          correct: "cache",
          options: ["cache", "data", "response", "result"]
        },
        { 
          position: 2, 
          correct: "data",
          options: ["data", "cache", "response", "json"]
        }
      ],
      correctAnswer: ["cache", "data"],
      explanation: "Check cache first, return cached data if exists. Otherwise fetch, store in cache, then return.",
      difficulty: 'hard',
      category: 'Performance'
    },
    {
      id: 37,
      type: 'multiple-choice',
      question: "What is the purpose of the 'finally' block in try/catch?",
      options: [
        "Runs regardless of success or error",
        "Only runs if there's an error",
        "Only runs if there's no error",
        "Replaces the catch block"
      ],
      correctAnswer: "Runs regardless of success or error",
      explanation: "The finally block executes after try and catch blocks, regardless of whether an exception was thrown or caught.",
      difficulty: 'medium',
      category: 'Error Handling'
    },
    {
      id: 38,
      type: 'multiple-choice',
      question: "Which tool would you use to test API endpoints?",
      options: ["Postman", "Photoshop", "Excel", "Word"],
      correctAnswer: "Postman",
      explanation: "Postman is a popular API testing tool that allows you to send requests and inspect responses.",
      difficulty: 'easy',
      category: 'Tools'
    },
    {
      id: 39,
      type: 'true-false',
      question: "JSON can contain functions as values.",
      options: ["True", "False"],
      correctAnswer: "False",
      explanation: "JSON is a data format that only supports strings, numbers, objects, arrays, booleans, and null. Functions are not valid JSON.",
      difficulty: 'medium',
      category: 'Data Formats'
    },
    {
      id: 40,
      type: 'code-blank',
      question: "Complete the function to handle multiple concurrent API calls:",
      code: `async function fetchAllData(urls) {
  const promises = urls.map(url => ______(url));
  const results = await Promise.______(promises);
  return results;
}`,
      blanks: [
        { 
          position: 1, 
          correct: "fetch",
          options: ["fetch", "get", "request", "call"]
        },
        { 
          position: 2, 
          correct: "all",
          options: ["all", "race", "any", "settled"]
        }
      ],
      correctAnswer: ["fetch", "all"],
      explanation: "Create array of fetch promises, then use Promise.all to wait for all to complete concurrently.",
      difficulty: 'hard',
      category: 'Performance'
    }
  ];

  const shuffleQuestions = () => {
    const shuffled = [...allQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 40)
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
    setFillInBlanks({});
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
      const blankAnswers = currentQuestion.blanks?.map(blank => fillInBlanks[blank.position] || '').filter(Boolean);
      userAnswer = blankAnswers?.join(', ') || '';
      const correctAnswers = Array.isArray(currentQuestion.correctAnswer) 
        ? currentQuestion.correctAnswer 
        : [currentQuestion.correctAnswer];
      isCorrect = blankAnswers?.length === correctAnswers.length && 
                  blankAnswers?.every((ans, i) => ans === correctAnswers[i]);
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
      setFillInBlanks({});
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
      setFillInBlanks({});
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
      const randomBlank = question.blanks?.[Math.floor(Math.random() * (question.blanks?.length || 1))];
      hint = randomBlank ? `One of the blanks should be: "${randomBlank.correct}"` : 'Look at the context around the blanks.';
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
                <h1 className="text-2xl font-bold">API Knowledge Quiz</h1>
                <p className="text-purple-200 text-sm">Test your understanding of APIs, async JavaScript, and DOM manipulation</p>
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
                <h2 className="text-3xl font-bold mb-4">API Knowledge Challenge</h2>
                <p className="text-gray-300 text-lg mb-8">
                  Test your understanding with 40 questions covering APIs, async JavaScript, DOM manipulation, and more!
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
                  <h3 className="font-semibold mb-2">40 Questions</h3>
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
                    <span>Answer all 40 questions within 5 minutes</span>
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
                            setFillInBlanks({});
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
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 mb-6 font-mono text-sm">
                      {currentQuestion.code.split('______').map((part, index) => (
                        <span key={index}>
                          <span className="text-gray-300">{part}</span>
                          {index < currentQuestion.code!.split('______').length - 1 && (
                            <span className="inline-block mx-1">
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                {fillInBlanks[index] || '______'}
                              </span>
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Options for Multiple Choice */}
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
                  {currentQuestion?.type === 'code-blank' && currentQuestion.blanks && (
                    <div className="space-y-6">
                      {currentQuestion.blanks.map((blank, blankIndex) => (
                        <div key={blank.position} className="space-y-3">
                          <div className="text-sm font-medium text-gray-300">
                            Select option for blank #{blankIndex + 1}:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {blank.options.map((option, optionIndex) => (
                              <button
                                key={optionIndex}
                                onClick={() => setFillInBlanks(prev => ({
                                  ...prev,
                                  [blank.position]: option
                                }))}
                                className={`p-3 rounded-lg border text-sm ${
                                  fillInBlanks[blank.position] === option
                                    ? 'bg-blue-500/20 border-blue-500'
                                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                                }`}
                              >
                                <code className="font-mono">{option}</code>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
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
                      disabled={
                        (currentQuestion?.type === 'multiple-choice' || currentQuestion?.type === 'true-false') && !selectedOption ||
                        (currentQuestion?.type === 'code-blank' && 
                          currentQuestion.blanks?.some(blank => !fillInBlanks[blank.position]))
                      }
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
                    const resultsText = `I scored ${quizResults!.score}% on the API Knowledge Quiz! 🎯\nCorrect: ${quizResults!.correct}/${quizResults!.total}\nTime: ${formatTime(quizResults!.timeSpent)}\nBadge: ${getBadge(quizResults!.score).name}`;
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