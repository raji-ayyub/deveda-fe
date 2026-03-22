'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  Bot,
  ChevronDown,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Menu,
  Settings,
  Shield,
  User,
  Users,
  X,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { getRoleLoginRedirect, getRoleProfilePath } from '@/lib/roleRoutes';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const profileHref = getRoleProfilePath(user?.role);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', current: pathname === '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Users', href: '/admin/dashboard/users', current: pathname.startsWith('/admin/dashboard/users'), icon: <Users className="h-5 w-5" /> },
    { name: 'Courses', href: '/admin/dashboard/courses', current: pathname.startsWith('/admin/dashboard/courses'), icon: <BookOpen className="h-5 w-5" /> },
    { name: 'Lessons', href: '/admin/dashboard/lessons', current: pathname.startsWith('/admin/dashboard/lessons'), icon: <LibraryBig className="h-5 w-5" /> },
    { name: 'Quizzes', href: '/admin/dashboard/quizzes', current: pathname.startsWith('/admin/dashboard/quizzes'), icon: <HelpCircle className="h-5 w-5" /> },
    { name: 'Questions', href: '/admin/dashboard/questions', current: pathname.startsWith('/admin/dashboard/questions'), icon: <FileText className="h-5 w-5" /> },
    { name: 'Curriculum', href: '/admin/dashboard/cms', current: pathname.startsWith('/admin/dashboard/cms'), icon: <LibraryBig className="h-5 w-5" /> },
    { name: 'Analytics', href: '/admin/dashboard/analytics', current: pathname.startsWith('/admin/dashboard/analytics'), icon: <BarChart3 className="h-5 w-5" /> },
    { name: 'Agents', href: '/admin/dashboard/agents', current: pathname.startsWith('/admin/dashboard/agents'), icon: <Bot className="h-5 w-5" /> },
    { name: 'Settings', href: '/admin/dashboard/settings', current: pathname.startsWith('/admin/dashboard/settings'), icon: <Settings className="h-5 w-5" /> },
  ];

  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl">
          <Shield className="mx-auto h-14 w-14 text-slate-300" />
          <h1 className="mt-4 text-2xl font-bold text-slate-950">Admin sign-in required</h1>
          <p className="mt-2 text-sm text-slate-600">This workspace is only available after signing in with an admin account.</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="mt-6 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Open admin login
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== 'Admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl">
          <GraduationCap className="mx-auto h-14 w-14 text-slate-300" />
          <h1 className="mt-4 text-2xl font-bold text-slate-950">Admin access only</h1>
          <p className="mt-2 text-sm text-slate-600">
            This area is reserved for admin accounts. Your current account should use its own workspace instead.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => router.push(getRoleLoginRedirect(user.role))}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Open my workspace
            </button>
            <button
              onClick={() => router.push('/')}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Return home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eff6ff_100%)]">
      <div className={`fixed inset-0 z-40 bg-slate-950/40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white shadow-xl transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Admin hub</div>
            <div className="mt-1 text-2xl font-black text-slate-950">Deveda</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <nav className="space-y-1 px-4 py-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                item.current ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 p-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="text-sm font-semibold text-slate-950">{user.firstName} {user.lastName}</div>
            <div className="text-xs text-slate-500">{user.role}</div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="rounded-xl border border-slate-200 p-2 lg:hidden">
                <Menu className="h-5 w-5 text-slate-700" />
              </button>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Operations workspace</div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">Admin dashboard</h1>
              </div>
            </div>

            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen((current) => !current)}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <Link href={profileHref} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link href="/settings" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Settings className="h-4 w-4" />
                    Account settings
                  </Link>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
