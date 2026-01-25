// // app/page.tsx
// import FeatureCard from '@/components/FeatureCard';
// // import TestimonialCard from '@/components/TestimonialCard';
// import { features, testimonials, steps } from '@/lib/data';

// export default function HomePage() {
//   return (
//     <>
//       {/* Hero Section */}
//       <section className="bg-gradient-to-br from-blue-50 to-emerald-50 py-20 md:py-32">
//         <div className="container mx-auto px-4 text-center">
//           <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark mb-6">
//             Master Coding Through Interactive Learning
//           </h1>
//           <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
//             CodeCraft offers a comprehensive platform to learn, practice, and master programming
//             skills through interactive challenges, quizzes, and real-world projects.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <button className="btn-primary btn-large">Get Started</button>
//             <button className="btn-secondary btn-large">Explore Features</button>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-20 bg-white">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold text-dark mb-4">What We Offer</h2>
//             <p className="text-gray-600 max-w-2xl mx-auto">
//               Our platform is designed to help developers of all levels improve their skills
//               through practical, engaging content.
//             </p>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {features.map((feature, index) => (
//               <FeatureCard key={index} {...feature} />
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* How It Works */}
//       <section className="py-20 bg-light">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold text-dark mb-4">How It Works</h2>
//             <p className="text-gray-600 max-w-2xl mx-auto">
//               Start your coding journey in three simple steps
//             </p>
//           </div>
//           <div className="flex flex-col md:flex-row justify-center gap-8">
//             {steps.map((step, index) => (
//               <div key={index} className="flex-1 text-center">
//                 <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
//                   {index + 1}
//                 </div>
//                 <h3 className="text-2xl font-bold text-dark mb-4">{step.title}</h3>
//                 <p className="text-gray-600">{step.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Testimonials */}
//       <section className="py-20 bg-white">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold text-dark mb-4">What Our Users Say</h2>
//             <p className="text-gray-600 max-w-2xl mx-auto">
//               Join thousands of developers who have improved their skills with CodeCraft
//             </p>
//           </div>
//           {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {testimonials.map((testimonial) => (
//               <TestimonialCard key={testimonial.id} {...testimonial} />
//             ))}
//           </div> */}
//         </div>
//       </section>

//       {/* Call to Action */}
//       <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white text-center">
//         <div className="container mx-auto px-4">
//           <h2 className="text-4xl font-bold mb-6">Start Your Coding Journey Today</h2>
//           <p className="text-xl mb-8 max-w-2xl mx-auto">
//             Join our community of developers and take your skills to the next level with our
//             interactive learning platform.
//           </p>
//           <button className="bg-white text-primary font-bold hover:bg-gray-100 btn-large">
//             Create Free Account
//           </button>
//         </div>
//       </section>
//     </>
//   );
// }





// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  Rocket, BookOpen, Users, Target, Award,
  TrendingUp, ChevronRight, Star, Play,
  Clock, Shield, Zap, Globe, Sparkles,
  ThumbsUp, MessageSquare, ArrowRight,
  BarChart3, CheckCircle, Timer, Trophy,
  Heart, Brain, Code, Palette, Calculator,
  Music, Globe as Earth, Briefcase, Camera,
  Book, Gamepad2, Terminal, Database,
  Server, Lock, Cloud, Wifi, Smartphone,
  HeartHandshake, Lightbulb, GraduationCap,
  Compass, Download, Share2, Eye,
  Search, Filter, Grid, List
} from 'lucide-react';
import { CourseCatalog, UserCourse, QuizAttempt } from '@/lib/types';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [featuredCourses, setFeaturedCourses] = useState<CourseCatalog[]>([]);
  const [popularCourses, setPopularCourses] = useState<CourseCatalog[]>([]);
  const [newCourses, setNewCourses] = useState<CourseCatalog[]>([]);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    completionRate: 0,
    totalHours: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    { id: 'all', name: 'All', icon: Grid, color: 'bg-gradient-to-r from-blue-500 to-purple-500' },
    { id: 'programming', name: 'Programming', icon: Code, color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
    { id: 'design', name: 'Design', icon: Palette, color: 'bg-gradient-to-r from-pink-500 to-rose-500' },
    { id: 'business', name: 'Business', icon: Briefcase, color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
    { id: 'science', name: 'Science', icon: Brain, color: 'bg-gradient-to-r from-purple-500 to-violet-500' },
    { id: 'math', name: 'Mathematics', icon: Calculator, color: 'bg-gradient-to-r from-orange-500 to-red-500' },
    { id: 'music', name: 'Music', icon: Music, color: 'bg-gradient-to-r from-yellow-500 to-amber-500' },
    { id: 'language', name: 'Languages', icon: Globe, color: 'bg-gradient-to-r from-teal-500 to-cyan-500' },
  ];

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load course catalog
      const [catalogRes] = await Promise.all([
        api.getCourseCatalog(),
      ]);

      const allCourses = catalogRes.data;
      
      // Set featured courses (first 6)
      setFeaturedCourses(allCourses.slice(0, 6));
      
      // Set popular courses (next 6)
      setPopularCourses(allCourses.slice(6, 12));
      
      // Set new courses (last 6)
      setNewCourses(allCourses.slice(-6));
      
      // Calculate stats
      setStats({
        totalCourses: allCourses.length,
        totalStudents: 12500,
        completionRate: 78,
        totalHours: 24500,
      });

      // If user is logged in, load their progress
      if (user) {
        try {
          const [userCoursesRes, quizAttemptsRes] = await Promise.all([
            api.getUserCourses(user.id),
            api.getUserQuizAttempts(user.id),
          ]);

          const userCourses = userCoursesRes.data;
          const quizAttempts = quizAttemptsRes.data;

          // Calculate user progress
          const totalCourses = userCourses.length;
          const completedCourses = userCourses.filter(course => course.completed).length;
          const totalProgress = userCourses.reduce((sum, course) => sum + course.progress, 0);
          const avgProgress = totalCourses > 0 ? totalProgress / totalCourses : 0;
          const totalQuizScore = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
          const avgQuizScore = quizAttempts.length > 0 ? totalQuizScore / quizAttempts.length : 0;

          setUserProgress({
            enrolledCourses: totalCourses,
            completedCourses,
            avgProgress,
            avgQuizScore,
            totalTimeSpent: 45, // This would come from backend
            streakDays: 7,
          });

          // Generate recent activity
          const activity = [];
          if (userCourses.length > 0) {
            activity.push({
              id: '1',
              type: 'course',
              action: 'started',
              title: userCourses[0].courseSlug,
              time: '2 hours ago',
              icon: BookOpen,
            });
          }
          if (quizAttempts.length > 0) {
            activity.push({
              id: '2',
              type: 'quiz',
              action: 'completed',
              title: `Quiz: ${quizAttempts[0].quizId}`,
              score: quizAttempts[0].score,
              time: '1 day ago',
              icon: Award,
            });
          }
          setRecentActivity(activity);

        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      }

    } catch (error) {
      console.error('Failed to load home data:', error);
      // Fallback mock data for demo
      setFeaturedCourses(getMockCourses().slice(0, 6));
      setPopularCourses(getMockCourses().slice(6, 12));
      setNewCourses(getMockCourses().slice(-6));
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Programming': 'bg-blue-100 text-blue-800',
      'Mathematics': 'bg-purple-100 text-purple-800',
      'Science': 'bg-green-100 text-green-800',
      'Web Development': 'bg-orange-100 text-orange-800',
      'Data Science': 'bg-pink-100 text-pink-800',
      'Business': 'bg-indigo-100 text-indigo-800',
      'Design': 'bg-teal-100 text-teal-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getFeaturedCourses = () => {
    if (activeCategory === 'All') return featuredCourses;
    return featuredCourses.filter(course => 
      course.category.toLowerCase().includes(activeCategory.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading learning platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 h-[100vh]">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Learn. Grow.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  Succeed.
                </span>
              </h1>
              <p className="mt-6 text-xl text-white/90 max-w-2xl">
                Join thousands of students mastering new skills with our interactive courses, 
                hands-on projects, and expert guidance.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {user ? (
                  <>
                    <button
                      onClick={() => router.push('/courses')}
                      className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      Continue Learning
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                    <button
                      onClick={() => router.push('/profile')}
                      className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all"
                    >
                      View Progress
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => router.push('/register')}
                      className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      Start Learning Free
                      <Rocket className="w-5 h-5 ml-2" />
                    </button>
                    <button
                      onClick={() => router.push('/courses')}
                      className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all"
                    >
                      Browse Courses
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="lg:w-1/2 mt-12 lg:mt-0 lg:pl-12">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-400 rounded-full animate-pulse" />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-pink-400 rounded-full animate-pulse delay-1000" />
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/20 p-6 rounded-xl backdrop-blur-sm">
                      <Users className="w-8 h-8 text-white mb-3" />
                      <div className="text-3xl font-bold text-white">12.5K+</div>
                      <div className="text-white/80 text-sm">Active Learners</div>
                    </div>
                    <div className="bg-white/20 p-6 rounded-xl backdrop-blur-sm">
                      <BookOpen className="w-8 h-8 text-white mb-3" />
                      <div className="text-3xl font-bold text-white">{stats.totalCourses}+</div>
                      <div className="text-white/80 text-sm">Courses</div>
                    </div>
                    <div className="bg-white/20 p-6 rounded-xl backdrop-blur-sm">
                      <Target className="w-8 h-8 text-white mb-3" />
                      <div className="text-3xl font-bold text-white">{stats.completionRate}%</div>
                      <div className="text-white/80 text-sm">Completion Rate</div>
                    </div>
                    <div className="bg-white/20 p-6 rounded-xl backdrop-blur-sm">
                      <Clock className="w-8 h-8 text-white mb-3" />
                      <div className="text-3xl font-bold text-white">24.5K+</div>
                      <div className="text-white/80 text-sm">Learning Hours</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 animate-float"
              style={{
                width: `${Math.random() * 100 + 20}px`,
                height: `${Math.random() * 100 + 20}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* User Progress Dashboard */}
      {user && userProgress && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h2>
                <p className="text-gray-600">Continue your learning journey</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Learning Streak</div>
                  <div className="text-xl font-bold text-orange-600 flex items-center">
                    <Zap className="w-5 h-5 mr-1" />
                    {userProgress.streakDays} days
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-blue-600 font-medium">Enrolled Courses</div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">
                      {userProgress.enrolledCourses}
                    </div>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-400" />
                </div>
                <div className="mt-4">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(userProgress.completedCourses / userProgress.enrolledCourses) * 100 || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-blue-600 mt-1">
                    <span>{userProgress.completedCourses} completed</span>
                    <span>{userProgress.enrolledCourses - userProgress.completedCourses} remaining</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-green-600 font-medium">Average Progress</div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">
                      {userProgress.avgProgress.toFixed(1)}%
                    </div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
                <div className="mt-4">
                  <div className="text-sm text-green-600">
                    {userProgress.avgProgress > 70 ? 'Excellent progress!' : 
                     userProgress.avgProgress > 40 ? 'Good progress!' : 'Keep going!'}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-purple-600 font-medium">Quiz Score</div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">
                      {userProgress.avgQuizScore.toFixed(1)}%
                    </div>
                  </div>
                  <Award className="w-8 h-8 text-purple-400" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(userProgress.avgQuizScore / 20)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-orange-600 font-medium">Time Invested</div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">
                      {userProgress.totalTimeSpent}h
                    </div>
                  </div>
                  <Timer className="w-8 h-8 text-orange-400" />
                </div>
                <div className="mt-4">
                  <div className="text-sm text-orange-600">
                    {userProgress.totalTimeSpent > 40 ? 'Consistent learner!' : 'Start building your habit!'}
                  </div>
                </div>
              </div>
            </div>

            {recentActivity.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white mr-4">
                        <activity.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {activity.action === 'started' ? 'Started' : 'Completed'} {activity.title}
                        </div>
                        <div className="text-sm text-gray-500">{activity.time}</div>
                      </div>
                      {activity.score && (
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          activity.score >= 80 
                            ? 'bg-green-100 text-green-800'
                            : activity.score >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {activity.score}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Explore by Category</h2>
          <p className="text-gray-600 mt-4">Discover courses in your area of interest</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.name)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  activeCategory === category.name
                    ? 'bg-white shadow-lg border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-white hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Courses */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
              <p className="text-gray-600 mt-2">Hand-picked courses to get you started</p>
            </div>
            <button
              onClick={() => router.push('/courses')}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              View all courses
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getFeaturedCourses().map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative">
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">
                          {course.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(course.category)}`}>
                        {course.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{course.duration} min</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span>{course.totalLessons} lessons</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
                          {course.instructor?.charAt(0) || 'I'}
                        </div>
                        <span className="text-sm text-gray-700">
                          {course.instructor || 'Instructor'}
                        </span>
                      </div>
                      <button
                        onClick={() => router.push(`/courses/${course.slug}`)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-600 mt-4">Start learning in just 4 simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl rotate-45" />
                <div className="relative w-full h-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Courses</h3>
              <p className="text-gray-600">
                Explore our extensive catalog of courses across multiple categories
              </p>
            </div>

            <div className="text-center">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl rotate-45" />
                <div className="relative w-full h-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enroll & Learn</h3>
              <p className="text-gray-600">
                Enroll in courses and access interactive lessons and resources
              </p>
            </div>

            <div className="text-center">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl rotate-45" />
                <div className="relative w-full h-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Practice & Apply</h3>
              <p className="text-gray-600">
                Complete exercises and projects to reinforce your learning
              </p>
            </div>

            <div className="text-center">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl rotate-45" />
                <div className="relative w-full h-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                  4
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Certified</h3>
              <p className="text-gray-600">
                Earn certificates to showcase your skills and achievements
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Courses */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Most Popular Courses</h2>
              <p className="text-gray-600 mt-2">Join thousands of learners in these trending courses</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="h-40 bg-gradient-to-r from-blue-400 to-purple-500 relative">
                  {course.thumbnail && (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {course.totalLessons} lessons
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium ml-1">4.8</span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/courses/${course.slug}`)}
                    className="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Explore Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">What Our Students Say</h2>
            <p className="text-white/80 mt-4">Join our community of successful learners</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((testimonial) => (
              <div key={testimonial} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    S{testimonial}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Sarah Johnson</h4>
                    <p className="text-white/70 text-sm">Software Developer</p>
                  </div>
                </div>
                <p className="text-white/90 italic mb-4">
                  "This platform transformed my career. The courses are well-structured and the projects helped me build a portfolio that landed me my dream job."
                </p>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Courses */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">New & Noteworthy</h2>
              <p className="text-gray-600 mt-2">Fresh courses added recently</p>
            </div>
            <button
              onClick={() => router.push('/courses')}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              See all new courses
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newCourses.map((course) => (
              <div
                key={course.id}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition-all duration-300"
              >
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium rounded-full">
                    New
                  </span>
                </div>
                
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-4">
                    {course.title.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center mt-3">
                      <span className={`text-xs px-2 py-1 rounded mr-2 ${getCategoryColor(course.category)}`}>
                        {course.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {course.duration} min
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => router.push(`/courses/${course.slug}`)}
                  className="w-full mt-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all duration-300"
                >
                  Check it out
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Join thousands of students who are transforming their careers with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <button
                  onClick={() => router.push('/courses')}
                  className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Browse Courses
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-medium rounded-xl border-2 border-white/30 hover:bg-white/30 transition-all"
                >
                  View Your Dashboard
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/register')}
                  className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Get Started for Free
                </button>
                <button
                  onClick={() => router.push('/courses')}
                  className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-medium rounded-xl border-2 border-white/30 hover:bg-white/30 transition-all"
                >
                  Browse Courses
                </button>
              </>
            )}
          </div>
          <p className="text-white/70 mt-6 text-sm">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">LearnHub</span>
              </div>
              <p className="text-gray-400">
                Empowering learners worldwide with interactive courses and expert-led instruction.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="/courses" className="text-gray-400 hover:text-white">Courses</a></li>
                <li><a href="/pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="/about" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="/careers" className="text-gray-400 hover:text-white">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="/blog" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="/help" className="text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="/community" className="text-gray-400 hover:text-white">Community</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700">
                  <span className="sr-only">Twitter</span>
                  <div className="w-5 h-5 bg-current" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700">
                  <span className="sr-only">LinkedIn</span>
                  <div className="w-5 h-5 bg-current" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700">
                  <span className="sr-only">GitHub</span>
                  <div className="w-5 h-5 bg-current" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700">
                  <span className="sr-only">YouTube</span>
                  <div className="w-5 h-5 bg-current" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} LearnHub. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float infinite linear;
        }
      `}</style>
    </div>
  );
};

// Mock data for development
const getMockCourses = (): CourseCatalog[] => {
  return [
    {
      id: '1',
      slug: 'intro-python',
      title: 'Introduction to Python Programming',
      description: 'Learn Python from scratch with hands-on projects',
      category: 'Programming',
      difficulty: 'Beginner',
      duration: 240,
      totalQuizzes: 5,
      totalLessons: 12,
      instructor: 'John Smith',
      prerequisites: [],
      tags: ['python', 'programming', 'beginner'],
      thumbnail: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec1?w=400&h=300&fit=crop',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      slug: 'web-dev-bootcamp',
      title: 'Complete Web Development Bootcamp',
      description: 'Master HTML, CSS, JavaScript, and modern frameworks',
      category: 'Web Development',
      difficulty: 'Intermediate',
      duration: 480,
      totalQuizzes: 8,
      totalLessons: 20,
      instructor: 'Sarah Johnson',
      prerequisites: ['basic-programming'],
      tags: ['web', 'javascript', 'react'],
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
      createdAt: '2024-01-20',
    },
    {
      id: '3',
      slug: 'data-science-essentials',
      title: 'Data Science Essentials',
      description: 'Learn data analysis, visualization, and machine learning basics',
      category: 'Data Science',
      difficulty: 'Intermediate',
      duration: 360,
      totalQuizzes: 6,
      totalLessons: 15,
      instructor: 'Dr. Michael Chen',
      prerequisites: ['intro-python', 'basic-math'],
      tags: ['data-science', 'python', 'machine-learning'],
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      createdAt: '2024-01-25',
    },
    {
      id: '4',
      slug: 'ui-ux-design',
      title: 'UI/UX Design Principles',
      description: 'Master user interface and experience design',
      category: 'Design',
      difficulty: 'Beginner',
      duration: 180,
      totalQuizzes: 4,
      totalLessons: 10,
      instructor: 'Emma Wilson',
      prerequisites: [],
      tags: ['design', 'ui', 'ux', 'figma'],
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
      createdAt: '2024-01-30',
    },
    {
      id: '5',
      slug: 'digital-marketing',
      title: 'Digital Marketing Mastery',
      description: 'Learn SEO, social media, and content marketing strategies',
      category: 'Business',
      difficulty: 'Beginner',
      duration: 200,
      totalQuizzes: 5,
      totalLessons: 12,
      instructor: 'Alex Rodriguez',
      prerequisites: [],
      tags: ['marketing', 'seo', 'business'],
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      createdAt: '2024-02-01',
    },
    {
      id: '6',
      slug: 'machine-learning-advanced',
      title: 'Advanced Machine Learning',
      description: 'Deep dive into neural networks and AI algorithms',
      category: 'Data Science',
      difficulty: 'Advanced',
      duration: 500,
      totalQuizzes: 10,
      totalLessons: 25,
      instructor: 'Dr. Lisa Wang',
      prerequisites: ['data-science-essentials', 'advanced-math'],
      tags: ['ai', 'machine-learning', 'deep-learning'],
      thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
      createdAt: '2024-02-05',
    },
  ];
};

export default HomePage;