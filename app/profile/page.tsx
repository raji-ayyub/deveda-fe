

// app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  User, Mail, Calendar, Award, BookOpen, Trophy, 
  TrendingUp, Edit, Save, X, Clock, CheckCircle, 
  AlertCircle, Star
} from 'lucide-react';
import { UserCourse, QuizAttempt, CourseCatalog } from '@/lib/types';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [courseCatalog, setCourseCatalog] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    if (user) {
      loadUserData();
      setEditData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [coursesRes, quizzesRes, catalogRes] = await Promise.all([
        api.getUserCourses(user.id),
        api.getUserQuizAttempts(user.id),
        api.getCourseCatalog(),
      ]);

      setUserCourses(coursesRes.data);
      setQuizAttempts(quizzesRes.data);
      setCourseCatalog(catalogRes.data);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      await updateUser(editData);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      });
    }
    setEditing(false);
  };

  const getCourseStats = () => {
    const totalCourses = userCourses.length;
    const completedCourses = userCourses.filter(course => course.completed).length;
    const avgProgress = totalCourses > 0 
      ? userCourses.reduce((sum, course) => sum + course.progress, 0) / totalCourses 
      : 0;

    return { totalCourses, completedCourses, avgProgress };
  };

  const getQuizStats = () => {
    const totalAttempts = quizAttempts.length;
    const passedAttempts = quizAttempts.filter(attempt => attempt.passed).length;
    const avgScore = totalAttempts > 0
      ? quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts
      : 0;

    return { totalAttempts, passedAttempts, avgScore };
  };

  const stats = getCourseStats();
  const quizStats = getQuizStats();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
          <p className="mt-4 text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account and track your learning progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {user.role}
                      </span>
                      {user.isActive && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(!editing)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {editing ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                </button>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editData.firstName}
                      onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editData.lastName}
                      onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      <Save className="w-4 h-4 inline mr-2" />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Mail className="w-5 h-5" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <User className="w-5 h-5" />
                    <span>{user.role}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">Member since</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">Recently joined</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Learning Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5" />
                    <span>Courses Enrolled</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.totalCourses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5" />
                    <span>Courses Completed</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.completedCourses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-5 h-5" />
                    <span>Avg. Progress</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.avgProgress.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Courses & Quizzes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Courses Progress */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">My Courses</h3>
                <span className="text-sm text-blue-600 font-medium">
                  {stats.completedCourses}/{stats.totalCourses} Completed
                </span>
              </div>

              <div className="space-y-4">
                {userCourses.length > 0 ? (
                  userCourses.map((course) => {
                    const catalogCourse = courseCatalog.find(c => c.slug === course.courseSlug);
                    return (
                      <div key={course.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {catalogCourse?.title || course.courseSlug}
                            </h4>
                            <div className="flex items-center space-x-3 mt-2">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {course.category}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                course.difficulty === 'Beginner' 
                                  ? 'bg-green-100 text-green-800'
                                  : course.difficulty === 'Intermediate'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {course.difficulty}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-blue-600">
                              {course.progress}%
                            </span>
                            {course.completed && (
                              <div className="flex items-center justify-end mt-1">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                <span className="text-xs text-green-600">Completed</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                course.progress === 100 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
                              }`}
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Progress</span>
                            <span>Last accessed: {new Date(course.lastAccessed || course.enrolledAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="text-gray-500 mt-4">No courses enrolled yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quiz Attempts */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Quiz History</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Average Score</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {quizStats.avgScore.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Pass Rate</div>
                    <div className="text-2xl font-bold text-green-600">
                      {quizStats.totalAttempts > 0 
                        ? ((quizStats.passedAttempts / quizStats.totalAttempts) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {quizAttempts.length > 0 ? (
                  quizAttempts.slice(0, 5).map((attempt) => (
                    <div key={attempt.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">Quiz: {attempt.quizId}</h4>
                          {attempt.courseSlug && (
                            <p className="text-sm text-gray-500 mt-1">
                              Course: {attempt.courseSlug}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                {new Date(attempt.attemptedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Trophy className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">Score: {attempt.score}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${
                            attempt.passed ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {attempt.score}%
                          </span>
                          <div className="mt-1">
                            <span className={`px-3 py-1 text-xs rounded-full ${
                              attempt.passed 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {attempt.passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="text-gray-500 mt-4">No quiz attempts yet</p>
                  </div>
                )}

                {quizAttempts.length > 5 && (
                  <div className="text-center pt-4">
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      View all {quizAttempts.length} quiz attempts →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Achievements</h3>
                <Star className="w-6 h-6" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <p className="mt-2 font-medium">Course Enthusiast</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <p className="mt-2 font-medium">Quiz Master</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <p className="mt-2 font-medium">Consistent Learner</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                    <Award className="w-8 h-8" />
                  </div>
                  <p className="mt-2 font-medium">Perfect Score</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;