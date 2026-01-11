// components/dashboard/DashboardLayout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FaHome,
  FaChartBar,
  FaBook,
  FaQuestionCircle,
  FaUsers,
  FaCog,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaGamepad,
  FaPalette,
  FaLayerGroup
} from 'react-icons/fa';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor';

  // Navigation items based on user role
  const navItems = [
    { href: '/dashboard', icon: <FaHome />, label: 'Overview', visible: true },
    { href: '/dashboard/courses', icon: <FaBook />, label: 'Courses', visible: true },
    { href: '/dashboard/quizzes', icon: <FaQuestionCircle />, label: 'Quizzes', visible: true },
    { href: '/dashboard/games', icon: <FaGamepad />, label: 'Games', visible: true },
    { href: '/dashboard/creative', icon: <FaPalette />, label: 'Creative Lab', visible: true },
    { href: '/dashboard/layout', icon: <FaLayerGroup />, label: 'Layout Practice', visible: true },
    { href: '/dashboard/analytics', icon: <FaChartBar />, label: 'Analytics', visible: isAdmin || isInstructor },
    { href: '/dashboard/users', icon: <FaUsers />, label: 'Users', visible: isAdmin },
    { href: '/dashboard/settings', icon: <FaCog />, label: 'Settings', visible: true },
  ];

  const notifications = [
    { id: 1, text: 'New quiz available: Advanced CSS', time: '2 hours ago' },
    { id: 2, text: 'You completed HTML Basics course', time: '1 day ago' },
    { id: 3, text: 'New message from instructor', time: '2 days ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-500 lg:hidden hover:text-gray-700"
              >
                {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
              <div className="hidden lg:flex items-center ml-4">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                    <FaBook className="text-white text-sm" />
                  </div>
                  <span className="text-xl font-bold text-dark">CodeCraft</span>
                </Link>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-gray-500 hover:text-primary relative"
                >
                  <FaBell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-dark">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notification => (
                        <div key={notification.id} className="p-4 hover:bg-gray-50 border-b border-gray-100">
                          <p className="text-sm text-gray-800">{notification.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <Link href="/dashboard/notifications" className="text-sm text-primary hover:underline">
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative">
                <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block">
                  <div className="p-2">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <FaUserCircle /> Your Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      <FaSignOutAlt /> Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar for desktop */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block lg:w-64 bg-white border-r border-gray-200 fixed lg:static h-full z-40`}>
          <div className="h-full overflow-y-auto">
            {/* Logo for mobile sidebar */}
            <div className="p-4 lg:hidden border-b border-gray-200">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <FaBook className="text-white text-sm" />
                </div>
                <span className="text-xl font-bold text-dark">CodeCraft</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
              {navItems
                .filter(item => item.visible)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      pathname === item.href
                        ? 'bg-primary/10 text-primary border-l-4 border-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
            </nav>

            {/* User progress (for students) */}
            {user?.role === 'student' && (
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Your Progress</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">HTML Course</span>
                      <span className="text-primary font-semibold">65%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">CSS Mastery</span>
                      <span className="text-primary font-semibold">42%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}