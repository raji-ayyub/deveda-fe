// app/dashboard/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaBook,
  FaQuestionCircle,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaPlus,
  FaChartPie
} from 'react-icons/fa';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data
const userGrowthData = [
  { month: 'Jan', users: 1200, revenue: 4500 },
  { month: 'Feb', users: 1800, revenue: 6200 },
  { month: 'Mar', users: 2400, revenue: 7800 },
  { month: 'Apr', users: 2800, revenue: 9100 },
  { month: 'May', users: 3200, revenue: 10500 },
  { month: 'Jun', users: 3800, revenue: 12400 },
];

const categoryData = [
  { name: 'HTML/CSS', value: 35, color: '#4f46e5' },
  { name: 'JavaScript', value: 25, color: '#7c3aed' },
  { name: 'React', value: 20, color: '#2563eb' },
  { name: 'TypeScript', value: 12, color: '#0ea5e9' },
  { name: 'Next.js', value: 8, color: '#06b6d4' },
];

const recentUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Student', joinDate: '2024-01-15', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Instructor', joinDate: '2024-01-14', status: 'active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Student', joinDate: '2024-01-13', status: 'pending' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Student', joinDate: '2024-01-12', status: 'active' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin', joinDate: '2024-01-11', status: 'active' },
];

const recentCourses = [
  { id: 1, title: 'Advanced React Patterns', category: 'React', students: 245, rating: 4.8, status: 'published' },
  { id: 2, title: 'TypeScript Masterclass', category: 'TypeScript', students: 189, rating: 4.9, status: 'published' },
  { id: 3, title: 'Next.js 14 Deep Dive', category: 'Next.js', students: 156, rating: 4.7, status: 'draft' },
  { id: 4, title: 'CSS Grid & Flexbox', category: 'CSS', students: 312, rating: 4.6, status: 'published' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 4250,
    newUsers: 124,
    activeUsers: 2850,
    totalCourses: 48,
    publishedCourses: 42,
    totalQuizzes: 156,
    activeQuizzes: 142,
    revenue: 45890,
    revenueChange: 12.5,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome to your administration panel</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
            <FaUserPlus /> Add User
          </button>
          <button className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <FaPlus /> New Course
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-dark mt-2">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <FaUsers className="text-blue-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-semibold flex items-center">
              <FaArrowUp className="mr-1" /> +{stats.newUsers}
            </span>
            <span className="text-gray-500 ml-2">new this month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Courses</p>
              <p className="text-2xl font-bold text-dark mt-2">{stats.publishedCourses}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
              <FaBook className="text-purple-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            {stats.totalCourses} total courses
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
              <p className="text-sm text-gray-500">Active Quizzes</p>
              <p className="text-2xl font-bold text-dark mt-2">{stats.activeQuizzes}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <FaQuestionCircle className="text-green-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            {stats.totalQuizzes} total quizzes
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
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-dark mt-2">${stats.revenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
              <FaDollarSign className="text-orange-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={`font-semibold flex items-center ${
              stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.revenueChange >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
              {Math.abs(stats.revenueChange)}%
            </span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-dark">User Growth & Revenue</h2>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>All Time</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} />
                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Course Categories */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-dark">Course Categories</h2>
            <FaChartPie className="text-primary" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent ?? 0) * 100}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {categoryData.map(category => (
              <div key={category.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="text-sm text-gray-600">{category.name}</span>
                <span className="text-sm font-semibold ml-auto">{category.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-dark">Recent Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-sm mr-3">
                          {user.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'Instructor' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <FaEye />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <FaEdit />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-dark">Recent Courses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentCourses.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{course.title}</div>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">{course.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{course.students}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}