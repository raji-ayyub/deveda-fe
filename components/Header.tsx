


// components/Header.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, User, LogOut, Home, BookOpen, Trophy, FileCode2, Info, Settings, Bot } from 'lucide-react';
import { getRoleProfilePath } from '@/lib/roleRoutes';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const profileHref = getRoleProfilePath(user?.role);
  const agentHref = user?.role === 'Admin' ? '/admin/dashboard/agents' : '/agents';

  const navigation = [
    { name: 'Home', href: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Courses', href: '/courses', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Quizzes', href: '/quiz', icon: <Trophy className="w-5 h-5" /> },
    { name: 'Lessons', href: '/lessons', icon: <FileCode2 className="w-5 h-5" /> },
    { name: 'About', href: '/about', icon: <Info className="w-5 h-5" /> },
  ];

  const hideOnWorkspaceRoute =
    pathname.startsWith('/admin/dashboard') ||
    pathname.startsWith('/instructor/dashboard') ||
    pathname === '/admin/login' ||
    pathname === '/admin/setup' ||
    /^\/courses\/[^/]+\/learn$/.test(pathname);

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (hideOnWorkspaceRoute) {
    return null;
  }

  return (
    <nav ref={navRef} className="bg-white shadow-sm sticky top-0 z-[9999]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex min-w-0 items-center">
            <Link href="/" className="flex min-w-0 items-center space-x-2">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 sm:h-10 sm:w-10">
                <span className="text-lg font-bold text-white sm:text-xl">D</span>
              </div>
              <span className="truncate bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                Deveda
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Profile / Auth */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen((current) => !current);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 sm:h-10 sm:w-10">
                    <span className="text-white font-semibold">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200 z-[9999]">
                    <Link
                      href={profileHref}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href={agentHref}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Bot className="w-4 h-4" />
                      <span>Agent Hub</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center space-x-3 sm:flex">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => {
                setIsMenuOpen((current) => !current);
                setIsProfileDropdownOpen(false);
              }}
              className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-50 hover:text-blue-600 md:hidden"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 font-medium flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
              {!user && (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-center text-sm font-medium text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
