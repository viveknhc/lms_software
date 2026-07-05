// User & Auth
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "instructor" | "admin";
  is_active: boolean;
  bio: string;
  profile_picture: string | null;
  phone: string;
  date_of_birth: string | null;
  email_verified: boolean;
  date_joined: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  role?: "student" | "instructor";
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

// Courses
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  course_count: number;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  category: number | null;
  category_name: string | null;
  instructor: number;
  instructor_name: string;
  price: string;
  thumbnail: string | null;
  status: "draft" | "published" | "archived";
  section_count: number;
  created_at: string;
  updated_at: string;
}

// Learning
export interface Section {
  id: number;
  course: number;
  title: string;
  order: number;
  lesson_count: number;
  created_at: string;
}

export interface Lesson {
  id: number;
  section: number;
  section_title: string;
  course: number;
  course_title: string;
  title: string;
  content_type: "video" | "document" | "text" | "quiz";
  video_url: string;
  content: string;
  duration_minutes: number;
  order: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

// Enrollments
export interface Enrollment {
  id: number;
  student: number;
  student_name: string;
  course: number;
  course_title: string;
  enrolled_at: string;
  status: "active" | "completed" | "dropped";
}

export interface CourseProgress {
  id: number;
  student: number;
  student_name: string;
  course: number;
  course_title: string;
  enrollment: number;
  completion_percentage: string;
  is_completed: boolean;
  last_accessed: string;
}

export interface LessonProgress {
  id: number;
  student: number;
  student_name: string;
  lesson: number;
  lesson_title: string;
  course: number;
  enrollment: number;
  is_completed: boolean;
  time_spent_minutes: number;
  completed_at: string | null;
}

// Quizzes
export interface Quiz {
  id: number;
  course: number;
  course_title: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  passing_score: string;
  max_attempts: number;
  is_published: boolean;
  question_count: number;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface QuizDetail extends Quiz {
  questions: QuestionDetail[];
}

export interface QuestionDetail {
  id: number;
  text: string;
  question_type: "single_choice" | "multiple_choice" | "true_false";
  order: number;
  points: number;
  options: QuizOption[];
}

export interface QuizOption {
  id: number;
  text: string;
  order: number;
}

export interface Attempt {
  id: number;
  quiz: number;
  quiz_title: string;
  student: number;
  student_name: string;
  status: "in_progress" | "submitted";
  score: string | null;
  is_passed: boolean;
  total_questions: number;
  correct_answers: number;
  time_taken_seconds: number;
  started_at: string;
  submitted_at: string | null;
  results: QuizResult[];
}

export interface QuizResult {
  id: number;
  question: number;
  question_text: string;
  question_type: string;
  selected_option_ids: number[];
  correct_option_ids: number[];
  is_correct: boolean;
  points_earned: string;
}

// Assignments
export interface Assignment {
  id: number;
  course: number;
  course_title: string;
  section: number | null;
  title: string;
  description: string;
  instructions: string;
  total_points: number;
  due_date: string | null;
  attachment: string | null;
  is_published: boolean;
  submission_count: number;
  graded_count: number;
  my_submission: Submission | null;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: number;
  assignment: number;
  assignment_title: string;
  student: number;
  student_name: string;
  content: string;
  attachment: string | null;
  status: "draft" | "submitted" | "late" | "graded";
  submitted_at: string;
  updated_at: string;
  grade: Grade | null;
}

export interface Grade {
  id: number;
  submission: number;
  graded_by: number;
  grader_name: string;
  points_earned: string;
  feedback: string;
  is_passed: boolean;
  graded_at: string;
}

// Certificates
export interface Certificate {
  id: number;
  enrollment: number;
  student: number;
  student_name: string;
  course: number;
  course_title: string;
  template: number | null;
  template_name: string | null;
  certificate_id: string;
  verification_code: string;
  issued_at: string;
  expires_at: string | null;
  is_revoked: boolean;
  pdf_file: string | null;
}

// Notifications
export interface Notification {
  id: number;
  recipient: number;
  recipient_name: string;
  title: string;
  message: string;
  notification_type: string;
  link: string;
  template: number | null;
  is_read: boolean;
  read_at: string | null;
  time_ago: string;
  created_at: string;
}

// Dashboard
export interface StudentDashboard {
  enrollments: {
    total: number;
    active: number;
    completed: number;
    avg_completion_pct: number;
  };
  recent_courses: Array<{
    course_id: number;
    course_title: string;
    course_slug: string;
    status: string;
    completion_pct: number;
    enrolled_at: string;
  }>;
  quizzes: {
    total_taken: number;
    avg_score: number;
    passed: number;
  };
  assignments: {
    total_graded: number;
    avg_grade: number;
    passed: number;
  };
  certificates_earned: number;
  recent_activity: ActivityLog[];
}

export interface InstructorDashboard {
  courses: {
    total: number;
    published: number;
    draft: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
    recent_week: number;
    completion_rate: number;
  };
  course_breakdown: Array<{
    course_id: number;
    title: string;
    slug: string;
    status: string;
    total_enrollments: number;
    active: number;
    completed: number;
    avg_completion_pct: number;
  }>;
  revenue: {
    total: number;
    recent_week: number;
    total_sales: number;
  };
  recent_activity: ActivityLog[];
}

export interface AdminDashboard {
  users: {
    total: number;
    by_role: Record<string, number>;
    new_week: number;
    new_month: number;
  };
  courses: {
    total: number;
    by_status: Record<string, number>;
    by_category: Record<string, number>;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
    new_week: number;
    new_month: number;
  };
  revenue: {
    total: number;
    week: number;
    month: number;
    total_orders: number;
  };
  assessments: {
    total_quiz_attempts: number;
    avg_quiz_score: number;
    total_graded_submissions: number;
    avg_grade: number;
  };
  certificates: {
    total_issued: number;
    issued_week: number;
  };
  activity: {
    total: number;
    week: number;
    month: number;
    top_actions: Record<string, number>;
  };
  recent_activity: ActivityLog[];
}

export interface ActivityLog {
  id: number;
  user: number;
  user_name: string;
  user_role: string;
  action_type: string;
  description: string;
  metadata: Record<string, unknown>;
  time_ago: string;
  created_at: string;
}
