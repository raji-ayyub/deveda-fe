// app/dashboard/users/page.tsx
'use client';

import { useState } from 'react';
import {
  FaSearch,
  FaFilter,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaLock,
  FaUnlock,
} from 'react-icons/fa';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark">User Management</h1>
          <p className="text-gray-600">Manage all users and their permissions</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
          <FaUserPlus /> Add User
        </button>
      </div>
      {/* Add user management table and controls */}
    </div>
  );
}