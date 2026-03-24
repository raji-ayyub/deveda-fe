export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  avatarUrl?: string;
  avatarPublicId?: string;
  createdAt?: string;
  lastLogin?: string | null;
}

export interface AuthSession {
  user: User;
  accessToken: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  role: string;
  registeredCourses: string[];
  createdAt: string;
}

export interface UserCourse {
  id: string;
  userId: string;
  courseSlug: string;
  category: string;
  difficulty: string;
  progress: number;
  completed: boolean;
  completedLessonSlugs?: string[];
  currentLessonSlug?: string | null;
  lastAccessed: string | null;
  enrolledAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctAnswer?: string;
  explanation: string;
  points: number;
  questionType: string;
  timeLimit: number;
  difficulty?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  isActive?: boolean;
}

export interface QuizWithDetails {
  id: string;
  title: string;
  courseSlug?: string;
  totalQuestions?: number;
  duration?: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  courseSlug?: string;
  score: number;
  passed: boolean;
  attemptedAt: string;
}

export interface CourseCatalog {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  totalQuizzes: number;
  totalLessons: number;
  instructor: string;
  prerequisites: string[];
  tags: string[];
  thumbnail: string;
  thumbnailPublicId?: string;
  createdAt: string;
}

export interface CourseCurriculumLesson {
  title: string;
  slug: string;
  libraryLessonSlug?: string | null;
  source?: string;
  generationStatus?: 'planned' | 'generated' | string;
  summary: string;
  durationMinutes: number;
  contentType: string;
  quizId?: string | null;
  quizTitle?: string | null;
  learningObjectives?: string[];
  keyTakeaways?: string[];
  learningFlow?: string[];
  contentMarkdown?: string;
  visualAidMarkdown?: string | null;
  practicePrompt?: string | null;
  instructorNotes?: string | null;
  playground?: LessonPlayground | null;
}

export interface LessonPlaygroundCheck {
  label: string;
  type: 'includes' | 'output';
  target: 'html' | 'css' | 'js' | 'console';
  value: string;
}

export interface LessonPlayground {
  mode: 'web' | 'javascript';
  instructions: string;
  starterHtml?: string;
  starterCss?: string;
  starterJs?: string;
  checks: LessonPlaygroundCheck[];
}

export interface CourseCurriculumModule {
  title: string;
  description: string;
  order: number;
  source?: string;
  generationStatus?: 'planned' | 'generated' | string;
  lessons: CourseCurriculumLesson[];
  assessmentTitle?: string | null;
  assessmentQuizId?: string | null;
}

export interface MilestoneProject {
  title: string;
  description: string;
  milestoneOrder: number;
  estimatedHours: number;
  deliverables: string[];
  completionThreshold: number;
}

export interface CourseCurriculum {
  id: string;
  courseSlug: string;
  overview: string;
  learningFlow: string[];
  visualAidMarkdown?: string;
  modules: CourseCurriculumModule[];
  milestoneProjects: MilestoneProject[];
  updatedAt: string;
  updatedBy: string;
  isDraftScaffold?: boolean;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination?: PaginationMeta;
  summary?: Record<string, unknown>;
}

export interface CloudinaryUploadSignature {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
  publicId?: string | null;
}

export interface UserAchievement {
  id: string;
  userId: string;
  courseSlug: string;
  courseTitle: string;
  kind: 'milestone' | 'course_completion';
  key: string;
  title: string;
  description: string;
  celebrationMessage: string;
  badgeLabel: string;
  badgeTone: 'blue' | 'amber' | 'emerald' | string;
  progressTrigger: number;
  milestoneOrder?: number | null;
  skills: string[];
  deliverables: string[];
  parentSummary: string;
  awardedAt: string;
  certificate?: {
    code: string;
    label: string;
    issuedAt: string;
    issuer: string;
    skills: string[];
    shareNote: string;
  } | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface PrivateAdminRegistration extends RegisterCredentials {
  adminSetupSecret: string;
}

export interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
}

