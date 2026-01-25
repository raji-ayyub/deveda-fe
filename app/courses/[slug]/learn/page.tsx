// app/courses/[slug]/learn/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  ArrowLeft, Play, CheckCircle, BookOpen,
  Clock, ChevronRight, ChevronLeft,
  Target, Star, Video, FileText,
  Download, MessageSquare, HelpCircle,
  Bookmark, Share2, Maximize2, Volume2,
  Settings
} from 'lucide-react';

const CourseLearnPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const slug = params.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [userCourse, setUserCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (slug && user) {
      loadCourseData();
    }
  }, [slug, user]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // Get course details
      const courseRes = await api.getCourseBySlug(slug);
      setCourse(courseRes.data);
      
      // Get user progress
      const userCoursesRes = await api.getUserCourses(user!.id);
      const userCourseData = userCoursesRes.data.find(c => c.courseSlug === slug);
      setUserCourse(userCourseData || null);
      
    } catch (error) {
      console.error('Failed to load course:', error);
      router.push(`/courses/${slug}`);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (progress: number) => {
    if (!user || !userCourse) return;

    try {
      const completed = progress >= 100;
      await api.updateCourseProgress(
        user.id,
        slug,
        progress,
        completed
      );
      
      setUserCourse({
        ...userCourse,
        progress,
        completed,
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleLessonComplete = () => {
    if (!course || !userCourse) return;
    
    const totalLessons = course.totalLessons;
    const lessonProgress = 100 / totalLessons;
    const newProgress = Math.min(userCourse.progress + lessonProgress, 100);
    
    updateProgress(newProgress);
    setCurrentLesson(Math.min(currentLesson + 1, totalLessons - 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (!course || !userCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <button
            onClick={() => router.push('/courses')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => router.push(`/courses/${slug}`)}
              className="flex items-center text-gray-300 hover:text-white mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </button>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-white">{course.title}</h1>
              <p className="text-sm text-gray-400">
                Lesson {currentLesson + 1} of {course.totalLessons}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <div className="w-48 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${userCourse.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {userCourse.progress.toFixed(1)}% complete
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-white">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <Maximize2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Course Content</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-1">
                {Array.from({ length: course.totalLessons }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentLesson(index)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                      currentLesson === index
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                        {index < currentLesson ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          Lesson {index + 1}: {['Introduction', 'Basics', 'Advanced Concepts', 'Practice'][index % 4]}
                        </div>
                        <div className="text-sm opacity-75">
                          15 min • {index < currentLesson ? 'Completed' : 'Not started'}
                        </div>
                      </div>
                      {index === currentLesson && (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Resources</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded">
                    <Download className="w-4 h-4 mr-2" />
                    <span>Download Slides (PDF)</span>
                  </button>
                  <button className="w-full flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Exercise Files</span>
                  </button>
                  <button className="w-full flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    <span>Community Discussion</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Video Player */}
            <div className="bg-black rounded-xl overflow-hidden mb-6">
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-300">Lesson {currentLesson + 1} video will play here</p>
                </div>
              </div>
              <div className="bg-gray-800 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Lesson {currentLesson + 1}: Understanding the Basics
                    </h3>
                    <p className="text-gray-400">15 minutes</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="text-gray-400 hover:text-white">
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Next Lesson
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Lesson Content</h2>
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="lg:hidden p-2 text-gray-400 hover:text-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Understanding Key Concepts
                    </h3>
                    
                    <p className="text-gray-300 mb-4">
                      In this lesson, we'll dive deep into the fundamental concepts that form the backbone of this course. Understanding these basics is crucial for your success in more advanced topics.
                    </p>
                    
                    <div className="bg-gray-700 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-white mb-2">Learning Objectives</h4>
                      <ul className="text-gray-300 space-y-1">
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          Understand the core principles
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          Identify common patterns
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          Apply concepts to real-world scenarios
                        </li>
                      </ul>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-white mt-6 mb-3">Detailed Explanation</h4>
                    <p className="text-gray-300 mb-4">
                      Let's start with the basics. The core concept we're discussing today is fundamental to understanding more complex topics. We'll break it down into simple, digestible parts.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h5 className="font-semibold text-white mb-2">Key Term 1</h5>
                        <p className="text-gray-300 text-sm">
                          Definition and explanation of the first key term you need to know.
                        </p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h5 className="font-semibold text-white mb-2">Key Term 2</h5>
                        <p className="text-gray-300 text-sm">
                          Definition and explanation of the second key term you need to know.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-800/50">
                      <div className="flex items-center mb-2">
                        <Target className="w-5 h-5 text-blue-400 mr-2" />
                        <h5 className="font-semibold text-white">Practice Exercise</h5>
                      </div>
                      <p className="text-gray-300 mb-3">
                        Try applying what you've learned to solve this problem:
                      </p>
                      <div className="bg-gray-800 rounded p-3 mb-3">
                        <p className="text-gray-300 font-mono text-sm">
                          // Write your solution here
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        Check Solution
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Navigation */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
                    disabled={currentLesson === 0}
                    className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous Lesson
                  </button>
                  <button
                    onClick={handleLessonComplete}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 flex items-center"
                  >
                    Mark Complete
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </button>
                  <button
                    onClick={() => setCurrentLesson(Math.min(course.totalLessons - 1, currentLesson + 1))}
                    disabled={currentLesson === course.totalLessons - 1}
                    className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    Next Lesson
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  {/* Progress Card */}
                  <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-800/30">
                    <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
                    <div className="text-center mb-4">
                      <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#374151"
                            strokeWidth="10"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${userCourse.progress * 2.83} 283`}
                            transform="rotate(-90 50 50)"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-white">{userCourse.progress.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Completed Lessons</span>
                        <span className="text-white font-medium">
                          {Math.floor((userCourse.progress / 100) * course.totalLessons)}/{course.totalLessons}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Time Spent</span>
                        <span className="text-white font-medium">4h 30m</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Resources */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
                    <div className="space-y-3">
                      <a href="#" className="flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group">
                        <Video className="w-5 h-5 text-blue-400 mr-3" />
                        <div className="flex-1">
                          <div className="text-white font-medium">Video Transcript</div>
                          <div className="text-sm text-gray-400">Downloadable text version</div>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 group-hover:text-white" />
                      </a>
                      <a href="#" className="flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group">
                        <FileText className="w-5 h-5 text-green-400 mr-3" />
                        <div className="flex-1">
                          <div className="text-white font-medium">Practice Exercises</div>
                          <div className="text-sm text-gray-400">10 problems with solutions</div>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 group-hover:text-white" />
                      </a>
                      <a href="#" className="flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group">
                        <HelpCircle className="w-5 h-5 text-yellow-400 mr-3" />
                        <div className="flex-1">
                          <div className="text-white font-medium">Ask Questions</div>
                          <div className="text-sm text-gray-400">Get help from community</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                      </a>
                    </div>
                  </div>
                  
                  {/* Upcoming Quiz */}
                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-6 border border-yellow-800/30">
                    <div className="flex items-center mb-4">
                      <Star className="w-5 h-5 text-yellow-400 mr-3" />
                      <h3 className="text-lg font-semibold text-white">Upcoming Quiz</h3>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Complete the next 2 lessons to unlock the module quiz.
                    </p>
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Available in: 30 minutes</span>
                    </div>
                    <button className="w-full mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium">
                      Prepare for Quiz
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearnPage;