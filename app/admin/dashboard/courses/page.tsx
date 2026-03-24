'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CourseCatalog, PaginationMeta } from '@/lib/types';
import { COURSE_CATEGORY_COLORS, COURSE_CATEGORIES, COURSE_DIFFICULTIES, COURSE_DIFFICULTY_COLORS } from '@/lib/course-content';
import { BarChart3, BookOpen, CheckCircle, Clock, LibraryBig, Plus, RefreshCw } from 'lucide-react';

import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import PaginationControls from '@/components/ui/PaginationControls';
import { CourseModal, CourseRow, Filters, StatsCard } from '@/components/dashboard/courses';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

const PAGE_SIZE = 10;

const CoursesManagementPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
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

  const debouncedSearchTerm = useDebouncedValue(searchTerm);
  const categories = ['all', ...COURSE_CATEGORIES];
  const difficulties = ['all', ...COURSE_DIFFICULTIES];
  const cmsRouteBase = pathname.startsWith('/instructor') ? '/instructor/dashboard/cms' : '/admin/dashboard/cms';

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, debouncedSearchTerm, difficultyFilter]);

  useEffect(() => {
    void loadStats();
  }, []);

  useEffect(() => {
    void loadCourses();
  }, [categoryFilter, currentPage, debouncedSearchTerm, difficultyFilter]);

  const loadCourses = async (options?: { silent?: boolean }) => {
    try {
      if (options?.silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      const response = await api.getCourseCatalog({
        search: debouncedSearchTerm || undefined,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        difficulty: difficultyFilter === 'all' ? undefined : difficultyFilter,
        sortBy: 'newest',
        page: currentPage,
        pageSize: PAGE_SIZE,
      });
      setCourses(response.data);
      setPagination(response.pagination);
    } catch (loadError: any) {
      console.error('Failed to load courses:', loadError);
      setCourses([]);
      setError(loadError.message || 'Unable to load course management data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.getCourseCatalogStats();
      setStats({
        totalCourses: response.data.total_courses || 0,
        averageDuration: response.data.average_duration || 0,
        totalLessons: response.data.total_lessons || 0,
        totalQuizzes: response.data.total_quizzes || 0,
      });
    } catch (statsError) {
      console.error('Failed to load course stats:', statsError);
    }
  };

  const handleCreateCourse = async (formData: any, options?: { openCurriculum?: boolean }) => {
    try {
      setActionLoading('create');
      setError('');
      const response = await api.createCourseCatalog(formData);
      setShowCreateModal(false);
      setCurrentPage(1);
      await Promise.all([loadCourses({ silent: true }), loadStats()]);
      if (options?.openCurriculum) {
        openCurriculumStudio(response.data.slug);
      }
    } catch (createError) {
      console.error('Failed to create course:', createError);
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
      setShowEditModal(false);
      setEditingCourse(null);
      await Promise.all([loadCourses({ silent: true }), loadStats()]);
      if (options?.openCurriculum) {
        openCurriculumStudio(response.data.slug);
      }
    } catch (updateError) {
      console.error('Failed to update course:', updateError);
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
      await Promise.all([loadCourses({ silent: true }), loadStats()]);

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
      setPendingDeleteCourseSlug(null);
      await Promise.all([loadCourses({ silent: true }), loadStats()]);
    } catch (deleteError) {
      console.error('Failed to delete course:', deleteError);
      setError('Failed to delete the course. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => COURSE_DIFFICULTY_COLORS[difficulty] || 'bg-gray-100 text-gray-800';
  const getCategoryColor = (category: string) => COURSE_CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800';

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

  const openCurriculumStudio = (courseSlug: string) => {
    router.push(`${cmsRouteBase}?course=${courseSlug}`);
  };

  if (loading && courses.length === 0) {
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
            onClick={() => void loadCourses({ silent: true })}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
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

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Courses" value={stats.totalCourses} icon={BookOpen} iconBgColor="bg-blue-100" iconColor="text-blue-600" />
        <StatsCard title="Avg. Duration" value={formatDuration(stats.averageDuration)} icon={Clock} iconBgColor="bg-green-100" iconColor="text-green-600" />
        <StatsCard title="Total Lessons" value={stats.totalLessons} icon={CheckCircle} iconBgColor="bg-purple-100" iconColor="text-purple-600" />
        <StatsCard title="Total Quizzes" value={stats.totalQuizzes} icon={BarChart3} iconBgColor="bg-orange-100" iconColor="text-orange-600" />
      </div>

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

      <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5 text-sm font-semibold text-gray-900">Course</div>
            <div className="col-span-2 text-sm font-semibold text-gray-900">Category</div>
            <div className="col-span-2 text-sm font-semibold text-gray-900">Duration</div>
            <div className="col-span-2 text-sm font-semibold text-gray-900">Details</div>
            <div className="col-span-1 text-sm font-semibold text-gray-900">Actions</div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {courses.map((course) => (
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

        {courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="mt-6 text-xl font-medium text-gray-900">No courses found</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        ) : null}

        <PaginationControls pagination={pagination} itemLabel="courses" onPageChange={setCurrentPage} />
      </div>

      {(showCreateModal || showEditModal) && (
        <CourseModal
          course={editingCourse}
          onSubmit={editingCourse ? (data, options) => handleUpdateCourse(editingCourse.slug, data, options) : handleCreateCourse}
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
