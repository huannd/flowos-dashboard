const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, data: any) {
    super(data?.message || data?.error || `HTTP ${status}`);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('flowos_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('flowos_token');
      localStorage.removeItem('flowos_user');
      window.location.href = '/auth/login';
    }
    throw new ApiError(res.status, data);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

// ═══ Auth ═══
export const authApi = {
  register: (data: { email: string; password: string; fullName?: string }) =>
    request<{ user: any; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<{ user: any; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ═══ User ═══
export const userApi = {
  getProfile: () => request<any>('/user/profile'),
  updateProfile: (data: any) =>
    request<any>('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
};

// ═══ Templates ═══
export const templateApi = {
  list: (params?: { categoryId?: string; search?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.categoryId) qs.set('categoryId', params.categoryId);
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', params.page.toString());
    return request<{ templates: any[]; total: number }>(`/templates?${qs}`);
  },
  getById: (id: string) => request<any>(`/templates/${id}`),
  getCategories: () => request<any[]>('/templates/categories'),
};

// ═══ Automations ═══
export const automationApi = {
  run: (data: { templateId: string; inputs: Record<string, unknown> }) =>
    request<{ executionId: string; status: string; quota: any }>('/automations/run', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  cancel: (id: string) =>
    request<any>(`/automations/${id}/cancel`, { method: 'POST' }),
  retry: (id: string) =>
    request<any>(`/automations/${id}/retry`, { method: 'POST' }),
  history: (params?: { page?: number; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', params.page.toString());
    if (params?.status) qs.set('status', params.status);
    return request<{ executions: any[]; total: number }>(`/automations/history?${qs}`);
  },
};

// ═══ Executions ═══
export const executionApi = {
  list: (params?: { page?: number; status?: string; templateId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', params.page.toString());
    if (params?.status) qs.set('status', params.status);
    if (params?.templateId) qs.set('templateId', params.templateId);
    return request<{ executions: any[]; total: number; totalPages: number }>(
      `/executions?${qs}`,
    );
  },
  getById: (id: string) => request<any>(`/executions/${id}`),
  getStats: () => request<any>('/executions/stats'),
};

// ═══ Credentials ═══
export const credentialApi = {
  list: () => request<any[]>('/credentials'),
  getTypes: () => request<string[]>('/credentials/types'),
  create: (data: { name: string; type: string; data: Record<string, unknown> }) =>
    request<any>('/credentials', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<any>(`/credentials/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    }),
  delete: (id: string) =>
    request<any>(`/credentials/${id}`, { method: 'DELETE' }),
};

// ═══ Billing ═══
export const billingApi = {
  getPlans: () => request<any[]>('/billing/plans'),
  getSubscription: () => request<any>('/billing/subscription'),
  getQuota: () => request<any>('/billing/quota'),
};

// ═══ SSE Streaming ═══
export function createExecutionStream(executionId: string): EventSource {
  const token = localStorage.getItem('flowos_token');
  return new EventSource(
    `${API_BASE}/executions/${executionId}/stream?token=${token}`,
  );
}

export function createDashboardStream(): EventSource {
  const token = localStorage.getItem('flowos_token');
  return new EventSource(
    `${API_BASE}/executions/stream/dashboard?token=${token}`,
  );
}

export { ApiError };
