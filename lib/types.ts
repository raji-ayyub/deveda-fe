// lib/types.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export interface AuthResponse {
  message: string;
  data: {
    user: User;
  };
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: number;
  text: string;
  author: string;
  role: string;
  initials: string;
}

export interface ColorPalette {
  name: string;
  description: string;
  colors: string[];
}

export interface Profile {
  name: string;
  role: string;
  image: string;
  skills: string[];
  progress: {
    label: string;
    value: number;
  }[];
}









