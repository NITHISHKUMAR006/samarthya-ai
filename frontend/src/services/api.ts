import axios from 'axios';
import type {
  AuthResponse,
  OfficialProfile,
  ProfileUpdate,
  Competency,
  CompetencyGap,
  Course,
  RecommendedCourse,
  LearningPath,
  Quiz,
  QuizDetail,
  QuizResult,
  LearningMaterial,
  Progress,
  AssessmentResult,
  AdminStatistics,
  OfficialSummary,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

/* ─── Auth ────────────────────────────────────────── */
export const authAPI = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),
  register: (email: string, password: string, full_name: string, role: string) =>
    api.post('/auth/register', { email, password, full_name, role }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

/* ─── Official Profile ───────────────────────────── */
export const profileAPI = {
  get: () => api.get<OfficialProfile>('/official/profile').then((r) => r.data),
  update: (data: ProfileUpdate) =>
    api.put<OfficialProfile>('/official/profile', data).then((r) => r.data),
};

/* ─── Competencies ───────────────────────────────── */
export const competencyAPI = {
  list: () => api.get<Competency[]>('/competencies').then((r) => r.data),
  gaps: () => api.get<CompetencyGap[]>('/competencies/gaps').then((r) => r.data),
};

/* ─── Courses ────────────────────────────────────── */
export const courseAPI = {
  list: () => api.get<Course[]>('/courses').then((r) => r.data),
  recommended: () => api.get<RecommendedCourse[]>('/courses/recommended').then((r) => r.data),
};

/* ─── Learning Path ──────────────────────────────── */
export const learningPathAPI = {
  get: () => api.get<LearningPath>('/learning-path').then((r) => r.data),
};

/* ─── Quizzes ────────────────────────────────────── */
export const quizAPI = {
  list: () => api.get<Quiz[]>('/quizzes').then((r) => r.data),
  get: (id: number) => api.get<QuizDetail>(`/quizzes/${id}`).then((r) => r.data),
  submit: (id: number, answers: { question_id: number; selected_option: string }[]) =>
    api.post<QuizResult>(`/quizzes/${id}/submit`, { answers }).then((r) => r.data),
  generate: (data: { material_id?: number; competency_area?: string; num_questions?: number }) =>
    api.post<Quiz>('/quizzes/generate', data).then((r) => r.data),
};

/* ─── Materials ──────────────────────────────────── */
export const materialAPI = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<LearningMaterial>('/materials/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
  list: () => api.get<LearningMaterial[]>('/materials').then((r) => r.data),
};

/* ─── Progress & Results ─────────────────────────── */
export const progressAPI = {
  get: () => api.get<Progress>('/progress').then((r) => r.data),
  results: () => api.get<AssessmentResult[]>('/results').then((r) => r.data),
};

/* ─── Admin ──────────────────────────────────────── */
export const adminAPI = {
  statistics: () => api.get<AdminStatistics>('/admin/statistics').then((r) => r.data),
  officials: () => api.get<OfficialSummary[]>('/admin/officials').then((r) => r.data),
};
