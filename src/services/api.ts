import { CategoryId, Citation, DocumentItem, FAQItem, QueryRecord, SecurityEvent, UnansweredQuestion, AuthUser } from '../types';

export interface ChatResponse {
  answerable: boolean;
  answer: string;
  citations: Citation[];
  suggestedContact?: string;
  contactEmail?: string;
  queryId?: string;
  error?: string;
}

export const api = {
  // Public Chat
  async askQuestion(
    question: string,
    category: CategoryId = 'all',
    sessionId: string
  ): Promise<ChatResponse> {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, category, sessionId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to retrieve answer from helpdesk');
      }
      return data;
    } catch (err: any) {
      return {
        answerable: false,
        answer: 'The answer could not be loaded. Please check your network and try again.',
        citations: [],
        error: err.message,
      };
    }
  },

  // Submit Feedback
  async submitFeedback(queryId: string, feedback: 'helpful' | 'unhelpful'): Promise<void> {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryId, feedback }),
      });
    } catch (e) {
      console.warn('Feedback failed to submit', e);
    }
  },

  // Get FAQs
  async getFaqs(): Promise<FAQItem[]> {
    try {
      const res = await fetch('/api/faqs');
      const data = await res.json();
      return Array.isArray(data.faqs) ? data.faqs : [];
    } catch {
      return [];
    }
  },

  // Get Overview
  async getOverview(): Promise<{ documentCount: number; chunkCount: number; faqsCount: number }> {
    try {
      const res = await fetch('/api/overview');
      return await res.json();
    } catch {
      return { documentCount: 5, chunkCount: 11, faqsCount: 4 };
    }
  },

  // Unified Auth (Student & Staff)
  async login(
    email: string,
    password: string,
    roleType: 'student' | 'staff'
  ): Promise<{ success: boolean; token?: string; user?: AuthUser; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, roleType }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }
      if (data.token) {
        if (data.user?.role === 'admin') {
          sessionStorage.setItem('admin_token', data.token);
        } else {
          sessionStorage.setItem('student_token', data.token);
        }
        sessionStorage.setItem('auth_user', JSON.stringify(data.user));
      }
      return { success: true, token: data.token, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  },

  async loginAdmin(email: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const res = await this.login(email, password, 'staff');
    return { success: res.success, token: res.token, error: res.error };
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const stored = sessionStorage.getItem('auth_user');
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch {
      return null;
    }
  },

  async checkAdminAuth(): Promise<boolean> {
    try {
      const token = sessionStorage.getItem('admin_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/me', { headers });
      const data = await res.json();
      return !!data.authenticated;
    } catch {
      return false;
    }
  },

  async logoutAdmin(): Promise<void> {
    try {
      sessionStorage.removeItem('admin_token');
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
  },

  // Admin Documents
  async getAdminDocuments(): Promise<DocumentItem[]> {
    const token = sessionStorage.getItem('admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/admin/documents', { headers });
    const data = await res.json();
    return Array.isArray(data.documents) ? data.documents : [];
  },

  async uploadDocument(formData: FormData): Promise<DocumentItem> {
    const token = sessionStorage.getItem('admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/admin/documents/upload', {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to upload document');
    }
    return data.document;
  },

  async deleteDocument(id: string): Promise<void> {
    const token = sessionStorage.getItem('admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(`/api/admin/documents/${id}`, {
      method: 'DELETE',
      headers,
    });
  },

  async reprocessDocument(id: string): Promise<void> {
    const token = sessionStorage.getItem('admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(`/api/admin/documents/${id}/reprocess`, {
      method: 'POST',
      headers,
    });
  },

  // Admin Queries
  async getAdminQueries(): Promise<QueryRecord[]> {
    const token = sessionStorage.getItem('admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/admin/queries', { headers });
    const data = await res.json();
    return Array.isArray(data.queries) ? data.queries : [];
  },

  // Admin Unanswered
  async getAdminUnanswered(): Promise<UnansweredQuestion[]> {
    const token = sessionStorage.getItem('admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/admin/unanswered', { headers });
    const data = await res.json();
    return Array.isArray(data.unanswered) ? data.unanswered : [];
  },

  async resolveUnanswered(
    id: string,
    params: {
      staffNotes: string;
      addToKnowledgeBase?: boolean;
      answerContent?: string;
      category?: string;
    }
  ): Promise<void> {
    const token = sessionStorage.getItem('admin_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/admin/unanswered/${id}/resolve`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to resolve item');
    }
  },

  // Admin FAQs
  async addFaq(faq: { question: string; answer: string; category: string; documentTitle: string; page: number }): Promise<FAQItem> {
    const token = sessionStorage.getItem('admin_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/admin/faqs', {
      method: 'POST',
      headers,
      body: JSON.stringify(faq),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add FAQ');
    return data.faq;
  },

  async deleteFaq(id: string): Promise<void> {
    const token = sessionStorage.getItem('admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(`/api/admin/faqs/${id}`, {
      method: 'DELETE',
      headers,
    });
  },

  // Admin Security Logs
  async getSecurityLogs(): Promise<SecurityEvent[]> {
    const token = sessionStorage.getItem('admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/admin/logs', { headers });
    const data = await res.json();
    return Array.isArray(data.logs) ? data.logs : [];
  },
};
