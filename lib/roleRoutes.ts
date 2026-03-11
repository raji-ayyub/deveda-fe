export function getRoleLoginRedirect(role?: string | null): string {
  if (role === 'Admin') {
    return '/admin/dashboard';
  }

  if (role === 'Instructor') {
    return '/instructor/dashboard';
  }

  return '/profile';
}

export function getRoleRegistrationRedirect(role?: string | null): string {
  if (role === 'Instructor') {
    return '/instructor/profile';
  }

  return getRoleLoginRedirect(role);
}

export function getRoleProfilePath(role?: string | null): string {
  if (role === 'Instructor') {
    return '/instructor/profile';
  }

  if (role === 'Admin') {
    return '/admin/dashboard/settings';
  }

  return '/profile';
}
