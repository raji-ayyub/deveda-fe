// app/courses/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  Search, Filter, Clock, Users, BookOpen, 
  Star, TrendingUp, ArrowRight, CheckCircle,
  Award, BarChart3, Loader2, AlertCircle
} from 'lucide-react';
import { CourseCatalog, UserCourse } from '@/lib/types';
import { useRouter } from 'next/navigation';

const CoursesPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<string>('popular');
  
  // Stats
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnrolled: 0,
    completionRate: 0,
    averageRating: 0,
  });

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [catalogRes, userCoursesRes] = await Promise.all([
        api.getCourseCatalog(),
        api.getUserCourses(user.id),
      ]);

      const allCourses = catalogRes.data;
      const userEnrollments = userCoursesRes.data;
      
      setCourses(allCourses);
      setUserCourses(userEnrollments);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(allCourses.map(course => course.category))
      ).filter(Boolean);
      setCategories(['All', ...uniqueCategories]);
      
      // Calculate stats
      const totalEnrolled = userEnrollments.length;
      const completedCourses = userEnrollments.filter(course => course.completed).length;
      const completionRate = totalEnrolled > 0 ? (completedCourses / totalEnrolled) * 100 : 0;
      
      setStats({
        totalCourses: allCourses.length,
        totalEnrolled,
        completionRate,
        averageRating: 4.5, // This would come from backend in real app
      });
      
      filterAndSortCourses(allCourses, userEnrollments);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCourses = (coursesList: CourseCatalog[], enrollments: UserCourse[]) => {
    let filtered = [...coursesList];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term) ||
        course.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }
    
    // Apply difficulty filter
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(course => course.difficulty === selectedDifficulty);
    }
    
    // Apply sorting
    switch (selectedSort) {
      case 'popular':
        filtered.sort((a, b) => {
          // In real app, this would be based on enrollment count
          return b.duration - a.duration; // Using duration as proxy for now
        });
        break;
      case 'newest':
        filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'difficulty':
        const difficultyOrder = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2 };
        filtered.sort((a, b) => 
          difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
          difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
        );
        break;
      case 'duration':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
    }
    
    setFilteredCourses(filtered);
  };

  useEffect(() => {
    filterAndSortCourses(courses, userCourses);
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedSort, courses, userCourses]);

  const handleEnroll = async (courseSlug: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setEnrolling(courseSlug);
      const enrollment = await api.enrollCourse(user.id, {
        courseSlug,
        category: courses.find(c => c.slug === courseSlug)?.category,
        difficulty: courses.find(c => c.slug === courseSlug)?.difficulty,
      });
      
      // Update user courses
      setUserCourses([...userCourses, enrollment.data]);
      
      // Navigate to course page or show success message
      router.push(`/courses/${courseSlug}`);
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert('Failed to enroll in course. Please try again.');
    } finally {
      setEnrolling(null);
    }
  };

  const isUserEnrolled = (courseSlug: string) => {
    return userCourses.some(course => course.courseSlug === courseSlug);
  };

  const getUserProgress = (courseSlug: string) => {
    const userCourse = userCourses.find(course => course.courseSlug === courseSlug);
    return userCourse ? userCourse.progress : 0;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Explore Courses</h1>
              <p className="text-gray-600 mt-2">Discover and enroll in courses to enhance your skills</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <BookOpen className="w-4 h-4" />
                <span>{userCourses.length} enrolled</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4" />
                <span>
                  {userCourses.filter(c => c.completed).length} completed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCourses}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12 new this month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Your Enrollments</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalEnrolled}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.completionRate.toFixed(1)}% completion rate
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.averageRating.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(stats.averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Learning Time</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {Math.round(userCourses.reduce((sum, course) => {
                    const courseData = courses.find(c => c.slug === course.courseSlug);
                    return sum + (courseData?.duration || 0) * (course.progress / 100);
                  }, 0) / 60)}h
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Total time spent learning
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'All' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="difficulty">Difficulty</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>

          {/* Difficulty Filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDifficulty('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedDifficulty === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Levels
            </button>
            {['Beginner', 'Intermediate', 'Advanced'].map(level => (
              <button
                key={level}
                onClick={() => setSelectedDifficulty(level)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedDifficulty === level
                    ? getDifficultyColor(level) + ' font-semibold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Available Courses ({filteredCourses.length})
            </h2>
            <div className="flex items-center space-x-2 text-gray-600">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filtered and sorted</span>
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-700 mt-4">No courses found</h3>
              <p className="text-gray-500 mt-2">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedDifficulty('All');
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => {
                const isEnrolled = isUserEnrolled(course.slug);
                const progress = getUserProgress(course.slug);
                
                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    {/* Course Thumbnail */}
                    <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
                      {isEnrolled && progress > 0 && (
                        <div className="absolute top-4 right-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {progress}%
                              </span>
                            </div>
                            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
                          </div>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(course.category)}`}>
                          {course.category}
                        </span>
                      </div>
                      
                      {/* Difficulty Badge */}
                      <div className="absolute bottom-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    {/* Course Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {course.description}
                      </p>
                      
                      {/* Course Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{course.duration} min</span>
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            <span>{course.totalLessons} lessons</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                          <span>4.5</span>
                        </div>
                      </div>
                      
                      {/* Prerequisites */}
                      {course.prerequisites && course.prerequisites.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">Prerequisites:</p>
                          <div className="flex flex-wrap gap-2">
                            {course.prerequisites.slice(0, 3).map((preq, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {preq}
                              </span>
                            ))}
                            {course.prerequisites.length > 3 && (
                              <span className="px-2 py-1 text-gray-400 text-xs">
                                +{course.prerequisites.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Progress Bar for enrolled courses */}
                      {isEnrolled && progress > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Your progress</span>
                            <span className="font-medium text-blue-600">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Action Button */}
                      <button
                        onClick={() => {
                          if (isEnrolled) {
                            router.push(`/courses/${course.slug}`);
                          } else {
                            handleEnroll(course.slug);
                          }
                        }}
                        disabled={enrolling === course.slug}
                        className={`w-full py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                          isEnrolled
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                        } ${enrolling === course.slug ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        {enrolling === course.slug ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enrolling...
                          </>
                        ) : isEnrolled ? (
                          <>
                            {progress === 100 ? 'Completed' : 'Continue Learning'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        ) : (
                          <>
                            Enroll Now
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </button>
                      
                      {/* View Details Link */}
                      <button
                        onClick={() => router.push(`/courses/${course.slug}`)}
                        className="w-full mt-3 text-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View course details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Learning Paths Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Beginner Track</h3>
                <Award className="w-8 h-8" />
              </div>
              <p className="mb-4 opacity-90">
                Start your learning journey with fundamental courses designed for beginners.
              </p>
              <div className="text-sm opacity-75">
                <div className="flex items-center justify-between mb-2">
                  <span>Courses</span>
                  <span>{courses.filter(c => c.difficulty === 'Beginner').length}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span>Avg. Duration</span>
                  <span>
                    {Math.round(
                      courses
                        .filter(c => c.difficulty === 'Beginner')
                        .reduce((sum, c) => sum + c.duration, 0) /
                        (courses.filter(c => c.difficulty === 'Beginner').length || 1)
                    )} min
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedDifficulty('Beginner');
                  setSelectedCategory('All');
                }}
                className="mt-6 w-full bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Explore Path
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Intermediate Track</h3>
                <TrendingUp className="w-8 h-8" />
              </div>
              <p className="mb-4 opacity-90">
                Build on your foundation with intermediate courses and practical projects.
              </p>
              <div className="text-sm opacity-75">
                <div className="flex items-center justify-between mb-2">
                  <span>Courses</span>
                  <span>{courses.filter(c => c.difficulty === 'Intermediate').length}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span>Avg. Duration</span>
                  <span>
                    {Math.round(
                      courses
                        .filter(c => c.difficulty === 'Intermediate')
                        .reduce((sum, c) => sum + c.duration, 0) /
                        (courses.filter(c => c.difficulty === 'Intermediate').length || 1)
                    )} min
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedDifficulty('Intermediate');
                  setSelectedCategory('All');
                }}
                className="mt-6 w-full bg-white text-purple-600 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
              >
                Explore Path
              </button>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Advanced Track</h3>
                <BarChart3 className="w-8 h-8" />
              </div>
              <p className="mb-4 opacity-90">
                Master advanced topics and specialize in specific domains with expert-level courses.
              </p>
              <div className="text-sm opacity-75">
                <div className="flex items-center justify-between mb-2">
                  <span>Courses</span>
                  <span>{courses.filter(c => c.difficulty === 'Advanced').length}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span>Avg. Duration</span>
                  <span>
                    {Math.round(
                      courses
                        .filter(c => c.difficulty === 'Advanced')
                        .reduce((sum, c) => sum + c.duration, 0) /
                        (courses.filter(c => c.difficulty === 'Advanced').length || 1)
                    )} min
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedDifficulty('Advanced');
                  setSelectedCategory('All');
                }}
                className="mt-6 w-full bg-white text-orange-600 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors"
              >
                Explore Path
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended For You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userCourses.length > 0 ? (
              courses
                .filter(course => 
                  !userCourses.some(uc => uc.courseSlug === course.slug) &&
                  course.category === userCourses[0]?.category
                )
                .slice(0, 2)
                .map(course => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(course.category)}`}>
                            {course.category}
                          </span>
                          <span className="text-sm text-gray-500">• Based on your interests</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <button
                      onClick={() => handleEnroll(course.slug)}
                      disabled={enrolling === course.slug}
                      className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:shadow-md transition-shadow disabled:opacity-75"
                    >
                      {enrolling === course.slug ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                          Enrolling...
                        </>
                      ) : (
                        'Enroll in Course'
                      )}
                    </button>
                  </div>
                ))
            ) : (
              <div className="col-span-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow p-8 text-center">
                <AlertCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Start Your Learning Journey
                </h3>
                <p className="text-gray-600 mb-6">
                  Enroll in your first course to get personalized recommendations!
                </p>
                <button
                  onClick={() => {
                    const firstCourse = courses[0];
                    if (firstCourse) {
                      handleEnroll(firstCourse.slug);
                    }
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
                >
                  Enroll in a Course
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;