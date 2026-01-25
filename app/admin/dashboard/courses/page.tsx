'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CourseCatalog } from '@/lib/types';
import {
  Plus,
  RefreshCw,
  BookOpen,
  Clock,
  CheckCircle,
  BarChart3,
  Loader2
} from 'lucide-react';
import { CourseModal } from '@/components/dashboard/courses';
import {CourseRow} from '@/components/dashboard/courses';
import {Filters} from '@/components/dashboard/courses';
import {StatsCard} from '@/components/dashboard/courses';

const CoursesManagementPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseCatalog | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    averageDuration: 0,
    totalLessons: 0,
    totalQuizzes: 0,
  });

  // Get unique categories and difficulties from courses
  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category))).filter(Boolean)];
  const difficulties = ['all', ...Array.from(new Set(courses.map(c => c.difficulty))).filter(Boolean)];

  useEffect(() => {
    loadCourses();
    loadStats();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, categoryFilter, difficultyFilter]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await api.getCourseCatalog();
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to load courses:', error);
      // For demo purposes, create some mock data if API fails
      if (process.env.NODE_ENV === 'development') {
        setCourses(getMockCourses());
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const totalCourses = courses.length;
    const totalDuration = courses.reduce((sum, course) => sum + course.duration, 0);
    const averageDuration = totalCourses > 0 ? Math.round(totalDuration / totalCourses) : 0;
    const totalLessons = courses.reduce((sum, course) => sum + course.totalLessons, 0);
    const totalQuizzes = courses.reduce((sum, course) => sum + course.totalQuizzes, 0);
    
    setStats({
      totalCourses,
      averageDuration,
      totalLessons,
      totalQuizzes,
    });
  };

  const filterCourses = () => {
    let filtered = [...courses];

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => course.category === categoryFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(course => course.difficulty === difficultyFilter);
    }

    setFilteredCourses(filtered);
  };

  const handleCreateCourse = async (formData: any) => {
    try {
      setActionLoading('create');
      const response = await api.createCourseCatalog(formData);
      setCourses([response.data, ...courses]);
      setShowCreateModal(false);
      await loadStats(); // Refresh stats
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('Failed to create course. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateCourse = async (courseId: string, formData: any) => {
    try {
      setActionLoading('update');
      // Note: This endpoint needs to be implemented in your backend
      // For now, we'll simulate the update
      const updatedCourse = {
        ...editingCourse,
        ...formData,
        id: courseId,
      };
      
      setCourses(courses.map(c => 
        c.id === courseId ? updatedCourse as CourseCatalog : c
      ));
      
      setShowEditModal(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('Failed to update course:', error);
      alert('Failed to update course. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCourse = async (courseSlug: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(`delete-${courseSlug}`);
      await api.deleteCourseCatalog(courseSlug);
      setCourses(courses.filter(c => c.slug !== courseSlug));
      await loadStats(); // Refresh stats
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('Failed to delete course. Please try again.');
    } finally {
      setActionLoading(null);
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setDifficultyFilter('all');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
          <p className="text-gray-600">Manage course catalog and content</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadCourses}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={BookOpen}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        
        <StatsCard
          title="Avg. Duration"
          value={formatDuration(stats.averageDuration)}
          icon={Clock}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        
        <StatsCard
          title="Total Lessons"
          value={stats.totalLessons}
          icon={CheckCircle}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        
        <StatsCard
          title="Total Quizzes"
          value={stats.totalQuizzes}
          icon={BarChart3}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Filters */}
      <Filters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        categories={categories}
        difficulties={difficulties}
        onClearFilters={clearFilters}
      />

      {/* Courses Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5 text-sm font-semibold text-gray-900">Course</div>
            <div className="col-span-2 text-sm font-semibold text-gray-900">Category</div>
            <div className="col-span-2 text-sm font-semibold text-gray-900">Duration</div>
            <div className="col-span-2 text-sm font-semibold text-gray-900">Details</div>
            <div className="col-span-1 text-sm font-semibold text-gray-900">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {filteredCourses.map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              onEdit={() => {
                setEditingCourse(course);
                setShowEditModal(true);
              }}
              onDelete={handleDeleteCourse}
              actionLoading={actionLoading}
              getDifficultyColor={getDifficultyColor}
              getCategoryColor={getCategoryColor}
              formatDuration={formatDuration}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="mt-6 text-xl font-medium text-gray-900">No courses found</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              {courses.length === 0 
                ? 'Get started by creating your first course to build your learning catalog.'
                : 'Try adjusting your search or filters to find what you\'re looking for.'}
            </p>
            {courses.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 shadow-md"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Course
              </button>
            )}
          </div>
        )}

        {/* Table Footer */}
        {filteredCourses.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{filteredCourses.length}</span> of{' '}
                <span className="font-medium">{courses.length}</span> courses
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <CourseModal
          course={editingCourse}
          onSubmit={editingCourse ? 
            (data) => handleUpdateCourse(editingCourse.id, data) : 
            handleCreateCourse
          }
          loading={actionLoading === 'create' || actionLoading === 'update'}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setEditingCourse(null);
          }}
        />
      )}
    </div>
  );
};

// Mock data for development (remove in production)
const getMockCourses = (): CourseCatalog[] => {
  return [
    {
      id: '1',
      slug: 'intro-python',
      title: 'Introduction to Python',
      description: 'Learn the fundamentals of Python programming language from scratch.',
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
      slug: 'advanced-javascript',
      title: 'Advanced JavaScript Concepts',
      description: 'Master advanced JavaScript topics including async/await, closures, and design patterns.',
      category: 'Web Development',
      difficulty: 'Advanced',
      duration: 360,
      totalQuizzes: 8,
      totalLessons: 18,
      instructor: 'Sarah Johnson',
      prerequisites: ['intro-javascript', 'basic-html-css'],
      tags: ['javascript', 'webdev', 'advanced'],
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
      createdAt: '2024-01-20',
    },
    {
      id: '3',
      slug: 'data-science-101',
      title: 'Data Science Fundamentals',
      description: 'Introduction to data science concepts, tools, and methodologies.',
      category: 'Data Science',
      difficulty: 'Intermediate',
      duration: 300,
      totalQuizzes: 6,
      totalLessons: 15,
      instructor: 'Dr. Michael Chen',
      prerequisites: ['intro-python', 'basic-statistics'],
      tags: ['data-science', 'python', 'machine-learning'],
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      createdAt: '2024-01-25',
    },
  ];
};

export default CoursesManagementPage;