export interface QuizSubmission {
  quizId: string;
  score: number;
  courseSlug?: string;
}

export interface CourseEnrollment {
  courseSlug: string;
  category?: string;
  difficulty?: string;
}

export interface CourseProgressResponse {
  course: UserCourse;
  awards: UserAchievement[];
}

export interface QuizAttemptSubmission {
  attempt: QuizAttempt;
  awards: UserAchievement[];
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

export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalQuizzes: number;
  totalQuestions: number;
  activeUsers: number;
  recentRegistrations: number;
  averageProgress: number;
}

export interface UserWithDetails extends User {
  createdAt: string;
  lastLogin: string | null;
  coursesCount: number;
  quizAttempts: number;
}

export interface QuestionWithDetails extends QuizQuestion {
  correctAnswer: string;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
}

export interface CourseWithDetails extends CourseCatalog {
  enrolledCount: number;
  averageRating: number;
  completionRate: number;
  isPublished: boolean;
}

export interface AdminFilters {
  startDate?: string;
  endDate?: string;
  role?: string;
  status?: string;
  category?: string;
  difficulty?: string;
  search?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor: string | string[];
    borderWidth: number;
  }[];
}

export interface RecentActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: string;
  icon: string;
}

export interface AgentTemplate {
  key: string;
  name: string;
  description: string;
  allowedRequesterRoles: string[];
  requiresApproval: boolean;
  defaultTitle: string;
}

