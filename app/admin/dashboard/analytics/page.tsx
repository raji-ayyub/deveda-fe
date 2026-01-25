// // app/dashboard/analytics/page.tsx
// 'use client';

// import { useState } from 'react';
// import { 
//   BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
// } from 'recharts';

// const analyticsData = [
//   { month: 'Jan', users: 4000, revenue: 2400, engagement: 65 },
//   { month: 'Feb', users: 3000, revenue: 1398, engagement: 72 },
//   { month: 'Mar', users: 2000, revenue: 9800, engagement: 68 },
//   { month: 'Apr', users: 2780, revenue: 3908, engagement: 75 },
//   { month: 'May', users: 1890, revenue: 4800, engagement: 80 },
//   { month: 'Jun', users: 2390, revenue: 3800, engagement: 78 },
// ];

// export default function AnalyticsPage() {
//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold text-dark">Analytics Dashboard</h1>
//       {/* Add comprehensive analytics charts */}
//     </div>
//   );
// }



// app/dashboard/analytics/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ChartData } from '@/lib/types';
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  DollarSign,
  Globe,
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import chart components
const LineChart = dynamic(() => import('@/components/charts/LineChart'), { ssr: false });
const PieChart = dynamic(() => import('@/components/charts/PieChart'), { ssr: false });
const BarChart = dynamic(() => import('@/components/charts/BarChart'), { ssr: false });

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [userGrowthData, setUserGrowthData] = useState<ChartData | null>(null);
  const [courseDistributionData, setCourseDistributionData] = useState<ChartData | null>(null);
  const [revenueData, setRevenueData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    avgSessionTime: 0,
    completionRate: 0,
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // In a real app, you would have separate endpoints for each chart
      // For now, we'll use mock data
      setUserGrowthData(generateUserGrowthData());
      setCourseDistributionData(generateCourseDistributionData());
      setRevenueData(generateRevenueData());
      
      // Mock metrics
      setMetrics({
        totalUsers: 1234,
        activeUsers: 789,
        totalCourses: 56,
        totalRevenue: 12500,
        avgSessionTime: 24,
        completionRate: 68,
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateUserGrowthData = (): ChartData => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return {
      labels,
      datasets: [{
        label: 'New Users',
        data: labels.map(() => Math.floor(Math.random() * 200) + 50),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      }],
    };
  };

  const generateCourseDistributionData = (): ChartData => {
    return {
      labels: ['Programming', 'Mathematics', 'Science', 'Business', 'Arts'],
      datasets: [{
        label: 'Enrollments',
        data: [45, 28, 15, 32, 20],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(139, 92, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      }],
    };
  };

  const generateRevenueData = (): ChartData => {
    const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
    return {
      labels,
      datasets: [{
        label: 'Revenue (USD)',
        data: [2800, 3200, 4100, 3800],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
      }],
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track platform performance and user engagement</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalUsers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.activeUsers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">+8% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${metrics.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">+23% from last quarter</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Session Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.avgSessionTime} min</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">+2min from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.completionRate}%</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">+5% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalCourses}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">+3 this month</span>
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
              <p className="text-sm text-gray-500">New user registrations over time</p>
            </div>
            <LineChartIcon className="w-5 h-5 text-blue-500" />
          </div>
          <div className="h-64">
            {userGrowthData && <LineChart data={userGrowthData} />}
          </div>
        </div>

        {/* Course Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Course Distribution</h3>
              <p className="text-sm text-gray-500">Enrollments by category</p>
            </div>
            <PieChartIcon className="w-5 h-5 text-purple-500" />
          </div>
          <div className="h-64">
            {courseDistributionData && <PieChart data={courseDistributionData} />}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <p className="text-sm text-gray-500">Quarterly revenue performance</p>
          </div>
          <BarChart3 className="w-5 h-5 text-green-500" />
        </div>
        <div className="h-64">
          {revenueData && <BarChart data={revenueData} />}
        </div>
      </div>

      {/* Platform Health */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-blue-900">Server Uptime</h4>
              <div className="text-2xl font-bold text-blue-900">99.9%</div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: '99.9%' }} />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-green-900">API Response</h4>
              <div className="text-2xl font-bold text-green-900">98ms</div>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-green-600" style={{ width: '95%' }} />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-purple-900">User Satisfaction</h4>
              <div className="text-2xl font-bold text-purple-900">4.8/5</div>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-purple-600" style={{ width: '96%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;