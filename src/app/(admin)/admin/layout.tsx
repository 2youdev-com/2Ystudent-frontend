'use client';

/**
 * 2YStudy Admin Layout
 *
 * Professional admin dashboard with:
 * - Dark navy sidebar with sectioned navigation
 * - Teal accent color (#0089B8)
 * - View mode switching (Admin ↔ Student)
 * - Full RTL/Arabic support
 * - Role-based navigation (Supervisor vs Admin)
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore, usePermissions } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { CompactSettings } from '@/components/ui/LanguageToggle';
import { ViewModeSwitcher, FloatingAdminReturn } from '@/components/admin/ViewModeSwitcher';
import { AdminRoleProvider } from '@/contexts/AdminRoleContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UsersRound,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Phone,
  Loader2,
  Shield,
  ArrowLeft,
  CreditCard,
  GraduationCap,
  ClipboardCheck,
  Layers,
  BookOpen,
  Zap,
  Bot,
  Brain,
  MessageSquare,
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';

interface NavSection {
  label: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, token, isAuthenticated, impersonation, endImpersonation } = useAuthStore();
  const { t, isRTL, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeNav, setActiveNav] = useState(pathname);
  const [isNavigating, setIsNavigating] = useState(false);

  // Check if impersonating
  const isImpersonating = impersonation !== null;

  // Check if user is a supervisor (limited access)
  const isSupervisor = user?.role === 'supervisor';
  const isAdmin = user?.role === 'admin';

  // Handle ending impersonation
  const handleEndImpersonation = useCallback(() => {
    endImpersonation();
    router.push('/super-admin/organizations');
  }, [endImpersonation, router]);

  // Admin navigation sections - filtered based on role
  const navSections: NavSection[] = useMemo(() => {
    const currentRole = user?.role || 'student';

    const allSections = [
      {
        label: 'Management',
        items: [
          {
            href: '/admin',
            label: 'Dashboard',
            icon: LayoutDashboard,
            description: isSupervisor ? 'Your groups overview' : 'Team overview',
            showFor: ['supervisor', 'admin'],
          },
          {
            href: '/admin/employees',
            label: isSupervisor ? 'My Students' : 'Students',
            icon: isSupervisor ? GraduationCap : Users,
            description: isSupervisor ? 'View your students' : 'Manage students',
            showFor: ['supervisor', 'admin'],
          },
          {
            href: '/admin/groups',
            label: isSupervisor ? 'My Groups' : 'Groups',
            icon: UsersRound,
            description: isSupervisor ? 'View your groups' : 'Manage groups',
            showFor: ['supervisor', 'admin'],
          },
        ],
      },
      {
        label: 'Learning',
        items: [
          {
            href: '/admin/voice-sessions',
            label: 'Voice Sessions',
            icon: Phone,
            description: isSupervisor ? 'Monitor your students calls' : 'Monitor calls',
            showFor: ['supervisor', 'admin'],
          },
          {
            href: '/admin/simulation-topics',
            label: 'Session Topics',
            icon: MessageSquare,
            description: 'Manage live session topics',
            showFor: ['admin'],
          },
          {
            href: '/admin/quizzes',
            label: 'Quizzes',
            icon: ClipboardCheck,
            description: isSupervisor ? 'Manage your quizzes' : 'Manage quizzes',
            showFor: ['supervisor', 'admin'],
          },
          {
            href: '/admin/flashcards',
            label: 'Flashcards',
            icon: Layers,
            description: isSupervisor ? 'Manage your flashcards' : 'Manage flashcards',
            showFor: ['supervisor', 'admin'],
          },
          {
            href: '/admin/courses',
            label: 'Learning Courses',
            icon: BookOpen,
            description: 'Manage courses & lectures',
            showFor: ['admin', 'supervisor'],
          },
          {
            href: '/admin/ai-teachers',
            label: 'AI Teachers',
            icon: Bot,
            description: 'Manage AI teacher personas',
            showFor: ['admin'],
          },
          {
            href: '/admin/brain',
            label: 'Knowledge Base',
            icon: Brain,
            description: 'Upload training documents',
            showFor: ['admin'],
          },
        ],
      },
      {
        label: 'Analytics',
        items: [
          {
            href: '/admin/reports',
            label: 'Reports',
            icon: BarChart3,
            description: isSupervisor ? 'Your students reports' : 'Reports & analytics',
            showFor: ['supervisor', 'admin'],
          },
        ],
      },
      {
        label: 'Settings',
        items: [
          {
            href: '/admin/billing',
            label: 'Billing',
            icon: CreditCard,
            description: 'Billing & usage',
            showFor: ['admin'],
          },
          {
            href: '/admin/settings',
            label: 'Settings',
            icon: Settings,
            description: 'System settings',
            showFor: ['admin'],
          },
        ],
      },
    ];

    return allSections
      .map(section => ({
        label: section.label,
        items: section.items
          .filter(item => item.showFor.includes(currentRole))
          .map(({ showFor, ...rest }) => rest),
      }))
      .filter(section => section.items.length > 0);
  }, [isSupervisor, user?.role]);

  // Optimized navigation handler
  const handleNavClick = useCallback((href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === href) return;
    setActiveNav(href);
    setIsNavigating(true);
    router.push(href);
  }, [pathname, router]);

  const handleLogout = useCallback(() => {
    logout();
    // Hard redirect is already handled inside logout() via window.location.href
  }, [logout]);

  const getInitials = useCallback(() => {
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'A';
  }, [user?.firstName, user?.lastName]);

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setActiveNav(pathname);
    setIsNavigating(false);
  }, [pathname]);

  const hasAdminAccess = user?.role === 'admin' || user?.role === 'supervisor' || isImpersonating;

  useEffect(() => {
    if (isHydrated && !token && !isAuthenticated) {
      router.replace('/login');
    } else if (isHydrated && user && !hasAdminAccess) {
      if (user.role === 'saas_super_admin') {
        router.replace('/super-admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isHydrated, token, isAuthenticated, user, router, hasAdminAccess]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#0089B8]" />
          <span className="text-sm text-muted-foreground font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || !hasAdminAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  const renderNavItems = (isMobile = false) => (
    <nav className="flex-1 px-3 py-3 overflow-y-auto" key={`admin-nav-${language}-${isMobile ? 'mobile' : 'desktop'}`}>
      {navSections.map((section, sectionIdx) => (
        <div key={`section-${sectionIdx}-${language}`} className={cn(sectionIdx > 0 && 'mt-5')}>
          {/* Section label */}
          <div className="px-3 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
              {section.label}
            </span>
          </div>

          {/* Section items */}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.href || (item.href !== '/admin' && activeNav.startsWith(item.href));

              return (
                <Link
                  key={`${isMobile ? 'mobile-' : ''}${item.href}-${language}`}
                  href={item.href}
                  prefetch={true}
                  onClick={(e) => {
                    handleNavClick(item.href)(e);
                    if (isMobile) setMobileMenuOpen(false);
                  }}
                >
                  <div
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative',
                      isActive
                        ? 'bg-[#0089B8]/15 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.06]',
                      isNavigating && activeNav === item.href && 'opacity-80'
                    )}
                  >
                    {/* Active accent bar */}
                    {isActive && (
                      <div className={cn(
                        'absolute top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full',
                        'bg-gradient-to-b from-[#0089B8] to-[#00B4D8]',
                        isRTL ? 'right-0' : 'left-0'
                      )} />
                    )}

                    {/* Icon with background */}
                    <div className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 shrink-0',
                      isActive
                        ? 'bg-[#0089B8]/20'
                        : 'bg-white/[0.04] group-hover:bg-white/[0.08]'
                    )}>
                      <Icon className={cn(
                        'h-[18px] w-[18px] transition-colors duration-200',
                        isActive ? 'text-[#0089B8]' : 'text-gray-500 group-hover:text-gray-300'
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        'text-[13px] font-medium truncate block transition-colors duration-200',
                        isActive ? 'text-white' : 'group-hover:text-white'
                      )}>
                        {item.label}
                      </span>
                    </div>

                    {/* Active indicator dot */}
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0089B8] shrink-0" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const renderUserSection = () => (
    <div className="p-3 space-y-3">
      {/* View Mode Switcher */}
      <ViewModeSwitcher className="w-full" />

      {/* Theme toggle */}
      <div className="flex justify-center px-2">
        <CompactSettings appearance="dark" />
      </div>

      {/* Separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* User profile card */}
      <div className="relative rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-3 border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-[#0089B8]/30 ring-offset-1 ring-offset-[#162B46]">
              <AvatarFallback className="bg-gradient-to-br from-[#0089B8] to-[#00B4D8] text-white text-xs font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#162B46]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shield className="h-3 w-3 text-[#0089B8]" />
              <span className="text-[11px] text-[#0089B8] font-medium">
                {isSupervisor ? 'Supervisor' : 'Admin'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <button
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-500 hover:text-red-400 hover:bg-red-400/[0.06] rounded-lg text-xs font-medium transition-all duration-200"
        onClick={handleLogout}
      >
        <LogOut className="h-3.5 w-3.5" />
        {t.auth.signOut}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white py-2 px-4">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">
                {`Impersonating: ${impersonation?.impersonatedOrgName}`}
              </span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleEndImpersonation}
              className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <ArrowLeft className={cn("h-3 w-3", isRTL ? "ml-1 rotate-180" : "mr-1")} />
              Exit Impersonation
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed bottom-0 w-[260px] hidden lg:flex flex-col z-30',
          'bg-gradient-to-b from-[#162B46] via-[#162B46] to-[#0F1F35]',
          isImpersonating ? 'top-10' : 'top-0',
          isRTL ? 'right-0' : 'left-0'
        )}
        key={`admin-sidebar-${language}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5">
          <Link href="/admin" className="flex items-center gap-2.5" prefetch={true}>
            <img src="/images/logo-white.png" alt="2YStudy" className="h-8 w-auto" />
            <span className="text-[10px] font-semibold text-[#0089B8] bg-[#0089B8]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {isSupervisor ? 'Sup' : 'Admin'}
            </span>
          </Link>
        </div>

        {/* Accent line under logo */}
        <div className="mx-4 h-px bg-gradient-to-r from-[#0089B8]/40 via-[#0089B8]/10 to-transparent" />

        {renderNavItems()}
        {renderUserSection()}
      </aside>

      {/* Main content */}
      <div className={cn(
        'min-h-screen flex flex-col',
        isRTL ? 'lg:mr-[260px]' : 'lg:ml-[260px]'
      )}>
        {/* Mobile header */}
        <header className={cn(
          'h-14 bg-[#162B46] flex items-center justify-between px-4 lg:hidden',
          isImpersonating && 'mt-10'
        )}>
          <Avatar className="h-8 w-8 ring-1 ring-white/20">
            <AvatarFallback className="bg-gradient-to-br from-[#0089B8] to-[#00B4D8] text-white text-xs font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <Link href="/admin" className="flex items-center gap-2">
            <img src="/images/logo-white.png" alt="2YStudy" className="h-6 w-auto" />
            <span className="text-[9px] font-semibold text-[#0089B8] bg-[#0089B8]/10 px-1.5 py-0.5 rounded-full uppercase">
              {isSupervisor ? 'Sup' : 'Admin'}
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-gray-300 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background">
          <AdminRoleProvider>
            <div className="p-4 lg:p-6 xl:p-8">
              {children}
            </div>
          </AdminRoleProvider>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        key={`admin-mobile-sidebar-${language}`}
        className={cn(
          'fixed inset-y-0 z-50 w-[280px] transform transition-transform duration-300 lg:hidden shadow-2xl',
          'bg-gradient-to-b from-[#162B46] via-[#162B46] to-[#0F1F35]',
          isRTL
            ? cn('right-0', mobileMenuOpen ? 'translate-x-0' : 'translate-x-full')
            : cn('left-0', mobileMenuOpen ? 'translate-x-0' : '-translate-x-full')
        )}
      >
        <div className="h-16 flex items-center justify-between px-5">
          <Link href="/admin" className="flex items-center gap-2.5" prefetch={true}>
            <img src="/images/logo-white.png" alt="2YStudy" className="h-8 w-auto" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Accent line */}
        <div className="mx-4 h-px bg-gradient-to-r from-[#0089B8]/40 via-[#0089B8]/10 to-transparent" />

        {renderNavItems(true)}
        {renderUserSection()}
      </aside>

      {/* Floating button for navigation to student page */}
      <FloatingAdminReturn />
    </div>
  );
}
