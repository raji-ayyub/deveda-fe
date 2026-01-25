// components/CourseCard.tsx
import { CourseCatalog } from '@/lib/types';
import { BookOpen, Clock, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface CourseCardProps {
  course: CourseCatalog;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 card-hover">
        {/* Course Thumbnail */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 relative">
          {course.thumbnail ? (
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-white/80" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(course.difficulty)}`}>
              {course.difficulty}
            </span>
          </div>
        </div>

        {/* Course Content */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
            </div>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{course.duration}h</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">{course.totalLessons} lessons</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">{course.totalQuizzes} quizzes</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span className="text-sm">{course.instructor}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {course.category}
            </span>
            {course.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
            {course.tags.length > 2 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                +{course.tags.length - 2}
              </span>
            )}
          </div>

          {/* Enroll Button */}
          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Enroll Now
          </button>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;