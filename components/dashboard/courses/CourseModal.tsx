'use client';

import React, { useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { CourseCatalog } from '@/lib/types';

interface CourseModalProps {
  course: CourseCatalog | null;
  onSubmit: (data: any) => void;
  loading: boolean;
  onClose: () => void;
}

const CourseModal: React.FC<CourseModalProps> = ({ course, onSubmit, loading, onClose }) => {
  const [formData, setFormData] = useState({
    slug: course?.slug || '',
    title: course?.title || '',
    description: course?.description || '',
    category: course?.category || 'Programming',
    difficulty: course?.difficulty || 'Beginner',
    duration: course?.duration || 60,
    totalQuizzes: course?.totalQuizzes || 5,
    totalLessons: course?.totalLessons || 10,
    instructor: course?.instructor || '',
    prerequisites: course?.prerequisites || [],
    tags: course?.tags || [],
    thumbnail: course?.thumbnail || '',
  });

  const [newTag, setNewTag] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !formData.prerequisites.includes(newPrerequisite.trim())) {
      setFormData({
        ...formData,
        prerequisites: [...formData.prerequisites, newPrerequisite.trim()],
      });
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (prereq: string) => {
    setFormData({
      ...formData,
      prerequisites: formData.prerequisites.filter(p => p !== prereq),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-6 pt-6 pb-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {course ? 'Edit Course' : 'Create New Course'}
                </h3>
                <p className="text-gray-600 mt-1">
                  {course ? 'Update course details' : 'Add a new course to your catalog'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="intro-python"
                  />
                  <p className="mt-1 text-xs text-gray-500">Unique identifier for the course</p>
                </div>
                
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="Introduction to Python"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  required
                  placeholder="A comprehensive introduction to Python programming..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Programming">Programming</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Business">Business</option>
                    <option value="Design">Design</option>
                    <option value="Language">Language</option>
                  </select>
                </div>
                
                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                
                {/* Instructor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructor
                  </label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {/* Total Lessons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Lessons *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalLessons}
                    onChange={(e) => setFormData({ ...formData, totalLessons: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {/* Total Quizzes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Quizzes *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalQuizzes}
                    onChange={(e) => setFormData({ ...formData, totalQuizzes: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.thumbnail && (
                  <div className="mt-2">
                    <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={formData.thumbnail} 
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" font-family="Arial" font-size="12" fill="%239ca3af" text-anchor="middle" dy=".3em">No image</text></svg>';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a tag (e.g., python, programming)"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-12 p-2 border border-gray-200 rounded-lg bg-gray-50">
                  {formData.tags.length === 0 ? (
                    <span className="text-sm text-gray-400">No tags added yet</span>
                  ) : (
                    formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-full text-sm shadow-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-gray-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Prerequisites */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prerequisites
                </label>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={newPrerequisite}
                    onChange={(e) => setNewPrerequisite(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a prerequisite (e.g., basic-math)"
                  />
                  <button
                    type="button"
                    onClick={addPrerequisite}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-12 p-2 border border-gray-200 rounded-lg bg-gray-50">
                  {formData.prerequisites.length === 0 ? (
                    <span className="text-sm text-gray-400">No prerequisites required</span>
                  ) : (
                    formData.prerequisites.map((prereq, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {prereq}
                        <button
                          type="button"
                          onClick={() => removePrerequisite(prereq)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </form>
          </div>
          
          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse border-t border-gray-200">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-base font-medium text-white hover:opacity-90 focus:outline-none disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {course ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {course ? 'Update Course' : 'Create Course'}
                </>
              )}
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