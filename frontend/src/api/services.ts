import apiClient from './client';

export const analyticsService = {
  getMyAnalytics: () => apiClient.get('/analytics/me'),
  getStreak: () => apiClient.get('/analytics/streak'),
  getCalendar: () => apiClient.get('/analytics/calendar'),
  getBadges: () => apiClient.get('/analytics/badges'),
  getRecommendations: () => apiClient.get('/analytics/recommendations'),
};

export const problemService = {
  getAll: (params?: { difficulty?: string; category?: string; problem_type?: string }) =>
    apiClient.get('/problems/', { params }),
  getById: (id: number) => apiClient.get(`/problems/${id}`),
  search: (q: string) => apiClient.get('/problems/search', { params: { q } }),
  getCompanyTags: () => apiClient.get('/problems/company-tags/list'),
  generate: (data: { category: string; difficulty: string; problem_type: string; count: number }) =>
    apiClient.post('/problems/generate', data),
  submitMcq: (data: { problem_id: number; selected_index: number }) =>
    apiClient.post('/problems/mcq/submit', data),
  getDailyMcqs: () => apiClient.get('/problems/daily-mcq/today'),
};

export const submissionService = {
  runCode: (data: { problem_id: number; code: string; language: string }) =>
    apiClient.post('/execute/run', data),
  traceCode: (data: { problem_id: number; code: string; language: string }) =>
    apiClient.post('/execute/trace', data),
  submit: (data: { problem_id: number; code: string; language: string }) =>
    apiClient.post('/submissions/', data),
  getById: (id: number) => apiClient.get(`/submissions/${id}`),
  getMySubmissions: (problemId?: number) =>
    apiClient.get('/submissions/', { params: { problem_id: problemId } }),
};

export const debugService = {
  getAll: (difficulty?: string) => apiClient.get('/debug-arena/', { params: { difficulty } }),
  getDaily: () => apiClient.get('/debug-arena/daily/today'),
  getById: (id: number) => apiClient.get(`/debug-arena/${id}`),
  getHint: (data: { challenge_id: number; current_code: string }) => apiClient.post('/debug-arena/hint', data),
  submitFix: (data: { challenge_id: number; code: string }) => apiClient.post('/debug-arena/submit', data),
};

export const chatService = {
  ask: (question: string) => apiClient.post('/chat/ask', { question }),
  socratic: (question: string, topicThread: string) =>
    apiClient.post('/chat/socratic', { question, topic_thread: topicThread }),
};

export const agentService = {
  runCareerAdvisor: () => apiClient.post('/agents/career-advisor'),
};

export const careerTrackService = {
  getAllTiers: () => apiClient.get('/career-tracks/'),
  getTierDetail: (id: number) => apiClient.get(`/career-tracks/${id}`),
  toggleChecklistItem: (checklistItemId: number) =>
    apiClient.post('/career-tracks/checklist/toggle', { checklist_item_id: checklistItemId }),
  getTierProgress: (id: number) => apiClient.get(`/career-tracks/${id}/progress`),
};