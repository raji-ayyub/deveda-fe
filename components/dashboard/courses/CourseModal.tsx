'use client';

import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import CloudinaryUploadField from '@/components/CloudinaryUploadField';
import { CourseCatalog } from '@/lib/types';
import { COURSE_CATEGORIES, COURSE_DIFFICULTIES } from '@/lib/course-content';

interface CourseModalProps {
  course: CourseCatalog | null;
  onSubmit: (data: any, options?: { openCurriculum?: boolean }) => void;
  loading: boolean;
  onClose: () => void;
}

const CourseModal: React.FC<CourseModalProps> = ({ course, onSubmit, loading, onClose }) => {
  const [formData, setFormData] = useState({
    slug: course?.slug || '',
    title: course?.title || '',
    description: course?.description || '',
    category: course?.category || 'Frontend Development',
    difficulty: course?.difficulty || 'Beginner',
    duration: course?.duration || 60,
    totalQuizzes: course?.totalQuizzes || 5,
    totalLessons: course?.totalLessons || 10,
    instructor: course?.instructor || '',
    prerequisites: course?.prerequisites || [],
    tags: course?.tags || [],
    thumbnail: course?.thumbnail || '',
    thumbnailPublicId: course?.thumbnailPublicId || '',
  });

  const [newTag, setNewTag] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, { openCurriculum: true });
  };

  const submitWithOptions = (options?: { openCurriculum?: boolean }) => {
    onSubmit(formData, options);
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((item) => item !== tag) });
  };

  const addPrerequisite = () => {
    const prerequisite = newPrerequisite.trim();
    if (prerequisite && !formData.prerequisites.includes(prerequisite)) {
      setFormData({
        ...formData,
        prerequisites: [...formData.prerequisites, prerequisite],
      });
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (prerequisite: string) => {
    setFormData({
      ...formData,
      prerequisites: formData.prerequisites.filter((item) => item !== prerequisite),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-6 pt-6 pb-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{course ? 'Edit Course' : 'Create New Course'}</h3>
                <p className="text-gray-600 mt-1">
                  {course ? 'Update course details' : 'Add a coding course to the catalog'}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="frontend-development-beginner"
                  />
                  <p className="mt-1 text-xs text-gray-500">Unique identifier for the course</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="Frontend Development Intermediate"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  required
                  placeholder="Explain the coding concepts, stack, and level covered in this course."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {COURSE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {COURSE_DIFFICULTIES.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Deveda Frontend Team"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Lessons *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalLessons}
                    onChange={(e) => setFormData({ ...formData, totalLessons: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Quizzes *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalQuizzes}
                    onChange={(e) => setFormData({ ...formData, totalQuizzes: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <CloudinaryUploadField
                label="Course thumbnail"
                assetType="course"
                value={formData.thumbnail}
                publicId={formData.thumbnailPublicId}
                suggestedPublicId={`course-${formData.slug || 'draft'}-cover`}
                helperText="Upload a strong cover image for the course card and detail page."
                onChange={({ url, publicId }) => setFormData({ ...formData, thumbnail: url, thumbnailPublicId: publicId })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a tag (e.g. react, fastapi, systems-design)"
                  />
                  <button type="button" onClick={addTag} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-12 p-2 border border-gray-200 rounded-lg bg-gray-50">
                  {formData.tags.length === 0 ? (
                    <span className="text-sm text-gray-400">No tags added yet</span>
                  ) : (
                    formData.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-full text-sm shadow-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-gray-400 hover:text-red-500">
                          x
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prerequisites</label>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={newPrerequisite}
                    onChange={(e) => setNewPrerequisite(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a prerequisite slug (e.g. frontend-development-foundations)"
                  />
                  <button type="button" onClick={addPrerequisite} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-12 p-2 border border-gray-200 rounded-lg bg-gray-50">
                  {formData.prerequisites.length === 0 ? (
                    <span className="text-sm text-gray-400">No prerequisites required</span>
                  ) : (
                    formData.prerequisites.map((prerequisite) => (
                      <span key={prerequisite} className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {prerequisite}
                        <button type="button" onClick={() => removePrerequisite(prerequisite)} className="ml-2 text-blue-500 hover:text-blue-700">
                          x
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
                <h4 className="text-sm font-semibold text-blue-950">After saving this course</h4>
                <p className="mt-2 text-sm text-blue-900">
                  Open the curriculum studio to write lesson markup, add learning objectives, configure hands-on code workspaces, and use approved course-builder agent suggestions during lesson authoring.
                </p>
              </div>
            </form>
          </div>

          <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse border-t border-gray-200">
            <button
              type="button"
              onClick={() => submitWithOptions({ openCurriculum: true })}
              disabled={loading}
              className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-base font-medium text-white hover:opacity-90 focus:outline-none disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {course ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                <>{course ? 'Save + Open Studio' : 'Create + Open Studio'}</>
              )}
            </button>
            <button
              type="button"
              onClick={() => submitWithOptions({ openCurriculum: false })}
              disabled={loading}
              className="mt-3 sm:mt-0 sm:mr-3 w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none disabled:opacity-75"
            >
              {course ? 'Save Only' : 'Create Only'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none disabled:opacity-75"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;
