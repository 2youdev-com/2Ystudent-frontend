/**
 * AI Teachers API Client
 * Handles CRUD operations for AI Teachers management
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface AITeacher {
  id: string;
  organizationId: string;
  name: string;
  displayNameAr: string;
  displayNameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  avatarUrl: string | null;
  voiceId: string | null;
  systemPromptAr: string | null;
  systemPromptEn: string | null;
  welcomeMessageAr: string | null;
  welcomeMessageEn: string | null;
  personality: 'friendly' | 'challenging' | 'professional' | 'wise';
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional' | 'general';
  isActive: boolean;
  isDefault: boolean;
  brainQueryPrefix: string | null;
  contextSource: 'brain' | 'user-history';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assignedStudents: number;
    documents: number;
  };
}

export interface AITeacherStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  currentSkillLevel: string | null;
  assignedTeacherAt: string | null;
  lastActiveAt: string | null;
}

export interface AvailableStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  currentSkillLevel: string | null;
  assignedTeacherId: string | null;
  assignedTeacher: string | null;
  currentTeacherName: { ar: string; en: string } | null;
}

export interface AITeacherDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  chunkCount: number;
  contentLevel: string;
  createdAt: string;
}

export interface CreateAITeacherData {
  name: string;
  displayNameAr: string;
  displayNameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  personality?: string;
  level?: string;
  voiceId?: string;
  systemPromptAr?: string;
  systemPromptEn?: string;
  welcomeMessageAr?: string;
  welcomeMessageEn?: string;
  brainQueryPrefix?: string;
  contextSource?: string;
  sortOrder?: number;
}

export interface UpdateAITeacherData {
  displayNameAr?: string;
  displayNameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  personality?: string;
  level?: string;
  voiceId?: string;
  systemPromptAr?: string;
  systemPromptEn?: string;
  welcomeMessageAr?: string;
  welcomeMessageEn?: string;
  brainQueryPrefix?: string;
  contextSource?: string;
  sortOrder?: number;
  isActive?: boolean;
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('auth-storage')
    : null;

  if (token) {
    try {
      const parsed = JSON.parse(token);
      const authToken = parsed?.state?.token;
      if (authToken) {
        return {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        };
      }
    } catch (e) {
      console.error('Failed to parse auth token:', e);
    }
  }

  return {
    'Content-Type': 'application/json',
  };
}

export const aiTeachersApi = {
  /**
   * List all AI teachers for the organization
   */
  async list(): Promise<{ teachers: AITeacher[] }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch teachers' }));
      throw new Error(error.error || 'Failed to fetch teachers');
    }

    return response.json();
  },

  /**
   * Get a single AI teacher by ID
   */
  async get(id: string): Promise<{ teacher: AITeacher }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch teacher' }));
      throw new Error(error.error || 'Failed to fetch teacher');
    }

    return response.json();
  },

  /**
   * Create a new AI teacher
   */
  async create(data: CreateAITeacherData): Promise<{ teacher: AITeacher }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create teacher' }));
      throw new Error(error.error || 'Failed to create teacher');
    }

    return response.json();
  },

  /**
   * Update an AI teacher
   */
  async update(id: string, data: UpdateAITeacherData): Promise<{ teacher: AITeacher }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update teacher' }));
      throw new Error(error.error || 'Failed to update teacher');
    }

    return response.json();
  },

  /**
   * Delete an AI teacher
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete teacher' }));
      throw new Error(error.error || 'Failed to delete teacher');
    }

    return response.json();
  },

  /**
   * Get students assigned to a teacher
   */
  async getStudents(id: string): Promise<{ trainees: AITeacherStudent[] }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers/${id}/trainees`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch students' }));
      throw new Error(error.error || 'Failed to fetch students');
    }

    return response.json();
  },

  /**
   * Get students available (not assigned) to a teacher
   */
  async getAvailableStudents(id: string): Promise<{ trainees: AvailableStudent[] }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers/${id}/available-trainees`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch available students' }));
      throw new Error(error.error || 'Failed to fetch available students');
    }

    return response.json();
  },

  /**
   * Get documents assigned to a teacher
   */
  async getDocuments(id: string): Promise<{ documents: AITeacherDocument[] }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers/${id}/documents`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch documents' }));
      throw new Error(error.error || 'Failed to fetch documents');
    }

    return response.json();
  },

  /**
   * Upload avatar for a teacher
   */
  async uploadAvatar(id: string, file: File): Promise<{ teacher: AITeacher }> {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('auth-storage')
      : null;

    let authToken = '';
    if (token) {
      try {
        const parsed = JSON.parse(token);
        authToken = parsed?.state?.token || '';
      } catch (e) {
        console.error('Failed to parse auth token:', e);
      }
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_URL}/admin/ai-teachers/${id}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload avatar' }));
      throw new Error(error.error || 'Failed to upload avatar');
    }

    return response.json();
  },

  /**
   * Seed default teachers (utility function)
   */
  async seedDefaults(): Promise<{ teachers: AITeacher[]; message: string }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers/seed`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to seed teachers' }));
      throw new Error(error.error || 'Failed to seed teachers');
    }

    return response.json();
  },

  /**
   * Add missing default teachers (doesn't overwrite existing)
   */
  async seedMissing(): Promise<{ message: string; createdCount: number; existingCount: number; createdNames?: string[] }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers/seed-missing`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({}), // Cloud Run needs content-length
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to seed missing teachers' }));
      throw new Error(error.error || 'Failed to seed missing teachers');
    }

    return response.json();
  },

  /**
   * Bulk assign students to a teacher
   */
  async assignStudents(teacherId: string, studentIds: string[]): Promise<{ message: string; assignedCount: number }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers/${teacherId}/assign-trainees`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ traineeIds: studentIds }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to assign students' }));
      throw new Error(error.error || 'Failed to assign students');
    }

    return response.json();
  },

  /**
   * Bulk unassign students from a teacher
   */
  async unassignStudents(teacherId: string, studentIds: string[]): Promise<{ message: string; unassignedCount: number }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers/${teacherId}/unassign-trainees`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ traineeIds: studentIds }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to unassign students' }));
      throw new Error(error.error || 'Failed to unassign students');
    }

    return response.json();
  },

  /**
   * Resync default teachers with latest prompts (only updates empty prompts)
   */
  async resync(): Promise<{ message: string; updatedCount: number }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers/resync`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to resync teachers' }));
      throw new Error(error.error || 'Failed to resync teachers');
    }

    return response.json();
  },

  /**
   * Force resync default teachers with latest prompts (overwrites existing)
   */
  async forceResync(): Promise<{ message: string; updatedCount: number }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers/force-resync`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to force-resync teachers' }));
      throw new Error(error.error || 'Failed to force-resync teachers');
    }

    return response.json();
  },

  /**
   * Reset all student evaluations (clear assignments and skill levels)
   */
  async resetEvaluations(): Promise<{ message: string; resetCount: number; deletedReports: number; deletedSessions: number }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers/reset-evaluations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({}), // Cloud Run needs content-length
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to reset evaluations' }));
      throw new Error(error.error || 'Failed to reset evaluations');
    }

    return response.json();
  },

  /**
   * Get all avatars (for lazy loading after initial data loads)
   */
  async getAvatars(): Promise<{ avatars: Record<string, string | null> }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers/avatars`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch avatars' }));
      throw new Error(error.error || 'Failed to fetch avatars');
    }

    return response.json();
  },

  /**
   * Get single teacher avatar (for lazy loading on detail page)
   */
  async getAvatar(id: string): Promise<{ avatarUrl: string | null }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers/${id}/avatar`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch avatar' }));
      throw new Error(error.error || 'Failed to fetch avatar');
    }

    return response.json();
  },

  /**
   * Sync avatars with default static images (updates existing teachers)
   */
  async syncAvatars(): Promise<{ message: string; updatedCount: number }> {
    const response = await fetch(`${API_URL}/admin/ai-teachers/sync-avatars`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to sync avatars' }));
      throw new Error(error.error || 'Failed to sync avatars');
    }

    return response.json();
  },
};

export default aiTeachersApi;
