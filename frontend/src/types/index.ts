/* ─── TypeScript interfaces for the entire application ─── */

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'OFFICIAL' | 'ADMIN';
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface OfficialProfile {
  id: number;
  user_id: number;
  employee_id: string;
  department: string;
  job_role: string;
  years_of_experience: number;
  skills: string[];
  completed_training: string[];
  bio: string;
  full_name: string;
  email: string;
}

export interface ProfileUpdate {
  department?: string;
  job_role?: string;
  years_of_experience?: number;
  skills?: string[];
  completed_training?: string[];
  bio?: string;
}

export interface Competency {
  id: number;
  name: string;
  category: string;
  description: string;
}

export interface CompetencyGap {
  competency_id: number;
  competency_name: string;
  category: string;
  current_score: number;
  required_score: number;
  gap: number;
  priority: 'High' | 'Medium' | 'Low';
}

export interface Course {
  id: number;
  course_code: string;
  name: string;
  competency_area: string;
  difficulty: string;
  duration_hours: number;
  description: string;
  provider: string;
  is_igot: boolean;
}

export interface RecommendedCourse extends Course {
  match_score: number;
  reason: string;
}

export interface LearningPathCourse {
  id: number;
  course_id: number;
  course_name: string;
  course_code: string;
  competency_area: string;
  order: number;
  status: string;
  difficulty: string;
  duration_hours: number;
}

export interface LearningPathStage {
  name: string;
  description: string;
  status: string;
  icon: string;
}

export interface LearningPath {
  id: number;
  status: string;
  courses: LearningPathCourse[];
  stages: LearningPathStage[];
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  question_order: number;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  competency_area: string;
  total_questions: number;
  created_at: string;
}

export interface QuizDetail extends Quiz {
  questions: QuizQuestion[];
}

export interface QuestionResult {
  question_id: number;
  question_text: string;
  selected_option: string;
  correct_option: string;
  is_correct: boolean;
  explanation: string;
}

export interface QuizResult {
  quiz_id: number;
  quiz_title: string;
  score: number;
  total: number;
  percentage: number;
  results: QuestionResult[];
}

export interface LearningMaterial {
  id: number;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  status: string;
  extracted_text_preview: string;
  uploaded_at: string;
}

export interface Progress {
  courses_completed: number;
  courses_in_progress: number;
  quizzes_taken: number;
  average_score: number;
  total_learning_hours: number;
  recent_activities: Activity[];
}

export interface Activity {
  type: string;
  title: string;
  score: string;
  date: string;
}

export interface AssessmentResult {
  id: number;
  quiz_id: number;
  quiz_title: string;
  competency_area: string;
  score: number;
  total: number;
  percentage: number;
  completed_at: string;
}

export interface AdminStatistics {
  total_officials: number;
  active_learners: number;
  avg_competency: number;
  course_completion_rate: number;
  avg_assessment_score: number;
  total_courses: number;
  total_quizzes: number;
  skill_gap_distribution: { name: string; avgGap: number }[];
  course_popularity: { name: string; enrollments: number }[];
  recent_users: { name: string; email: string; joinedAt: string }[];
}

export interface OfficialSummary {
  id: number;
  full_name: string;
  email: string;
  department: string;
  job_role: string;
  avg_competency: number;
  courses_completed: number;
  quizzes_taken: number;
  average_score: number;
  is_active: boolean;
}
