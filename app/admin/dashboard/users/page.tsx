
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { UserWithDetails } from '@/lib/types';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  BookOpen,
  TrendingUp,
  Download,
  Plus,
  RefreshCw,
  Users
} from 'lucide-react';

const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getUsersWithDetails();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.updateUserStatus(userId, !currentStatus);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      ));
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    const pageUsers = getCurrentPageUsers();
    if (selectedUsers.length === pageUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(pageUsers.map(user => user.id));
    }
  };

  const getCurrentPageUsers = () => {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const pageUsers = getCurrentPageUsers();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage users, permissions, and access levels</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Instructor">Instructor</option>
            <option value="Student">Student</option>
            <option value="User">User</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={loadUsers}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedUsers.length === pageUsers.length && pageUsers.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="ml-4 grid grid-cols-12 gap-4 flex-1">
              <div className="col-span-3 text-sm font-semibold text-gray-900">User</div>
              <div className="col-span-2 text-sm font-semibold text-gray-900">Role</div>
              <div className="col-span-2 text-sm font-semibold text-gray-900">Courses</div>
              <div className="col-span-2 text-sm font-semibold text-gray-900">Joined</div>
              <div className="col-span-2 text-sm font-semibold text-gray-900">Status</div>
              <div className="col-span-1 text-sm font-semibold text-gray-900">Actions</div>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {pageUsers.map((user) => (
            <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => toggleSelectUser(user.id)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="ml-4 grid grid-cols-12 gap-4 flex-1 items-center">
                  {/* User Info */}
                  <div className="col-span-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-semibold text-sm">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="col-span-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'Instructor' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'Student' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  {/* Courses */}
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium">{user.coursesCount || 0}</span>
                      <span className="text-sm text-gray-500 ml-1">courses</span>
                    </div>
                  </div>

                  {/* Joined Date */}
                  <div className="col-span-2">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        user.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className={`font-medium ${
                        user.isActive ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? (
                          <UserX className="w-4 h-4 text-gray-500 hover:text-red-600" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-gray-500 hover:text-green-600" />
                        )}
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                        <Edit className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto" />
            <p className="mt-4 text-gray-500">No users found</p>
          </div>
        )}

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * usersPerPage) + 1} to{' '}
                {Math.min(currentPage * usersPerPage, filteredUsers.length)} of{' '}
                {filteredUsers.length} users
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    if (totalPages <= 5) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded text-sm ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {selectedUsers.length} users selected
            </span>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Export Selected
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
              Activate All
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
              Delete All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagementPage;