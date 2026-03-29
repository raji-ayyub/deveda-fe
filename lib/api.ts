import {
  AgentActionPayload,
  AgentApprovalPayload,
  AgentAssignment,
  AgentArtifact,
  AgentMessage,
  AgentMessagePayload,
  AgentTemplate,
  AgentThread,
  AgentThreadDetail,
  AgentThreadPayload,
  AgentRequestPayload,
  AdminFilters,
  AdminStats,
  ApiResponse,
  AuthSession,
  ChartData,
  CloudinaryUploadSignature,
  ContentGenerationSession,
  ContentIngestionResult,
  CourseCatalog,
  CourseCurriculum,
  CourseEnrollment,
  CourseProgressResponse,
  CourseWithDetails,
  LoginCredentials,
  LessonLibraryItem,
  PasswordChangePayload,
  PaginatedApiResponse,
  PrivateAdminRegistration,
  QuestionWithDetails,
  QuizAttempt,
  QuizQuestion,
  QuizSubmission,
  QuizWithDetails,
  RecentActivity,
  RegisterCredentials,
  User,
  UserAchievement,
  UserCourse,
  UserWithDetails,
  QuizAttemptSubmission,
} from './types';

const API_BASE_URL = 'https://deveda-be.onrender.com';


class ApiService {
  private token: string | null = null;
  private currentUser: User | null = null;

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private getUploadHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  private apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
    return fetch(input, {
      credentials: 'include',
      ...init,
    });
  }

  private isUserPayload(payload: unknown): payload is User {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const candidate = payload as Record<string, unknown>;
    return (
      typeof candidate.id === 'string' &&
      typeof candidate.email === 'string' &&
      typeof candidate.firstName === 'string' &&
      typeof candidate.lastName === 'string'
    );
  }

  private normalizeAuthSession(payload: unknown): AuthSession {
    if (payload && typeof payload === 'object') {
      const candidate = payload as Record<string, unknown>;
      if (this.isUserPayload(candidate.user)) {
        return {
          user: candidate.user,
          accessToken: typeof candidate.accessToken === 'string' ? candidate.accessToken : '',
        };
      }
    }

    if (this.isUserPayload(payload)) {
      return {
        user: payload,
        accessToken: '',
      };
    }

    throw new Error('Authentication response is missing user data');
  }

  private persistSession(session: AuthSession) {
    this.token = session.accessToken || null;
    this.currentUser = session.user;
  }

  private clearSession() {
    this.token = null;
    this.currentUser = null;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (response.status === 204) {
      return { message: 'Request completed', data: undefined as T };
    }

    const payload = await response.json().catch(() => ({ message: 'An unexpected error occurred' }));

    if (!response.ok) {
      const detail = payload?.detail;
      const detailMessage =
        typeof detail === 'string'
          ? detail
          : typeof detail?.message === 'string'
          ? detail.message
          : payload?.message;

      if (response.status === 401) {
        this.clearSession();
      }

      throw new Error(detailMessage || 'Request failed');
    }

    return payload;
  }

  private toQueryString(params?: Record<string, string | number | boolean | undefined | null>): string {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    });
    return query.toString();
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthSession>> {
    const response = await this.apiFetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    const result = await this.handleResponse<AuthSession | User>(response);
    const session = this.normalizeAuthSession(result.data);
    this.persistSession(session);
    return {
      ...result,
      data: session,
    };
  }

  async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthSession>> {
    const payload = { ...credentials, role: credentials.role || 'Student' };
    const response = await this.apiFetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await this.handleResponse<AuthSession | User>(response);
    const session = this.normalizeAuthSession(result.data);
    this.persistSession(session);
    return {
      ...result,
      data: session,
    };
  }

  async registerPrivateAdmin(credentials: PrivateAdminRegistration): Promise<ApiResponse<AuthSession>> {
    const response = await this.apiFetch(`${API_BASE_URL}/auth/private-admin/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    const result = await this.handleResponse<AuthSession | User>(response);
    const session = this.normalizeAuthSession(result.data);
    this.persistSession(session);
    return {
      ...result,
      data: session,
    };
  }

  async logout(): Promise<void> {
    try {
      await this.apiFetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } finally {
      this.clearSession();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const response = await this.apiFetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getHeaders(),
    });

    if (response.status === 401) {
      this.clearSession();
      return null;
    }

    const result = await this.handleResponse<User>(response);
    this.persistSession({
      user: result.data,
      accessToken: this.token || '',
    });
    return result.data;
  }

  async changePassword(payload: PasswordChangePayload): Promise<ApiResponse<boolean>> {
    const response = await this.apiFetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<boolean>(response);
  }

  async createUploadSignature(
    assetType: 'profile' | 'course',
    publicId?: string
  ): Promise<ApiResponse<CloudinaryUploadSignature>> {
    const response = await this.apiFetch(`${API_BASE_URL}/media/uploads/signature`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ assetType, publicId }),
    });
    return this.handleResponse<CloudinaryUploadSignature>(response);
  }

  async getUserProfile(userId: string): Promise<ApiResponse<any>> {
    const response = await this.apiFetch(`${API_BASE_URL}/users/${userId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(response);
  }

  async createUser(data: RegisterCredentials): Promise<ApiResponse<User>> {
    const response = await this.apiFetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<User>(response);
  }

  async updateUser(userId: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.apiFetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await this.handleResponse<User>(response);
    if (this.currentUser?.id === result.data.id) {
      this.currentUser = result.data;
    }
    return result;
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<ApiResponse<User>> {
    const response = await this.apiFetch(`${API_BASE_URL}/users/${userId}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ isActive }),
    });
    return this.handleResponse<User>(response);
  }

  async deleteUser(userId: string): Promise<ApiResponse<boolean>> {
    const response = await this.apiFetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<boolean>(response);
  }

  async getCourseCatalog(params?: {
    category?: string;
    difficulty?: string;
    search?: string;
    sortBy?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedApiResponse<CourseCatalog>> {
    const queryParams = this.toQueryString(params);
    const url = `${API_BASE_URL}/courses/catalog${queryParams ? `?${queryParams}` : ''}`;
    const response = await this.apiFetch(url, { headers: this.getHeaders() });
    return this.handleResponse<CourseCatalog[]>(response) as Promise<PaginatedApiResponse<CourseCatalog>>;
  }

  async getCourseBySlug(slug: string): Promise<ApiResponse<CourseCatalog>> {
    const response = await this.apiFetch(`${API_BASE_URL}/courses/catalog/${slug}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<CourseCatalog>(response);
  }

  async createCourseCatalog(payload: Partial<CourseCatalog>): Promise<ApiResponse<CourseCatalog>> {
    const response = await this.apiFetch(`${API_BASE_URL}/courses/catalog`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<CourseCatalog>(response);
  }

  async updateCourseCatalog(slug: string, payload: Partial<CourseCatalog>): Promise<ApiResponse<CourseCatalog>> {
    const response = await this.apiFetch(`${API_BASE_URL}/courses/catalog/${slug}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<CourseCatalog>(response);
  }

  async deleteCourseCatalog(slug: string): Promise<ApiResponse<boolean>> {
    const response = await this.apiFetch(`${API_BASE_URL}/courses/catalog/${slug}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<boolean>(response);
  }

  async getCourseCatalogStats(): Promise<ApiResponse<any>> {
    const response = await this.apiFetch(`${API_BASE_URL}/courses/catalog/stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(response);
  }

  async getCourseCurriculum(slug: string): Promise<ApiResponse<CourseCurriculum>> {
    const response = await this.apiFetch(`${API_BASE_URL}/courses/catalog/${slug}/curriculum`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<CourseCurriculum>(response);
  }

  async getLessonLibrary(params?: {
    search?: string;
    accessStatus?: string;
    courseSlug?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedApiResponse<LessonLibraryItem>> {
    const queryParams = this.toQueryString(params);
    const response = await this.apiFetch(`${API_BASE_URL}/lessons/library${queryParams ? `?${queryParams}` : ''}`, {
      headers: this.getUploadHeaders(),
    });
    return this.handleResponse<LessonLibraryItem[]>(response) as Promise<PaginatedApiResponse<LessonLibraryItem>>;
  }

  async updateCourseCurriculum(
    slug: string,
    payload: Pick<CourseCurriculum, 'overview' | 'learningFlow' | 'visualAidMarkdown' | 'modules' | 'milestoneProjects'>
  ): Promise<ApiResponse<CourseCurriculum>> {
    const response = await this.apiFetch(`${API_BASE_URL}/courses/catalog/${slug}/curriculum`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<CourseCurriculum>(response);
  }

  async enrollCourse(userId: string, enrollment: CourseEnrollment): Promise<ApiResponse<UserCourse>> {
    const response = await this.apiFetch(`${API_BASE_URL}/users/${userId}/courses`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(enrollment),
    });
    return this.handleResponse<UserCourse>(response);
  }

  async getUserCourses(userId: string): Promise<ApiResponse<UserCourse[]>> {
    const response = await this.apiFetch(`${API_BASE_URL}/users/${userId}/courses`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<UserCourse[]>(response);
  }

  async updateCourseProgress(
    userId: string,
    courseSlug: string,
    progress: number,
    completed?: boolean,
    options?: {
      completedLessonSlugs?: string[];
      currentLessonSlug?: string | null;
    }
  ): Promise<ApiResponse<CourseProgressResponse>> {
    const response = await this.apiFetch(`${API_BASE_URL}/users/${userId}/courses/${courseSlug}/progress`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({
        progress,
        completed,
        completedLessonSlugs: options?.completedLessonSlugs,
        currentLessonSlug: options?.currentLessonSlug,
      }),
    });
    return this.handleResponse<CourseProgressResponse>(response);
  }

  async getUserAchievements(userId: string, courseSlug?: string): Promise<ApiResponse<UserAchievement[]>> {
    const query = courseSlug ? `?courseSlug=${encodeURIComponent(courseSlug)}` : '';
    const response = await this.apiFetch(`${API_BASE_URL}/users/${userId}/achievements${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<UserAchievement[]>(response);
  }

  async getCourseEnrollments(courseSlug: string, limit = 10): Promise<ApiResponse<any>> {
    const response = await this.apiFetch(`${API_BASE_URL}/courses/${courseSlug}/enrollments?limit=${limit}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(response);
  }

  async getQuizQuestions(quizId: string): Promise<ApiResponse<QuizQuestion[]>> {
    const response = await this.apiFetch(`${API_BASE_URL}/quizzes/${quizId}/questions`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<QuizQuestion[]>(response);
  }

  async getQuizzes(params?: {
    search?: string;
    courseSlug?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedApiResponse<QuizWithDetails>> {
    const queryParams = this.toQueryString(params);
    const response = await this.apiFetch(`${API_BASE_URL}/quizzes${queryParams ? `?${queryParams}` : ''}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<QuizWithDetails[]>(response) as Promise<PaginatedApiResponse<QuizWithDetails>>;
  }

  async getAllQuizQuestions(): Promise<ApiResponse<QuizQuestion[]>> {
    const response = await this.apiFetch(`${API_BASE_URL}/quizzes/questions/all`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<QuizQuestion[]>(response);
  }

  async createQuizQuestion(payload: QuestionWithDetails | Partial<QuestionWithDetails>): Promise<ApiResponse<QuestionWithDetails>> {
    return this.createQuestion(payload);
  }

  async updateQuizQuestion(questionId: string, payload: QuestionWithDetails | Partial<QuestionWithDetails>): Promise<ApiResponse<QuestionWithDetails>> {
    return this.updateQuestion(questionId, payload);
  }

  async deleteQuizQuestion(questionId: string): Promise<ApiResponse<boolean>> {
    return this.deleteQuestion(questionId);
  }

  async submitQuizAttempt(userId: string, submission: QuizSubmission): Promise<ApiResponse<QuizAttemptSubmission>> {
    const response = await this.apiFetch(`${API_BASE_URL}/users/${userId}/quizzes/attempt`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(submission),
    });
    return this.handleResponse<QuizAttemptSubmission>(response);
  }

  async getUserQuizAttempts(userId: string): Promise<ApiResponse<QuizAttempt[]>> {
    const response = await this.apiFetch(`${API_BASE_URL}/users/${userId}/quizzes`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<QuizAttempt[]>(response);
  }

  async deleteUserQuizAttempt(userId: string, attemptId: string): Promise<ApiResponse<boolean>> {
    const response = await this.apiFetch(`${API_BASE_URL}/users/${userId}/quizzes/${attemptId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<boolean>(response);
  }

  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    const response = await this.apiFetch(`${API_BASE_URL}/stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<AdminStats>(response);
  }

  async getUsersWithDetails(filters?: AdminFilters & { page?: number; pageSize?: number }): Promise<PaginatedApiResponse<UserWithDetails>> {
    const queryParams = this.toQueryString(filters as Record<string, string | number | undefined>);
    const url = `${API_BASE_URL}/users${queryParams ? `?${queryParams}` : ''}`;
    const response = await this.apiFetch(url, { headers: this.getHeaders() });
    return this.handleResponse<UserWithDetails[]>(response) as Promise<PaginatedApiResponse<UserWithDetails>>;
  }

  async getQuestionsWithDetails(
    filters?: AdminFilters & { quizId?: string; activeStatus?: string; page?: number; pageSize?: number }
  ): Promise<PaginatedApiResponse<QuestionWithDetails>> {
    const queryParams = this.toQueryString(filters as Record<string, string | number | undefined>);
    const url = `${API_BASE_URL}/questions${queryParams ? `?${queryParams}` : ''}`;
    const response = await this.apiFetch(url, { headers: this.getHeaders() });
    return this.handleResponse<QuestionWithDetails[]>(response) as Promise<PaginatedApiResponse<QuestionWithDetails>>;
  }

  async createQuestion(payload: Partial<QuestionWithDetails>): Promise<ApiResponse<QuestionWithDetails>> {
    const response = await this.apiFetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<QuestionWithDetails>(response);
  }

  async updateQuestion(questionId: string, payload: Partial<QuestionWithDetails>): Promise<ApiResponse<QuestionWithDetails>> {
    const response = await this.apiFetch(`${API_BASE_URL}/questions/${questionId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<QuestionWithDetails>(response);
  }

  async deleteQuestion(questionId: string): Promise<ApiResponse<boolean>> {
    const response = await this.apiFetch(`${API_BASE_URL}/questions/${questionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<boolean>(response);
  }

  async getCoursesWithDetails(filters?: AdminFilters): Promise<ApiResponse<CourseWithDetails[]>> {
    const queryParams = this.toQueryString(filters as Record<string, string | undefined>);
    const url = `${API_BASE_URL}/courses/catalog${queryParams ? `?${queryParams}` : ''}`;
    const response = await this.apiFetch(url, { headers: this.getHeaders() });
    return this.handleResponse<CourseWithDetails[]>(response);
  }

  async updateCourse(courseId: string, payload: Partial<CourseCatalog>): Promise<ApiResponse<CourseCatalog>> {
    return this.updateCourseCatalog(courseId, payload);
  }

  async deleteCourse(courseId: string): Promise<ApiResponse<boolean>> {
    return this.deleteCourseCatalog(courseId);
  }

  async getRecentActivity(): Promise<ApiResponse<RecentActivity[]>> {
    const response = await this.apiFetch(`${API_BASE_URL}/activity`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<RecentActivity[]>(response);
  }

  async getChartData(period = '7d'): Promise<ApiResponse<ChartData>> {
    const response = await this.apiFetch(`${API_BASE_URL}/charts?period=${period}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<ChartData>(response);
  }

  async getAgentCatalog(): Promise<ApiResponse<AgentTemplate[]>> {
    const response = await this.apiFetch(`${API_BASE_URL}/agents/catalog`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<AgentTemplate[]>(response);
  }

  async requestAgent(payload: AgentRequestPayload): Promise<ApiResponse<AgentAssignment>> {
    const response = await this.apiFetch(`${API_BASE_URL}/agents/requests`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<AgentAssignment>(response);
  }

  async getAgentAssignments(status?: string): Promise<ApiResponse<AgentAssignment[]>> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const response = await this.apiFetch(`${API_BASE_URL}/agents/assignments${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<AgentAssignment[]>(response);
  }

  async updateAgentRequest(assignmentId: string, payload: AgentApprovalPayload): Promise<ApiResponse<AgentAssignment>> {
    const response = await this.apiFetch(`${API_BASE_URL}/agents/requests/${assignmentId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<AgentAssignment>(response);
  }

  async createAgentThread(payload: AgentThreadPayload): Promise<ApiResponse<AgentThread>> {
    const response = await this.apiFetch(`${API_BASE_URL}/agents/threads`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<AgentThread>(response);
  }

  async getAgentThreads(assignmentId?: string): Promise<ApiResponse<AgentThread[]>> {
    const query = assignmentId ? `?assignmentId=${encodeURIComponent(assignmentId)}` : '';
    const response = await this.apiFetch(`${API_BASE_URL}/agents/threads${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<AgentThread[]>(response);
  }

  async getAgentThread(threadId: string): Promise<ApiResponse<AgentThreadDetail>> {
    const response = await this.apiFetch(`${API_BASE_URL}/agents/threads/${threadId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<AgentThreadDetail>(response);
  }

  async deleteAgentThread(threadId: string): Promise<ApiResponse<boolean>> {
    const response = await this.apiFetch(`${API_BASE_URL}/agents/threads/${threadId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<boolean>(response);
  }

  async sendAgentMessage(threadId: string, payload: AgentMessagePayload): Promise<ApiResponse<{
    userMessage: AgentMessage;
    assistantMessage: AgentMessage;
  }>> {
    const response = await this.apiFetch(`${API_BASE_URL}/agents/threads/${threadId}/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<{
      userMessage: AgentMessage;
      assistantMessage: AgentMessage;
    }>(response);
  }

  async getAgentArtifacts(assignmentId?: string): Promise<ApiResponse<AgentArtifact[]>> {
    const query = assignmentId ? `?assignmentId=${encodeURIComponent(assignmentId)}` : '';
    const response = await this.apiFetch(`${API_BASE_URL}/agents/artifacts${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<AgentArtifact[]>(response);
  }

  async runAgentAction(assignmentId: string, payload: AgentActionPayload): Promise<ApiResponse<AgentArtifact>> {
    const response = await this.apiFetch(`${API_BASE_URL}/agents/assignments/${assignmentId}/actions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<AgentArtifact>(response);
  }

  async ingestLearningContent(payload: {
    intent: 'course' | 'lesson' | 'quiz' | 'question_bank';
    file: File;
    courseSlug?: string;
    instructions?: string;
  }): Promise<ApiResponse<ContentIngestionResult>> {
    const body = new FormData();
    body.append('intent', payload.intent);
    body.append('sourceFile', payload.file);
    if (payload.courseSlug) {
      body.append('courseSlug', payload.courseSlug);
    }
    if (payload.instructions) {
      body.append('instructions', payload.instructions);
    }

    const response = await this.apiFetch(`${API_BASE_URL}/content/intake`, {
      method: 'POST',
      headers: this.getUploadHeaders(),
      body,
    });
    return this.handleResponse<ContentIngestionResult>(response);
  }

  async uploadContentGenerationSession(payload: {
    file: File;
    courseSlug?: string;
    instructions?: string;
  }): Promise<ApiResponse<ContentGenerationSession>> {
    const body = new FormData();
    body.append('sourceFile', payload.file);
    if (payload.courseSlug) {
      body.append('courseSlug', payload.courseSlug);
    }
    if (payload.instructions) {
      body.append('instructions', payload.instructions);
    }

    const response = await this.apiFetch(`${API_BASE_URL}/content/intake/sessions/upload`, {
      method: 'POST',
      headers: this.getUploadHeaders(),
      body,
    });
    return this.handleResponse<ContentGenerationSession>(response);
  }

  async getContentGenerationSession(sessionId: string): Promise<ApiResponse<ContentGenerationSession>> {
    const response = await this.apiFetch(`${API_BASE_URL}/content/intake/sessions/${sessionId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<ContentGenerationSession>(response);
  }

  async runContentGenerationAction(
    sessionId: string,
    payload: {
      actionType: 'create_course_shell' | 'generate_overview' | 'generate_module' | 'generate_questions';
      moduleOrder?: number;
      questionCount?: number;
      instructions?: string;
    }
  ): Promise<ApiResponse<ContentGenerationSession>> {
    const response = await this.apiFetch(`${API_BASE_URL}/content/intake/sessions/${sessionId}/actions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<ContentGenerationSession>(response);
  }
}

export const api = new ApiService();
