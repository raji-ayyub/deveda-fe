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
//     const storedUser = localStorage.getItem('user');
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
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//     } catch (error) {
//       console.error('Login failed:', error);
//       throw error;
//     }
//   };

//   const register = async (userData: any) => {
//     try {
//       const response = await authApi.register(userData);
//       setUser(response.data.user);
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//     } catch (error) {
//       console.error('Registration failed:', error);
//       throw error;
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('user');
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, role?: string) => Promise<void>;
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

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.login({ email, password });
      setUser(response.data);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, role?: string) => {
    setLoading(true);
    try {
      const response = await api.register({ email, password, firstName, lastName, role });
      setUser(response.data);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      const response = await api.updateUser(user.id, data);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};