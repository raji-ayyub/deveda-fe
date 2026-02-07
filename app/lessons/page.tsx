// Main Dashboard Page - Fixed for Next.js
import Link from 'next/link';
import { 
  BookOpen, Code, Brain, GraduationCap, 
  ArrowRight, Zap, Target, Users, 
  Clock, TrendingUp, Award, Shield,
  CheckCircle, Star, Globe, Terminal
} from 'lucide-react';

const LearningDashboard = () => {
  const lessons = [
    {
      id: 1,
      title: "CSS Flexbox",
      description: "Master modern CSS layout with Flexbox",
      icon: <Globe className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      duration: "25 min",
      difficulty: "Beginner",
      completed: false,
      link: "/lessons/flexbox"
    },
    {
      id: 2,
      title: "Async API Basics",
      description: "Learn how to make asynchronous API calls with JavaScript",
      icon: <Code className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500",
      duration: "20 min",
      difficulty: "Beginner",
      completed: false,
      link: "/lessons/async-api"
    },
    {
      id: 3,
      title: "HTML & DOM Manipulation",
      description: "Master DOM manipulation after fetching API data",
      icon: <Brain className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      duration: "30 min",
      difficulty: "Intermediate",
      completed: false,
      link: "/lessons/html-dom"
    },
    {
      id: 4,
      title: "CSS Grid Layout",
      description: "Learn 2D layout system with CSS Grid",
      icon: <Terminal className="w-8 h-8" />,
      color: "from-orange-500 to-red-500",
      duration: "35 min",
      difficulty: "Intermediate",
      completed: false,
      link: "/lessons/css-grid"
    }
  ];

  const progress = {
    completedLessons: 0,
    totalLessons: 4,
    score: 0,
    streak: 1
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Web Development Learning Hub</h1>
                <p className="text-blue-100">Master modern web technologies with interactive lessons</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-blue-200">Learning Streak</div>
                <div className="text-xl font-bold flex items-center">
                  <Zap className="w-5 h-5 mr-1 text-yellow-300" />
                  {progress.streak} day
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-lg font-bold">{progress.score}%</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Interactive Learning!</h2>
              <p className="text-gray-600">Start your journey to master web development with hands-on lessons</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-4 py-2 bg-white rounded-lg border border-gray-200">
                <div className="text-sm text-gray-500">Your Progress</div>
                <div className="text-lg font-bold text-blue-600">
                  {progress.completedLessons}/{progress.totalLessons} Lessons
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Completion Rate</div>
                <div className="text-2xl font-bold text-gray-900">{progress.score}%</div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                  style={{ width: `${progress.score}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Time Available</div>
                <div className="text-2xl font-bold text-gray-900">Flexible</div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Learn at your own pace</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Skill Level</div>
                <div className="text-2xl font-bold text-gray-900">Beginner</div>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                <span>Start from basics</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">First Goal</div>
                <div className="text-2xl font-bold text-gray-900">CSS Flexbox</div>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Shield className="w-4 h-4 text-purple-500 mr-2" />
                <span>Complete 1 lesson</span>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Path */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Learning Path</h2>
            <div className="text-sm text-gray-500">
              Start with any lesson - designed for beginners
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                href={lesson.link}
                className="group relative block"
              >
                <div className={`bg-gradient-to-br ${lesson.color} rounded-2xl p-6 text-white h-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                      {lesson.difficulty}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className={`w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4`}>
                      {lesson.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
                  <p className="text-white/80 text-sm mb-4">{lesson.description}</p>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/20">
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {lesson.duration}
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      Start Lesson
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Connection line between cards */}
                  {index < lessons.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="mb-6 lg:mb-0 lg:mr-8">
              <h2 className="text-2xl font-bold mb-2">Ready to Start?</h2>
              <p className="text-gray-300">Jump into interactive lessons with real code examples</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/lessons/flexbox"
                className="px-6 py-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                Start Learning
              </Link>
              <Link
                href="/quiz/api-knowledge"
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg font-medium hover:bg-white/20 transition-colors text-center"
              >
                Take a Quiz
              </Link>
            </div>
          </div>
        </div>

        {/* Learning Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-bold text-lg mb-2">Interactive Lessons</h3>
            <p className="text-gray-600 text-sm">
              Learn with real code examples you can run and modify right in the browser.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="font-bold text-lg mb-2">Practice Quizzes</h3>
            <p className="text-gray-600 text-sm">
              Test your knowledge with interactive quizzes that adapt to your learning pace.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="font-bold text-lg mb-2">Progress Tracking</h3>
            <p className="text-gray-600 text-sm">
              Track your progress, earn badges, and see how far you've come in your learning journey.
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12 bg-white rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started Guide</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="font-bold text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Choose Your First Lesson</h4>
                <p className="text-gray-600 text-sm">Start with CSS Flexbox for layout fundamentals</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="font-bold text-green-600">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Complete Interactive Exercises</h4>
                <p className="text-gray-600 text-sm">Each lesson includes hands-on coding challenges</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="font-bold text-purple-600">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Test Your Knowledge</h4>
                <p className="text-gray-600 text-sm">Take quizzes to reinforce what you've learned</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Interactive Learning Platform</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>Web Development</span>
              <span>•</span>
              <span>Interactive Learning</span>
              <span>•</span>
              <span>Hands-on Practice</span>
            </div>
            
            <div className="mt-4 md:mt-0 text-sm text-gray-500">
              Start your learning journey today
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LearningDashboard;