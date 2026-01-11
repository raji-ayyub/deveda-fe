// components/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FaCode, FaBars, FaTimes } from 'react-icons/fa';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Layout Demo', href: '/layout-demo' },
    { name: 'Coding Quiz', href: '/quiz' },
    { name: 'Games', href: '/games' },
    { name: 'Color Harmony', href: '/creative' },
    { name: 'About', href: '/about' },
    { name: 'Profiles', href: '/profile' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <FaCode className="text-2xl text-primary" />
            <span className="text-xl font-bold text-primary">CodeCraft</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-dark font-medium hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-dark">Welcome, {user.firstName}</span>
                <button onClick={logout} className="btn-outline">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-outline">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-dark text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-dark font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-4 mt-4 pt-4 border-t">
              {user ? (
                <>
                  <span className="text-dark">Welcome, {user.firstName}</span>
                  <button onClick={logout} className="btn-outline w-full">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-outline w-full text-center">
                    Sign In
                  </Link>
                  <Link href="/register" className="btn-primary w-full text-center">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}