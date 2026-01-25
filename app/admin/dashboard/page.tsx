


// app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AdminStats, ChartData, RecentActivity } from '@/lib/types';
import {
  Users,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  MoreVertical
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import chart components to avoid SSR issues
const LineChart = dynamic(() => import('@/components/charts/LineChart'), { ssr: false });
const PieChart = dynamic(() => import('@/components/charts/PieChart'), { ssr: false });

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartRes, activityRes] = await Promise.all([
        api.getAdminStats(),
        api.getChartData(timeRange),
        api.getRecentActivity(),
      ]);

      setStats(statsRes.data);
      setChartData(chartRes.data);
      setRecentActivity(activityRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUsers || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">
              +{stats?.recentRegistrations || 0} this week
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalCourses || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">+5 this month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quiz Questions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalQuestions || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <HelpCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">+42 this month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.averageProgress || 0}%</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">+2.3% from last week</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
              <p className="text-sm text-gray-500">New registrations over time</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                7D
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                1M
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                1Y
              </button>
            </div>
          </div>
          <div className="h-64">
            {chartData && <LineChart data={chartData} />}
          </div>
        </div>

        {/* Course Categories */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Course Distribution</h3>
              <p className="text-sm text-gray-500">By category and difficulty</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="h-64">
            {chartData && <PieChart data={chartData} />}
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500">Latest actions across the platform</p>
            </div>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              View all →
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600">{activity.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.userName} <span className="font-normal text-gray-600">{activity.action}</span> {activity.target}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 text-left transition-colors">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">Add New User</p>
                  <p className="text-sm opacity-90">Create a new user account</p>
                </div>
              </div>
            </button>
            <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 text-left transition-colors">
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">Create Course</p>
                  <p className="text-sm opacity-90">Add new course to catalog</p>
                </div>
              </div>
            </button>
            <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 text-left transition-colors">
              <div className="flex items-center">
                <HelpCircle className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">Add Quiz</p>
                  <p className="text-sm opacity-90">Create new quiz questions</p>
                </div>
              </div>
            </button>
            <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 text-left transition-colors">
              <div className="flex items-center">
                <Download className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm opacity-90">Download platform analytics</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;