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
  AIChatResponse,
  AIStatusResponse,
} from '../types';

const getApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  // If explicitly configured with a secure external domain that is not a local address, use it
  if (
    envUrl &&
    !envUrl.includes('localhost') &&
    !envUrl.includes('127.0.0.1') &&
    !envUrl.includes('192.168.') &&
    !envUrl.includes('10.') &&
    envUrl.startsWith('https://')
  ) {
    return envUrl;
  }
  // Always use relative path '/api'.
  // This ensures all requests are strictly same-origin and completely prevents
  // Chrome's "Access other apps and services on this device" (Local Network Access / PNA) popup.
  return '/api';
};

const API_URL = getApiUrl();

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
  createOfficial: (data: {
    full_name: string;
    email: string;
    password: string;
    department?: string;
    job_role?: string;
  }) => api.post<OfficialSummary>('/admin/officials', data).then((r) => r.data),
};

/* ─── AI / LLM (OpenAI & Custom Endpoints) ─────────── */
export const aiAPI = {
  chat: (
    message: string,
    history?: { sender: string; text: string }[],
    system_prompt?: string,
    customConfig?: { api_key?: string; base_url?: string; model_id?: string },
  ) =>
    api.post<AIChatResponse>('/ai/chat', {
      message,
      history,
      system_prompt,
      api_key: customConfig?.api_key || undefined,
      base_url: customConfig?.base_url || undefined,
      model_id: customConfig?.model_id || undefined,
    }).then((r) => r.data),

  status: () => api.get<AIStatusResponse>('/ai/status').then((r) => r.data),

  test: (customConfig?: { api_key?: string; base_url?: string; model_id?: string }) =>
    api.post<{ success: boolean; configured: boolean; message?: string; error?: string; response?: string }>('/ai/test', customConfig).then((r) => r.data),

  streamChat: async function* (
    message: string,
    history?: { sender: string; text: string }[],
    customConfig?: { api_key?: string; base_url?: string; model_id?: string },
    system_prompt?: string,
  ) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message,
        history,
        system_prompt,
        api_key: customConfig?.api_key || undefined,
        base_url: customConfig?.base_url || undefined,
        model_id: customConfig?.model_id || undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(`Realtime streaming failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') return;
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.content) yield parsed.content;
          } catch {
            // ignore
          }
        }
      }
    }
  },
};

