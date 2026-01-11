// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaBook,
  FaCheckCircle,
  FaClock,
  FaTrophy,
  FaChartLine,
  FaCalendarAlt,
  FaFire,
  FaStar
} from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data
const weeklyProgress = [
  { day: 'Mon', hours: 2.5, quizzes: 3 },
  { day: 'Tue', hours: 1.8, quizzes: 2 },
  { day: 'Wed', hours: 3.2, quizzes: 4 },
  { day: 'Thu', hours: 2.0, quizzes: 3 },
  { day: 'Fri', hours: 4.1, quizzes: 5 },
  { day: 'Sat', hours: 3.5, quizzes: 4 },
  { day: 'Sun', hours: 2.8, quizzes: 3 },
];

const recentCourses = [
  { id: 1, title: 'HTML Fundamentals', progress: 65, lessons: 12, completed: 8 },
  { id: 2, title: 'CSS Mastery', progress: 42, lessons: 15, completed: 6 },
  { id: 3, title: 'JavaScript Basics', progress: 25, lessons: 20, completed: 5 },
  { id: 4, title: 'React Introduction', progress: 10, lessons: 18, completed: 2 },
];

const achievements = [
  { id: 1, title: 'Quick Learner', description: 'Complete 5 courses in a week', icon: '⚡', unlocked: true },
  { id: 2, title: 'Quiz Master', description: 'Score 100% on 10 quizzes', icon: '🏆', unlocked: true },
  { id: 3, title: 'Code Warrior', description: 'Write 1000 lines of code', icon: '⚔️', unlocked: false },
  { id: 4, title: 'Early Bird', description: 'Study 7 days in a row', icon: '🐦', unlocked: false },
];

const upcomingDeadlines = [
  { id: 1, title: 'Advanced CSS Quiz', date: 'Tomorrow', course: 'CSS Mastery' },
  { id: 2, title: 'Project Submission', date: 'In 3 days', course: 'HTML Fundamentals' },
  { id: 3, title: 'Mid-course Assessment', date: 'Next week', course: 'JavaScript Basics' },
];

export default function UserDashboard() {
  const [stats, setStats] = useState({
    totalCourses: 4,
    completedCourses: 1,
    totalHours: 42.5,
    currentStreak: 7,
    averageScore: 85,
    quizzesTaken: 24,
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-white/80">Keep up the great work! You're making excellent progress.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <div className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <span className="text-sm">Current Streak</span>
              <div className="flex items-center gap-2">
                <FaFire className="text-orange-300" />
                <span className="text-2xl font-bold">{stats.currentStreak} days</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Enrolled Courses</p>
              <p className="text-2xl font-bold text-dark mt-2">{stats.totalCourses}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <FaBook className="text-blue-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600">
            <span className="font-semibold">+1</span> this month
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Study Hours</p>
              <p className="text-2xl font-bold text-dark mt-2">{stats.totalHours}h</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
              <FaClock className="text-purple-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600">
            <span className="font-semibold">+12.5h</span> this week
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Score</p>
              <p className="text-2xl font-bold text-dark mt-2">{stats.averageScore}%</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <FaChartLine className="text-green-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600">
            <span className="font-semibold">+5%</span> improvement
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Quizzes Taken</p>
              <p className="text-2xl font-bold text-dark mt-2">{stats.quizzesTaken}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
              <FaCheckCircle className="text-orange-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600">
            <span className="font-semibold">+8</span> this month
          </div>
        </motion.div>
      </div>

      {/* Charts and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-dark">Weekly Progress</h2>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#4f46e5" name="Study Hours" />
                <Bar dataKey="quizzes" fill="#7c3aed" name="Quizzes Taken" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Course Progress */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-dark mb-6">Course Progress</h2>
          <div className="space-y-6">
            {recentCourses.map(course => (
              <div key={course.id} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">{course.title}</span>
                  <span className="text-primary font-semibold">{course.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{course.completed} of {course.lessons} lessons completed</span>
                  <span>{Math.round(course.progress)}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark">Achievements</h2>
            <FaTrophy className="text-yellow-500" />
          </div>
          <div className="space-y-4">
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  achievement.unlocked ? 'bg-green-50 border border-green-100' : 'bg-gray-50'
                }`}
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-500">{achievement.description}</p>
                </div>
                {achievement.unlocked ? (
                  <FaStar className="text-yellow-500" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark">Upcoming Deadlines</h2>
            <FaCalendarAlt className="text-primary" />
          </div>
          <div className="space-y-4">
            {upcomingDeadlines.map(deadline => (
              <div key={deadline.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{deadline.title}</h4>
                  <p className="text-sm text-gray-500">{deadline.course}</p>
                </div>
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {deadline.date}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-dark mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center">
              <div className="text-blue-500 text-xl mb-2">📝</div>
              <span className="font-medium text-gray-900">Take Quiz</span>
            </button>
            <button className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center">
              <div className="text-purple-500 text-xl mb-2">🎮</div>
              <span className="font-medium text-gray-900">Play Game</span>
            </button>
            <button className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-center">
              <div className="text-green-500 text-xl mb-2">📚</div>
              <span className="font-medium text-gray-900">Continue Learning</span>
            </button>
            <button className="p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors text-center">
              <div className="text-orange-500 text-xl mb-2">🎨</div>
              <span className="font-medium text-gray-900">Creative Lab</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}