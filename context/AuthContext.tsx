// // context/AuthContext.tsx
// 'use client';

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { authApi } from '@/lib/api';
// import { User } from '@/lib/types';

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string) => Promise<void>;
//   register: (userData: any) => Promise<void>;
//   logout: () => void;
//   isLoading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Check for stored user session
//     const storedUser = sessionStorage.getItem('user');
//     if (storedUser) {
//       try {
//         setUser(JSON.parse(storedUser));
//       } catch (error) {
//         console.error('Failed to parse stored user:', error);
//       }
//     }
//     setIsLoading(false);
//   }, []);

//   const login = async (email: string, password: string) => {
//     try {
//       const response = await authApi.login({ email, password });
//       setUser(response.data.user);
//       sessionStorage.setItem('user', JSON.stringify(response.data.user));
//     } catch (error) {
//       console.error('Login failed:', error);
//       throw error;
//     }
//   };

//   const register = async (userData: any) => {
//     try {
//       const response = await authApi.register(userData);
//       setUser(response.data.user);
//       sessionStorage.setItem('user', JSON.stringify(response.data.user));
//     } catch (error) {
//       console.error('Registration failed:', error);
//       throw error;
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     sessionStorage.removeItem('user');
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };






// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { api } from '@/lib/api';

const AUTH_USER_SNAPSHOT_KEY = 'deveda_auth_user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, firstName: string, lastName: string, role?: string) => Promise<User>;
  registerPrivateAdmin: (email: string, password: string, firstName: string, lastName: string, adminSetupSecret: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStoredUserSnapshot = (): User | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    const snapshot = window.sessionStorage.getItem(AUTH_USER_SNAPSHOT_KEY);
    if (!snapshot) {
      return null;
    }

    try {
      return JSON.parse(snapshot) as User;
    } catch (error) {
      console.error('Failed to parse stored auth snapshot:', error);
      window.sessionStorage.removeItem(AUTH_USER_SNAPSHOT_KEY);
      return null;
    }
  };

  const persistUserSnapshot = (nextUser: User | null) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (nextUser) {
      window.sessionStorage.setItem(AUTH_USER_SNAPSHOT_KEY, JSON.stringify(nextUser));
      return;
    }

    window.sessionStorage.removeItem(AUTH_USER_SNAPSHOT_KEY);
  };

  const applyUser = (nextUser: User | null) => {
    setUser(nextUser);
    persistUserSnapshot(nextUser);
  };

  useEffect(() => {
    const storedUser = loadStoredUserSnapshot();
    if (storedUser) {
      setUser(storedUser);
      setLoading(false);
    }

    const loadUser = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        applyUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
        if (!storedUser) {
          applyUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.login({ email, password });
      applyUser(response.data.user);
      return response.data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, role?: string) => {
    setLoading(true);
    try {
      const response = await api.register({ email, password, firstName, lastName, role });
      applyUser(response.data.user);
      return response.data.user;
    } finally {
      setLoading(false);
    }
  };

  const registerPrivateAdmin = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    adminSetupSecret: string
  ) => {
    setLoading(true);
    try {
      const response = await api.registerPrivateAdmin({ email, password, firstName, lastName, adminSetupSecret });
      applyUser(response.data.user);
      return response.data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
      applyUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      const response = await api.updateUser(user.id, data);
      applyUser(response.data);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, registerPrivateAdmin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
