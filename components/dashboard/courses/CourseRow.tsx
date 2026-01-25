'use client';

import React from 'react';
import { Edit, Trash2, Eye, Clock, User, Calendar, Loader2 } from 'lucide-react';
import { CourseCatalog } from '@/lib/types';

interface CourseRowProps {
  course: CourseCatalog;
  onEdit: (course: CourseCatalog) => void;
  onDelete: (courseSlug: string) => void;
  actionLoading: string | null;
  getDifficultyColor: (difficulty: string) => string;
  getCategoryColor: (category: string) => string;
  formatDuration: (minutes: number) => string;
}

const CourseRow: React.FC<CourseRowProps> = ({
  course,
  onEdit,
  onDelete,
  actionLoading,
  getDifficultyColor,
  getCategoryColor,
  formatDuration,
}) => {
  return (
    <div key={course.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Course Info */}
        <div className="col-span-5">
          <div className="flex items-start">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 overflow-hidden">
              {course.thumbnail ? (
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xl">
                  {course.title.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-gray-900 truncate">{course.title}</h4>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
              <div className="flex items-center mt-2 space-x-2">
                <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
                <span className="text-xs text-gray-500 flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {course.instructor || 'TBA'}
                </span>
                <span className="text-xs text-gray-500 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(course.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {course.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {course.tags.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{course.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="col-span-2">
          <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${getCategoryColor(course.category)}`}>
            {course.category}
          </span>
        </div>

        {/* Duration */}
        <div className="col-span-2">
          <div className="space-y-1">
            <div className="flex items-center text-gray-700">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">{formatDuration(course.duration)}</span>
            </div>
            <div className="text-xs text-gray-500">
              {course.totalLessons} lessons • {course.totalQuizzes} quizzes
            </div>
          </div>
        </div>

        {/* Prerequisites */}
        <div className="col-span-2">
          {course.prerequisites.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Prerequisites:</p>
              <div className="flex flex-wrap gap-1">
                {course.prerequisites.slice(0, 2).map((prereq, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded"
                  >
                    {prereq}
                  </span>
                ))}
                {course.prerequisites.length > 2 && (
                  <span className="text-xs text-blue-600">
                    +{course.prerequisites.length - 2}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-sm text-gray-400">No prerequisites</span>
          )}
        </div>

        {/* Actions */}
        <div className="col-span-1">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(course)}
              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
              disabled={actionLoading?.startsWith('edit')}
            >
              {actionLoading === `edit-${course.id}` ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <Edit className="w-4 h-4 text-gray-500 hover:text-blue-600" />
              )}
            </button>
            <button
              onClick={() => onDelete(course.slug)}
              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
              disabled={actionLoading?.startsWith('delete')}
            >
              {actionLoading === `delete-${course.slug}` ? (
                <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
              )}
            </button>
            <a
              href={`/courses/${course.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4 text-gray-500 hover:text-gray-700" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseRow;