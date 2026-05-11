'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { adminApi, RoleInfo } from '@/lib/api/admin.api';
import { useAuthStore } from '@/stores/auth.store';

interface AdminRoleContextValue {
  roleInfo: RoleInfo | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isSupervisor: boolean;
  isAdmin: boolean;
  permissions: RoleInfo['permissions'] | null;
}

const AdminRoleContext = createContext<AdminRoleContextValue | null>(null);

export function AdminRoleProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuthStore();
  const [roleInfo, setRoleInfo] = useState<RoleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoleInfo = useCallback(async () => {
    if (!token || !user) {
      setRoleInfo(null);
      setLoading(false);
      return;
    }

    // Only fetch for admin-level users
    if (user.role !== 'admin' && user.role !== 'supervisor') {
      setRoleInfo(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const info = await adminApi.getRoleInfo();
      setRoleInfo(info);
    } catch (err) {
      console.error('Failed to fetch role info:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch role info');
      // Fallback based on auth store user
      setRoleInfo({
        role: user.role,
        isTrainer: user.role === 'supervisor',
        isOrgAdmin: user.role === 'admin',
        organizationId: user.organizationId || '',
        permissions: {
          canViewAllEmployees: user.role === 'admin',
          canCreateGroups: user.role === 'admin',
          canDeleteGroups: user.role === 'admin',
          canManageTrainers: user.role === 'admin',
          canManageAdmins: user.role === 'admin',
          canViewOrgWideStats: user.role === 'admin',
          canModifyEmployees: user.role === 'admin',
        },
      });
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchRoleInfo();
  }, [fetchRoleInfo]);

  const value: AdminRoleContextValue = {
    roleInfo,
    loading,
    error,
    refresh: fetchRoleInfo,
    isSupervisor: roleInfo?.isTrainer ?? user?.role === 'supervisor',
    isAdmin: roleInfo?.isOrgAdmin ?? user?.role === 'admin',
    permissions: roleInfo?.permissions ?? null,
  };

  return (
    <AdminRoleContext.Provider value={value}>
      {children}
    </AdminRoleContext.Provider>
  );
}

export function useAdminRole() {
  const context = useContext(AdminRoleContext);
  if (!context) {
    throw new Error('useAdminRole must be used within AdminRoleProvider');
  }
  return context;
}

// Hook that provides safe defaults if not in AdminRoleProvider
export function useAdminRoleSafe(): AdminRoleContextValue {
  const context = useContext(AdminRoleContext);
  const { user } = useAuthStore();

  if (context) {
    return context;
  }

  // Return safe defaults
  return {
    roleInfo: null,
    loading: false,
    error: null,
    refresh: async () => {},
    isSupervisor: user?.role === 'supervisor',
    isAdmin: user?.role === 'admin',
    permissions: user?.role === 'admin' ? {
      canViewAllEmployees: true,
      canCreateGroups: true,
      canDeleteGroups: true,
      canManageTrainers: true,
      canManageAdmins: true,
      canViewOrgWideStats: true,
      canModifyEmployees: true,
    } : {
      canViewAllEmployees: false,
      canCreateGroups: false,
      canDeleteGroups: false,
      canManageTrainers: false,
      canManageAdmins: false,
      canViewOrgWideStats: false,
      canModifyEmployees: false,
    },
  };
}
