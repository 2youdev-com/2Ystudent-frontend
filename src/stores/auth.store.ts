import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Multi-tenant role types (including SaaS Super Admin)
export type UserRole = 'student' | 'supervisor' | 'admin' | 'saas_super_admin';

// Role mapping for backward compatibility
const ROLE_MAP: Record<string, UserRole> = {
  user: 'student',
  admin: 'admin',
  student: 'student',
  supervisor: 'supervisor',
  saas_super_admin: 'saas_super_admin',
  // Legacy role names (backward compatibility with backend)
  trainee: 'student',
  trainer: 'supervisor',
  org_admin: 'admin',
};

export function normalizeRole(role: string): UserRole {
  return ROLE_MAP[role] || 'student';
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
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
}

interface ImpersonationState {
  originalToken: string;
  originalUser: User;
  impersonatedOrgId: string;
  impersonatedOrgName: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  impersonation: ImpersonationState | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  startImpersonation: (impersonationToken: string, orgId: string, orgName: string) => void;
  endImpersonation: () => void;
  isImpersonating: () => boolean;
}

// Permission hooks and helpers
export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  return {
    // Role checks
    isAdmin: user?.role === 'admin',
    isSupervisor: user?.role === 'supervisor',
    isStudent: user?.role === 'student',
    isSuperAdmin: user?.role === 'saas_super_admin',

    // Organization-level permission checks
    canManageUsers: user?.role === 'admin',
    canManageGroups: user?.role === 'admin',
    canViewStudents: user?.role === 'admin' || user?.role === 'supervisor',
    canAddNotes: user?.role === 'admin' || user?.role === 'supervisor',
    canSendWarnings: user?.role === 'admin' || user?.role === 'supervisor',
    canBroadcast: user?.role === 'admin',

    // SaaS Super Admin permission checks
    canAccessSuperAdmin: user?.role === 'saas_super_admin',
    canManageOrganizations: user?.role === 'saas_super_admin',
    canManageSubscriptions: user?.role === 'saas_super_admin',
    canViewGlobalAnalytics: user?.role === 'saas_super_admin',
    canImpersonateOrgs: user?.role === 'saas_super_admin',
    canViewAuditLogs: user?.role === 'saas_super_admin',

    // Helper to check if user has any of the given roles
    hasRole: (...roles: UserRole[]) => user?.role && roles.includes(user.role),
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      impersonation: null,

      setAuth: (token: string, user: User) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
        }
        // Normalize role for backward compatibility
        const normalizedUser = {
          ...user,
          role: normalizeRole(user.role),
        };
        set({ token, user: normalizedUser, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          // Clear all auth-related localStorage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('impersonation_token');
          localStorage.removeItem('auth-storage');

          // Clear ALL session storage (teacher states, welcome flags, etc.)
          sessionStorage.clear();
        }
        set({ token: null, user: null, isAuthenticated: false, impersonation: null });
      },

      startImpersonation: (impersonationToken: string, orgId: string, orgName: string) => {
        const state = get();
        if (!state.token || !state.user) return;

        // Store original auth state
        const impersonationState: ImpersonationState = {
          originalToken: state.token,
          originalUser: state.user,
          impersonatedOrgId: orgId,
          impersonatedOrgName: orgName,
        };

        // Update token to impersonation token
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', impersonationToken);
          localStorage.setItem('impersonation_token', impersonationToken);
        }

        // Create impersonated user (admin role for the impersonated org)
        const impersonatedUser: User = {
          ...state.user,
          role: 'admin',
          organizationId: orgId,
        };

        set({
          token: impersonationToken,
          user: impersonatedUser,
          impersonation: impersonationState,
        });
      },

      endImpersonation: () => {
        const state = get();
        if (!state.impersonation) return;

        // Restore original auth state
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', state.impersonation.originalToken);
          localStorage.removeItem('impersonation_token');
        }

        set({
          token: state.impersonation.originalToken,
          user: state.impersonation.originalUser,
          impersonation: null,
        });
      },

      isImpersonating: () => {
        return get().impersonation !== null;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, impersonation: state.impersonation }),
      // Sync auth_token to localStorage on rehydration for API client
      onRehydrateStorage: () => (state) => {
        if (state?.token && typeof window !== 'undefined') {
          localStorage.setItem('auth_token', state.token);
        }
      },
    }
  )
);
