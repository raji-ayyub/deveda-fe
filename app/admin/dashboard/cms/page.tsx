// app/dashboard/cms/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaSearch,
  FaFilter,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaSort,
  FaDownload,
  FaUpload,
  FaClone,
  FaCalendar,
  FaUserGraduate,
  FaChartBar
} from 'react-icons/fa';

interface ContentItem {
  id: string;
  title: string;
  type: 'course' | 'quiz' | 'game' | 'article';
  category: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  author: string;
  views?: number;
  students?: number;
}

const contentItems: ContentItem[] = [
  { id: '1', title: 'HTML Fundamentals', type: 'course', category: 'HTML', status: 'published', createdAt: '2024-01-15', updatedAt: '2024-01-20', author: 'John Doe', students: 245, views: 1200 },
  { id: '2', title: 'CSS Grid Mastery', type: 'course', category: 'CSS', status: 'published', createdAt: '2024-01-10', updatedAt: '2024-01-18', author: 'Jane Smith', students: 189, views: 980 },
  { id: '3', title: 'JavaScript Basics Quiz', type: 'quiz', category: 'JavaScript', status: 'published', createdAt: '2024-01-12', updatedAt: '2024-01-12', author: 'Bob Johnson', views: 560 },
  { id: '4', title: 'React Hooks Deep Dive', type: 'course', category: 'React', status: 'draft', createdAt: '2024-01-14', updatedAt: '2024-01-19', author: 'Alice Brown', students: 0, views: 45 },
  { id: '5', title: 'Code Typing Game', type: 'game', category: 'Games', status: 'published', createdAt: '2024-01-05', updatedAt: '2024-01-15', author: 'Charlie Wilson', views: 2100 },
  { id: '6', title: 'TypeScript Advanced', type: 'course', category: 'TypeScript', status: 'archived', createdAt: '2023-12-20', updatedAt: '2024-01-10', author: 'David Lee', students: 156, views: 780 },
  { id: '7', title: 'CSS Layout Challenge', type: 'quiz', category: 'CSS', status: 'published', createdAt: '2024-01-08', updatedAt: '2024-01-08', author: 'Emma Wilson', views: 420 },
  { id: '8', title: 'Next.js 14 Guide', type: 'article', category: 'Next.js', status: 'draft', createdAt: '2024-01-18', updatedAt: '2024-01-18', author: 'Frank Miller', views: 32 },
];

export default function CMSPage() {
  const [items, setItems] = useState(contentItems);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                         item.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.type === filter || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'popular':
        return (b.views || 0) - (a.views || 0);
      default:
        return 0;
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleStatusChange = (id: string, newStatus: ContentItem['status']) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-800';
      case 'quiz': return 'bg-green-100 text-green-800';
      case 'game': return 'bg-purple-100 text-purple-800';
      case 'article': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark">Content Management</h1>
          <p className="text-gray-600">Manage courses, quizzes, games, and articles</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
          <FaPlus /> Create New
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="course">Courses</option>
              <option value="quiz">Quizzes</option>
              <option value="game">Games</option>
              <option value="article">Articles</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Published</div>
            <div className="text-2xl font-bold text-dark">{items.filter(i => i.status === 'published').length}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 mb-1">Drafts</div>
            <div className="text-2xl font-bold text-dark">{items.filter(i => i.status === 'draft').length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 mb-1">Total Views</div>
            <div className="text-2xl font-bold text-dark">
              {items.reduce((sum, item) => sum + (item.views || 0), 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 mb-1">Total Students</div>
            <div className="text-2xl font-bold text-dark">
              {items.reduce((sum, item) => sum + (item.students || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid/Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaCalendar className="text-gray-400" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs rounded-full ${getTypeColor(item.type)}`}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as ContentItem['status'])}
                      className={`px-3 py-1 text-xs rounded-full border-0 focus:ring-2 focus:ring-offset-2 ${getStatusColor(item.status)}`}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      {item.students !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FaUserGraduate className="text-blue-500" />
                          <span>{item.students}</span>
                        </div>
                      )}
                      {item.views !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FaChartBar className="text-green-500" />
                          <span>{item.views}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded">
                        <FaEye />
                      </button>
                      <button className="p-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded">
                        <FaEdit />
                      </button>
                      <button className="p-1.5 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded">
                        <FaClone />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bulk Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {sortedItems.length} of {items.length} items
            </div>
            <div className="flex gap-3">
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                <FaDownload /> Export
              </button>
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                <FaUpload /> Import
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Content Modal (Simplified) */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-dark mb-4">Quick Create</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl mb-3">
              📚
            </div>
            <span className="font-medium text-gray-900">New Course</span>
            <span className="text-sm text-gray-500">Interactive lessons</span>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl mb-3">
              📝
            </div>
            <span className="font-medium text-gray-900">New Quiz</span>
            <span className="text-sm text-gray-500">Test knowledge</span>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl mb-3">
              🎮
            </div>
            <span className="font-medium text-gray-900">New Game</span>
            <span className="text-sm text-gray-500">Fun learning</span>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 text-xl mb-3">
              📄
            </div>
            <span className="font-medium text-gray-900">New Article</span>
            <span className="text-sm text-gray-500">Written content</span>
          </button>
        </div>
      </div>
    </div>
  );
}