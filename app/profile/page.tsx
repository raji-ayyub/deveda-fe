// app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import { User } from '@/lib/types';

export default function ProfilePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await authApi.getUsers();
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-white text-xl">Loading profiles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  const displayUsers = users.slice(0, 6); // Show only first 6 users

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Header */}
      <header className="bg-gray-900 py-6 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-accent">
            <a href="/">DevTribe</a>
          </h1>
          <nav className="flex gap-6">
            <a href="/layout-demo" className="text-gray-300 hover:text-accent transition-colors">
              Layout Practice
            </a>
            <a href="/games" className="text-gray-300 hover:text-accent transition-colors">
              Games
            </a>
            <a href="/about" className="text-gray-300 hover:text-accent transition-colors">
              About Us
            </a>
            <a href="/profile" className="text-accent font-semibold">
              Profiles
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-gray-900 to-dark">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-accent">
            Meet Our Tribe Members
          </h2>
          <p className="text-xl text-gray-300">
            Every member has a unique journey. Here's a glimpse into what we're learning and building.
          </p>
          <p className="mt-4 text-gray-400">
            {users.length} registered developers in our community
          </p>
        </div>
      </section>

      {/* Profiles Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayUsers.map((user, index) => {
              // Generate initials for avatar
              const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
              
              // Generate random progress values based on user data
              const skillLevel = (user.email.length % 5) + 3; // Just for demo
              
              return (
                <div key={user.id} className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-colors">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                    {initials}
                  </div>
                  
                  {/* User Info */}
                  <h3 className="text-xl font-bold text-white text-center mb-2">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-gray-400 text-center mb-4">
                    {user.role === 'User' ? 'Developer' : user.role} • {user.isActive ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-gray-300 text-center text-sm mb-6">
                    {user.email}
                  </p>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'].slice(0, skillLevel).map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  {/* Progress Bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Frontend Skills</span>
                        <span className="text-accent">{Math.min(20 + index * 15, 95)}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${Math.min(20 + index * 15, 95)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Backend Skills</span>
                        <span className="text-accent">{Math.min(10 + index * 12, 85)}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${Math.min(10 + index * 12, 85)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Project Contribution</span>
                        <span className="text-accent">{Math.min(5 + index * 10, 75)}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-success rounded-full"
                          style={{ width: `${Math.min(5 + index * 10, 75)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Community Stats */}
          <div className="mt-16 bg-gray-900 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-accent">Community Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">{users.length}</div>
                <div className="text-gray-400">Total Members</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary mb-2">{users.filter(u => u.isActive).length}</div>
                <div className="text-gray-400">Active Developers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-success mb-2">
                  {users.filter(u => u.role !== 'User').length}
                </div>
                <div className="text-gray-400">Mentors & Guides</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-warning mb-2">
                  {Math.round(users.reduce((acc, u) => acc + (u.email.length % 10), 0) / users.length)}
                </div>
                <div className="text-gray-400">Avg. Skill Level</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8 text-center">
        <div className="container mx-auto px-4">
          <p className="text-gray-500">
            © {new Date().getFullYear()} DevTribe Collective — Growing Together
          </p>
        </div>
      </footer>
    </div>
  );
}