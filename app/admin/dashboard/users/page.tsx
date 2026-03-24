'use client';

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Calendar,
  Download,
  Edit,
  Mail,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
} from 'lucide-react';

import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import PaginationControls from '@/components/ui/PaginationControls';
import { api } from '@/lib/api';
import { PaginationMeta, UserWithDetails } from '@/lib/types';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

const PAGE_SIZE = 10;

const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [pageError, setPageError] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Instructor',
  });

  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    void loadUsers();
  }, [currentPage, debouncedSearchTerm, roleFilter, statusFilter]);

  const loadUsers = async (options?: { silent?: boolean }) => {
    try {
      if (options?.silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setPageError('');
      const response = await api.getUsersWithDetails({
        search: debouncedSearchTerm || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: currentPage,
        pageSize: PAGE_SIZE,
      });
      setUsers(response.data);
      setPagination(response.pagination);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to load users:', error);
      setPageError('Unable to load users right now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.updateUserStatus(userId, !currentStatus);
      await loadUsers({ silent: true });
    } catch (error) {
      console.error('Failed to update user status:', error);
      setPageError('Unable to update the selected user right now.');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      setDeleteUserId(null);
      await loadUsers({ silent: true });
    } catch (error) {
      console.error('Failed to delete user:', error);
      setPageError('Unable to delete the selected user right now.');
    }
  };

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateError('');

    try {
      setCreatingUser(true);
      await api.createUser({
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        email: createForm.email.trim().toLowerCase(),
        password: createForm.password,
        role: createForm.role,
      });

      setShowCreateModal(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'Instructor',
      });
      setCurrentPage(1);
      await loadUsers({ silent: true });
    } catch (error: any) {
      setCreateError(error.message || 'Failed to create user.');
    } finally {
      setCreatingUser(false);
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  if (loading && users.length === 0) {
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Instructor">Instructor</option>
            <option value="Student">Student</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={() => void loadUsers({ silent: true })}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {pageError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{pageError}</div> : null}
      <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedUsers.length === users.length && users.length > 0}
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

        <div className="divide-y divide-gray-200">
          {users.map((user) => (
            <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => toggleSelectUser(user.id)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="ml-4 grid grid-cols-12 gap-4 flex-1 items-center">
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

                  <div className="col-span-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        user.role === 'Admin'
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'Instructor'
                          ? 'bg-blue-100 text-blue-800'
                          : user.role === 'Student'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium">{user.coursesCount || 0}</span>
                      <span className="text-sm text-gray-500 ml-1">courses</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={`font-medium ${user.isActive ? 'text-green-700' : 'text-red-700'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => void toggleUserStatus(user.id, user.isActive)}
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
                      <button onClick={() => setDeleteUserId(user.id)} className="p-1 hover:bg-gray-100 rounded" title="Delete">
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

        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto" />
            <p className="mt-4 text-gray-500">No users found</p>
          </div>
        ) : null}

        <PaginationControls pagination={pagination} itemLabel="users" onPageChange={setCurrentPage} />
      </div>

      {selectedUsers.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{selectedUsers.length} users selected</span>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Export Selected</button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Activate All</button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete All</button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-300">
            <div className="flex items-center justify-between border-b border-slate-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_50%,#eef2ff_100%)] px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-slate-950">Create staff or learner account</h3>
                <p className="mt-1 text-sm text-slate-600">Use this for instructors, admins, and managed student accounts.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-5 px-6 py-6">
              {createError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{createError}</div> : null}

              <div className="grid gap-4 md:grid-cols-2">
                <ModalField label="First name" value={createForm.firstName} onChange={(value) => setCreateForm((current) => ({ ...current, firstName: value }))} />
                <ModalField label="Last name" value={createForm.lastName} onChange={(value) => setCreateForm((current) => ({ ...current, lastName: value }))} />
                <ModalField label="Email" type="email" value={createForm.email} onChange={(value) => setCreateForm((current) => ({ ...current, email: value }))} />
                <ModalField label="Password" type="password" value={createForm.password} onChange={(value) => setCreateForm((current) => ({ ...current, password: value }))} />
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Role</label>
                  <select
                    value={createForm.role}
                    onChange={(event) => setCreateForm((current) => ({ ...current, role: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="Instructor">Instructor</option>
                    <option value="Student">Student</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button type="button" onClick={() => setShowCreateModal(false)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                  Cancel
                </button>
                <button type="submit" disabled={creatingUser} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">
                  {creatingUser ? 'Creating...' : 'Create account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={Boolean(deleteUserId)}
        title="Delete user"
        description="This will remove the user account and the related learning records tied to it. This action cannot be undone."
        confirmLabel="Delete user"
        onCancel={() => setDeleteUserId(null)}
        onConfirm={() => {
          if (deleteUserId) {
            void deleteUser(deleteUserId);
          }
        }}
      />
    </div>
  );
};

function ModalField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        required
      />
    </div>
  );
}

export default UsersManagementPage;
