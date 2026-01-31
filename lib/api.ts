



// lib/api.ts
import { 
  User, UserCourse, QuizQuestion, QuizAttempt, 
  CourseCatalog, GameProgress, LoginCredentials,
  RegisterCredentials, QuizSubmission, CourseEnrollment,
  ApiResponse, RecentActivity, CourseWithDetails, QuestionWithDetails,AdminFilters, ChartData,AdminStats, UserWithDetails
} from './types';

// const API_BASE_URL = "https://deveda-be.onrender.com";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    const result = await this.handleResponse<User>(response);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', 'dummy-token'); // Replace with actual JWT
      localStorage.setItem('user', JSON.stringify(result.data));
    }
    
    return result;
  }

  async register(credentials: RegisterCredentials): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    const result = await this.handleResponse<User>(response);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', 'dummy-token');
      localStorage.setItem('user', JSON.stringify(result.data));
    }
    
    return result;
  }

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.token = null;
  }

  // User endpoints
  async getCurrentUser(): Promise<User | null> {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  async getUserProfile(userId: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateUser(userId: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<User>(response);
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(response);
  }


  // Course endpoints
  async getCourseCatalog(params?: {
    category?: string;
    difficulty?: string;
    search?: string;
  }): Promise<ApiResponse<CourseCatalog[]>> {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${API_BASE_URL}/courses/catalog${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<CourseCatalog[]>(response);
  }

  async enrollCourse(userId: string, enrollment: CourseEnrollment): Promise<ApiResponse<UserCourse>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/courses`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(enrollment),
    });
    return this.handleResponse<UserCourse>(response);
  }

  async getUserCourses(userId: string): Promise<ApiResponse<UserCourse[]>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/courses`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<UserCourse[]>(response);
  }

  async updateCourseProgress(
    userId: string, 
    courseSlug: string, 
    progress: number, 
    completed?: boolean
  ): Promise<ApiResponse<UserCourse>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/courses/${courseSlug}/progress`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ progress, completed }),
    });
    return this.handleResponse<UserCourse>(response);
  }



  async createCourseCatalog(payload: any): Promise<ApiResponse<CourseCatalog>> {
    const response = await fetch(`${API_BASE_URL}/courses/catalog`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<CourseCatalog>(response);
  }

  async updateCourseCatalog(slug: string, payload: any): Promise<ApiResponse<CourseCatalog>> {
    const response = await fetch(`${API_BASE_URL}/courses/catalog/${slug}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<CourseCatalog>(response);
  }

  async deleteCourseCatalog(slug: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/courses/catalog/${slug}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(response);
  }

  async getCourseCatalogStats(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/courses/catalog/stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(response);
  }



  async getCoursesWithDetails(filters?: AdminFilters): Promise<ApiResponse<CourseWithDetails[]>> {
  const queryParams = new URLSearchParams(filters as any).toString();
  const url = `${API_BASE_URL}/courses${queryParams ? `?${queryParams}` : ''}`;
  
  const response = await fetch(url, {
    headers: this.getHeaders(),
  });
  return this.handleResponse<CourseWithDetails[]>(response);
}


async getCourseBySlug(slug: string): Promise<ApiResponse<CourseCatalog>> {
  const response = await fetch(`${API_BASE_URL}/courses/catalog/${slug}`, {
    headers: this.getHeaders(),
  });
  return this.handleResponse<CourseCatalog>(response);
}






async getCourseEnrollments(courseSlug: string, limit: number = 10): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/courses/${courseSlug}/enrollments?limit=${limit}`, {
    headers: this.getHeaders(),
  });
  return this.handleResponse<any>(response);
}







  // Quiz endpoints

  async createQuizQuestion(payload: any): Promise<ApiResponse<QuizQuestion>> {
    const response = await fetch(`${API_BASE_URL}/quizzes/${payload.quizId}/questions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<QuizQuestion>(response);
  }


  async updateQuizQuestion(questionId: string, payload: any): Promise<ApiResponse<QuizQuestion>> {
    const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<QuizQuestion>(response);
  }



  async deleteQuizQuestion(questionId: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(response);
  }




  async getQuizQuestions(quizId: string): Promise<ApiResponse<QuizQuestion[]>> {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/questions`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<QuizQuestion[]>(response);
  }

  async getQuizzes(): Promise<ApiResponse<{id: string; title: string}[]>> {
    const response = await fetch(`${API_BASE_URL}/quizzes`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{id: string; title: string}[]>(response);
  }

  async getAllQuizQuestions(): Promise<ApiResponse<QuizQuestion[]>> {
    const response = await fetch(`${API_BASE_URL}/quizzes/questions/all`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<QuizQuestion[]>(response);
  }

  async submitQuizAttempt(
    userId: string, 
    submission: QuizSubmission
  ): Promise<ApiResponse<QuizAttempt>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/quizzes/attempt`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(submission),
    });
    return this.handleResponse<QuizAttempt>(response);
  }

  async getUserQuizAttempts(userId: string): Promise<ApiResponse<QuizAttempt[]>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/quizzes`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<QuizAttempt[]>(response);
  }

  // Game endpoints
  async getGameProgress(userId: string): Promise<ApiResponse<GameProgress[]>> {
    // Note: This endpoint doesn't exist in your backend yet
    // You might need to add it or adjust
    const response = await fetch(`${API_BASE_URL}/users/${userId}/games`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<GameProgress[]>(response);
  }





  // lib/api.ts - Add these methods to the ApiService class

// Admin endpoints
async getAdminStats(): Promise<ApiResponse<AdminStats>> {
  const response = await fetch(`${API_BASE_URL}/stats`, {
    headers: this.getHeaders(),
  });
  return this.handleResponse<AdminStats>(response);
}

async getUsersWithDetails(filters?: AdminFilters): Promise<ApiResponse<UserWithDetails[]>> {
  const queryParams = new URLSearchParams(filters as any).toString();
  const url = `${API_BASE_URL}/users${queryParams ? `?${queryParams}` : ''}`;
  
  const response = await fetch(url, {
    headers: this.getHeaders(),
  });
  return this.handleResponse<UserWithDetails[]>(response);
}

async getQuestionsWithDetails(filters?: AdminFilters): Promise<ApiResponse<QuestionWithDetails[]>> {
  const queryParams = new URLSearchParams(filters as any).toString();
  const url = `${API_BASE_URL}/questions${queryParams ? `?${queryParams}` : ''}`;
  
  const response = await fetch(url, {
    headers: this.getHeaders(),
  });
  return this.handleResponse<QuestionWithDetails[]>(response);
}







async createQuestion(payload: any): Promise<ApiResponse<QuestionWithDetails>> {
  const response = await fetch(`${API_BASE_URL}/questions`, {
    method: 'POST',
    headers: this.getHeaders(),
    body: JSON.stringify(payload),
  });
  return this.handleResponse<QuestionWithDetails>(response);
}

async updateQuestion(questionId: string, payload: any): Promise<ApiResponse<QuestionWithDetails>> {
  const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
    method: 'PUT',
    headers: this.getHeaders(),
    body: JSON.stringify(payload),
  });
  return this.handleResponse<QuestionWithDetails>(response);
}

async deleteQuestion(questionId: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
    method: 'DELETE',
    headers: this.getHeaders(),
  });
  return this.handleResponse<void>(response);
}

async updateCourse(courseId: string, payload: any): Promise<ApiResponse<CourseWithDetails>> {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    method: 'PUT',
    headers: this.getHeaders(),
    body: JSON.stringify(payload),
  });
  return this.handleResponse<CourseWithDetails>(response);
}

async deleteCourse(courseId: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    method: 'DELETE',
    headers: this.getHeaders(),
  });
  return this.handleResponse<void>(response);
}

async updateUserStatus(userId: string, isActive: boolean): Promise<ApiResponse<User>> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
    method: 'PATCH',
    headers: this.getHeaders(),
    body: JSON.stringify({ isActive }),
  });
  return this.handleResponse<User>(response);
}

async getRecentActivity(): Promise<ApiResponse<RecentActivity[]>> {
  const response = await fetch(`${API_BASE_URL}/activity`, {
    headers: this.getHeaders(),
  });
  return this.handleResponse<RecentActivity[]>(response);
}

async getChartData(period: string = '7d'): Promise<ApiResponse<ChartData>> {
  const response = await fetch(`${API_BASE_URL}/charts?period=${period}`, {
    headers: this.getHeaders(),
  });
  return this.handleResponse<ChartData>(response);
}
}







export const api = new ApiService();