export interface AgentAssignment {
  id: string;
  userId: string;
  requestedBy?: string;
  targetUserId?: string | null;
  agentType: string;
  displayName?: string | null;
  notes?: string;
  courseSlug?: string | null;
  lessonSlug?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentThread {
  id: string;
  assignmentId: string;
  userId: string;
  title: string;
  agentType: string;
  context: {
    courseSlug?: string | null;
    lessonSlug?: string | null;
  };
  lastMessagePreview?: string;
  createdAt: string;
  updatedAt: string;
  assignment?: AgentAssignment | null;
}

export interface AgentMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AgentThreadDetail {
  thread: AgentThread;
  messages: AgentMessage[];
}

export interface AgentArtifact {
  id: string;
  assignmentId: string;
  threadId?: string | null;
  userId: string;
  agentType: string;
  artifactType: string;
  title: string;
  summary: string;
  status: string;
  route?: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface LessonContentPlanPayload {
  courseSlug: string;
  lessonSlug: string;
  moduleTitle: string;
  lessonTitle: string;
  instruction?: string;
  learnerPromise?: string;
  planningNotes?: string[];
  sectionOutline?: string[];
  recommendedObjectives?: string[];
  bestPractices?: string[];
  practiceArc?: string[];
  playgroundMode?: 'web' | 'javascript';
  playgroundBrief?: string;
  summary?: string;
}

export interface GeneratedLessonContentPayload {
  courseSlug: string;
  lessonSlug: string;
  moduleTitle: string;
  lesson: CourseCurriculumLesson;
  plan?: LessonContentPlanPayload;
  instruction?: string;
}

export interface CourseContentPlanModuleBlueprint {
  title: string;
  order: number;
  goal: string;
  lessonCount: number;
  deliveryPattern: string[];
  lessonBlueprints: {
    title: string;
    goal: string;
  }[];
}

export interface CourseContentPlanPayload {
  courseSlug: string;
  courseTitle: string;
  instruction?: string;
  backgroundAgents?: string[];
  planningNotes?: string[];
  moduleBlueprints?: CourseContentPlanModuleBlueprint[];
  milestoneStrategy?: string[];
}

export interface GeneratedCourseContentPayload {
  courseSlug: string;
  instruction?: string;
  planningNotes?: string[];
  courseContext?: Record<string, unknown>;
  curriculum: Pick<CourseCurriculum, 'courseSlug' | 'overview' | 'learningFlow' | 'visualAidMarkdown' | 'modules' | 'milestoneProjects'>;
}

export interface CourseCatalogDraftPayload {
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  totalLessons: number;
  totalQuizzes: number;
  instructor: string;
  prerequisites: string[];
  tags: string[];
}

export interface GeneratedModuleContentPayload {
  courseSlug: string;
  moduleOrder: number;
  module: CourseCurriculumModule;
  instruction?: string;
}

export interface GeneratedQuestionContentPayload {
  quizId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  timeLimit: number;
  questionType: string;
  difficulty: string;
  isActive: boolean;
}

export interface AgentRequestPayload {
  agentType: string;
  displayName?: string;
  notes?: string;
  courseSlug?: string;
  lessonSlug?: string;
  targetUserId?: string;
}

export interface AgentApprovalPayload {
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

export interface AgentThreadPayload {
  assignmentId: string;
  title?: string;
  initialMessage?: string;
  courseSlug?: string;
  lessonSlug?: string;
}

export interface AgentMessagePayload {
  message: string;
  courseSlug?: string;
  lessonSlug?: string;
  lessonTitle?: string;
  currentProgress?: number;
}

export interface AgentActionPayload {
  actionType:
    | 'draft_course_catalog'
    | 'create_course_shell'
    | 'create_curriculum_draft'
    | 'apply_curriculum_to_course'
    | 'save_planning_note'
    | 'suggest_lesson_content'
    | 'plan_lesson_content'
    | 'generate_lesson_content'
    | 'plan_course_content'
    | 'generate_course_content'
    | 'generate_module_content'
    | 'generate_question_content';
  artifactId?: string;
  courseSlug?: string;
  lessonSlug?: string;
  moduleOrder?: number;
  questionCount?: number;
  targetUserId?: string;
  instruction?: string;
  draftPayload?: Record<string, unknown>;
}

export interface LessonCourseRef {
  courseSlug: string;
  courseTitle: string;
  moduleTitle: string;
  moduleOrder: number;
  lessonSlug: string;
}

export interface LessonLibraryItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  durationMinutes: number;
  contentType: string;
  source?: string;
  learningObjectives?: string[];
  keyTakeaways?: string[];
  learningFlow?: string[];
  visualAidMarkdown?: string;
  courseRefs: LessonCourseRef[];
  updatedAt?: string;
  accessStatus: 'available' | 'locked' | 'draft';
  entryRoute?: string | null;
}

export interface ContentIngestionResult {
  intent: 'course' | 'lesson' | 'quiz' | 'question_bank';
  fileName: string;
  extractedTextPreview: string;
  summary: string;
  course: CourseCatalog | null;
  curriculum: CourseCurriculum | null;
  lessons: LessonLibraryItem[];
  questions: QuizQuestion[];
  stats: {
    lessonCount: number;
    questionCount: number;
    quizCount: number;
  };
}

export interface ContentGenerationScanModule {
  order: number;
  title: string;
  description: string;
  lessonCount: number;
  lessonTitles: string[];
  estimatedQuestionCount: number;
}

export interface ContentGenerationScan {
  summary: string;
  recommendedCourse: {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    tags: string[];
  };
  overview: string;
  learningFlow: string[];
  visualAidMarkdown: string;
  modules: ContentGenerationScanModule[];
  milestoneProjects: MilestoneProject[];
}

export interface ContentGenerationSession {
  id: string;
  intent: 'course';
  status: string;
  fileName: string;
  courseSlug?: string | null;
  sourcePreview: string;
  summary: string;
  scan: ContentGenerationScan;
  generation: {
    shellCreated?: boolean;
    generatedModules?: number[];
    generatedQuestionModules?: number[];
  };
  course?: {
    slug: string;
    title: string;
  } | null;
  curriculum?: CourseCurriculum | null;
  generatedQuestions?: QuizQuestion[];
  createdAt?: string;
  updatedAt?: string;
}
