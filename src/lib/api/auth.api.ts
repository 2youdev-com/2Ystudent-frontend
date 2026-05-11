import { apiClient } from './client';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  // For existing organization
  organizationId?: string;
  // For new organization onboarding (self-registration)
  organizationName?: string;
  industryType?: string;
  teamSize?: string;
  jobTitle?: string;
}

export interface AuthResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organizationId?: string;
    // Teacher assignment info (for students)
    assignedTeacher?: string | null;
    assignedTeacherId?: string | null;
    currentSkillLevel?: string | null;
    // Custom teacher info (from backend)
    assignedTeacherAvatar?: string | null;
    assignedTeacherDisplayNameAr?: string | null;
    assignedTeacherDisplayNameEn?: string | null;
    assignedTeacherVoiceId?: string | null;
  };
}

// Mock user data for development when backend is unavailable
const MOCK_USERS: Record<string, { password: string; user: AuthResult['user'] }> = {
  'admin@example.com': {
    password: 'admin123',
    user: {
      id: 'admin-001',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      organizationId: 'default-org',
    },
  },
  'supervisor@example.com': {
    password: 'supervisor123',
    user: {
      id: 'supervisor-001',
      email: 'supervisor@example.com',
      firstName: 'Test',
      lastName: 'Supervisor',
      role: 'supervisor',
      organizationId: 'default-org',
    },
  },
  'student@example.com': {
    password: 'student123',
    user: {
      id: 'student-001',
      email: 'student@example.com',
      firstName: 'Test',
      lastName: 'Student',
      role: 'student',
      organizationId: 'default-org',
    },
  },
  'mostafa@gmail.com': {
    password: 'password123',
    user: {
      id: 'user-001',
      email: 'mark@gmail.com',
      firstName: 'Mark',
      lastName: 'User',
      role: 'student',
      organizationId: 'default-org',
    },
  },
};

// Helper to create mock login for development
const mockLogin = async (input: LoginInput): Promise<AuthResult> => {
  console.log('[Auth] Using mock authentication (backend unavailable)');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockUser = MOCK_USERS[input.email.toLowerCase()];

  if (mockUser && mockUser.password === input.password) {
    return {
      accessToken: `mock-token-${Date.now()}`,
      user: mockUser.user,
    };
  }

  // Allow any email/password combo in dev mode with a generic user
  if (process.env.NODE_ENV === 'development') {
    const emailParts = input.email.split('@');
    const firstName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
    return {
      accessToken: `mock-token-${Date.now()}`,
      user: {
        id: `user-${Date.now()}`,
        email: input.email,
        firstName: firstName,
        lastName: 'User',
        role: 'student',
      },
    };
  }

  throw new Error('Invalid email or password');
};

export const authApi = {
  login: async (input: LoginInput): Promise<AuthResult> => {
    // Always use real API - no mock fallback for proper error handling
    return await apiClient.post<AuthResult>('/auth/login', input);
  },

  register: async (input: RegisterInput): Promise<AuthResult> => {
    return apiClient.post<AuthResult>('/auth/register', input);
  },

  getCurrentUser: async (): Promise<{ userId: string; email: string; role: string }> => {
    return apiClient.get('/auth/me');
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    return apiClient.post('/auth/change-password', { currentPassword, newPassword });
  },

  forgotPassword: async (email: string): Promise<void> => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  },
};
