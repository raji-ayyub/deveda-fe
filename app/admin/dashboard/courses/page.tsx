'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CourseCatalog } from '@/lib/types';
import { COURSE_CATEGORY_COLORS, COURSE_DIFFICULTY_COLORS } from '@/lib/course-content';
import {
  Plus,
  RefreshCw,
  BookOpen,
  Clock,
  CheckCircle,
  BarChart3,
  LibraryBig,
  Loader2
} from 'lucide-react';
import { CourseModal } from '@/components/dashboard/courses';
import {CourseRow} from '@/components/dashboard/courses';
import {Filters} from '@/components/dashboard/courses';
import {StatsCard} from '@/components/dashboard/courses';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

const CoursesManagementPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
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
  const [error, setError] = useState('');
  const [pendingDeleteCourseSlug, setPendingDeleteCourseSlug] = useState<string | null>(null);
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
  }, []);

  useEffect(() => {
    loadStats();
  }, [courses]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, categoryFilter, difficultyFilter]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getCourseCatalog();
      setCourses(response.data);
    } catch (loadError: any) {
      console.error('Failed to load courses:', loadError);
      setCourses([]);
      setError(loadError.message || 'Unable to load course management data.');
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

  const handleCreateCourse = async (formData: any, options?: { openCurriculum?: boolean }) => {
    try {
      setActionLoading('create');
      setError('');
      const response = await api.createCourseCatalog(formData);
      setCourses([response.data, ...courses]);
      setShowCreateModal(false);
      if (options?.openCurriculum) {
        openCurriculumStudio(response.data.slug);
      }
    } catch (error) {
      console.error('Failed to create course:', error);
      setError('Failed to create the course. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateCourse = async (courseId: string, formData: any, options?: { openCurriculum?: boolean }) => {
    try {
      setActionLoading('update');
      setError('');
      if (!editingCourse) {
        return;
      }

      const response = await api.updateCourseCatalog(editingCourse.slug, formData);
      setCourses(courses.map(c => 
        c.slug === courseId ? response.data : c
      ));
      
      setShowEditModal(false);
      setEditingCourse(null);
      if (options?.openCurriculum) {
        openCurriculumStudio(response.data.slug);
      }
    } catch (error) {
      console.error('Failed to update course:', error);
      setError('Failed to update the course. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartCourseImport = async (payload: { file: File; instructions: string; courseSlug?: string }) => {
    try {
      setActionLoading('import');
      setError('');
      const sessionResponse = await api.uploadContentGenerationSession({
        file: payload.file,
        courseSlug: payload.courseSlug,
        instructions: payload.instructions,
      });

      let session = sessionResponse.data;
      if (!payload.courseSlug) {
        const shellResponse = await api.runContentGenerationAction(session.id, {
          actionType: 'create_course_shell',
          instructions: payload.instructions,
        });
        session = shellResponse.data;
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setEditingCourse(null);
      await loadCourses();

      const courseSlug = session.courseSlug || session.course?.slug || payload.courseSlug || '';
      const query = new URLSearchParams();
      if (courseSlug) {
        query.set('course', courseSlug);
      }
      query.set('session', session.id);
      router.push(`${cmsRouteBase}?${query.toString()}`);
    } catch (importError: any) {
      throw new Error(importError.message || 'Unable to start the course import flow right now.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCourse = async (courseSlug: string) => {
    try {
      setActionLoading(`delete-${courseSlug}`);
      setError('');
      await api.deleteCourseCatalog(courseSlug);
      setCourses(courses.filter(c => c.slug !== courseSlug));
      setPendingDeleteCourseSlug(null);
    } catch (error) {
      console.error('Failed to delete course:', error);
      setError('Failed to delete the course. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    return COURSE_DIFFICULTY_COLORS[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    return COURSE_CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800';
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

  const cmsRouteBase = pathname.startsWith('/instructor') ? '/instructor/dashboard/cms' : '/admin/dashboard/cms';

  const openCurriculumStudio = (courseSlug: string) => {
    router.push(`${cmsRouteBase}?course=${courseSlug}`);
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
          <p className="text-gray-600">Manage the coding curriculum across frontend, backend, and systems design</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push(pathname.startsWith('/instructor') ? '/instructor/dashboard/lessons' : '/admin/dashboard/lessons')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <LibraryBig className="w-4 h-4 mr-2" />
            Manage lessons
          </button>
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

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

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
              onDelete={(courseSlug) => setPendingDeleteCourseSlug(courseSlug)}
              onOpenStudio={openCurriculumStudio}
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
              <div className="text-sm text-gray-500">Catalog entries update live from the backend.</div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <CourseModal
          course={editingCourse}
          onSubmit={editingCourse ? 
            (data, options) => handleUpdateCourse(editingCourse.slug, data, options) : 
            handleCreateCourse
          }
          onStartImport={handleStartCourseImport}
          loading={actionLoading === 'create' || actionLoading === 'update'}
          importing={actionLoading === 'import'}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setEditingCourse(null);
          }}
        />
      )}

      <ConfirmationDialog
        isOpen={Boolean(pendingDeleteCourseSlug)}
        title="Delete course"
        description="This will remove the course, its curriculum, linked lessons, enrollments, and generated assessment data. This action cannot be undone."
        confirmLabel="Delete course"
        busy={Boolean(pendingDeleteCourseSlug && actionLoading === `delete-${pendingDeleteCourseSlug}`)}
        onCancel={() => setPendingDeleteCourseSlug(null)}
        onConfirm={() => {
          if (pendingDeleteCourseSlug) {
            void handleDeleteCourse(pendingDeleteCourseSlug);
          }
        }}
      />
    </div>
  );
};

export default CoursesManagementPage;
