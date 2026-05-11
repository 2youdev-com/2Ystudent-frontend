'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth.store';
import { useDiagnosticStore } from '@/stores/diagnostic.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { CompactSettings } from '@/components/ui/LanguageToggle';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  MessageSquare,
  BarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ClipboardCheck,
  Layers,
  Zap,
  GraduationCap,
  TrendingUp,
  Bot,
  Lock,
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { FloatingAdminReturn } from '@/components/admin/ViewModeSwitcher';

interface NavSection {
  label: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }[];
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, token, isAuthenticated } = useAuthStore();
  const diagnosticStore = useDiagnosticStore();
  const { t, isRTL, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeNav, setActiveNav] = useState(pathname);
  const [isNavigating, setIsNavigating] = useState(false);

  // BUG-022: Determine if student is locked out pending assessment
  const isStudentRole = user?.role !== 'saas_super_admin' && user?.role !== 'admin' && user?.role !== 'supervisor';
  const isAssessmentLocked = isStudentRole && !user?.assignedTeacher && diagnosticStore.assessmentRequired && diagnosticStore.assessmentPhase !== 'done';

  const navSections: NavSection[] = useMemo(() => [
    {
      label: 'Main',
      items: [
        { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard, description: t.nav.dashboardDesc },
      ],
    },
    {
      label: 'Learning',
      items: [
        { href: '/courses', label: t.nav.courses, icon: BookOpen, description: t.nav.coursesDesc },
        { href: '/ai-teacher', label: 'AI Teacher', icon: Bot, description: 'Study with your AI teacher' },
        { href: '/simulation', label: t.nav.simulations, icon: MessageSquare, description: t.nav.simulationsDesc },
        { href: '/quizzes', label: t.quiz.quizzes, icon: ClipboardCheck, description: t.quiz.quizzesDesc },
        { href: '/flashcards', label: t.flashcard.flashcards, icon: Layers, description: t.flashcard.description },
      ],
    },
    {
      label: 'Analytics',
      items: [
        { href: '/reports', label: t.nav.reports, icon: BarChart, description: t.nav.reportsDesc },
      ],
    },
  ], [t.nav, t.quiz, t.flashcard]);

  const handleNavClick = useCallback((href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    // BUG-022: Block navigation to non-dashboard pages when assessment is locked
    if (isAssessmentLocked && href !== '/dashboard') {
      router.push('/assessment');
      return;
    }
    if (pathname === href) return;
    setActiveNav(href);
    setIsNavigating(true);
    router.push(href);
  }, [pathname, router, isAssessmentLocked]);

  const handleLogout = useCallback(() => {
    logout();
    // Hard redirect is already handled inside logout() via window.location.href
  }, [logout]);

  const getInitials = useCallback(() => {
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  }, [user?.firstName, user?.lastName]);

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  useEffect(() => { setIsHydrated(true); }, []);

  useEffect(() => {
    setActiveNav(pathname);
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    if (isHydrated && !token && !isAuthenticated) {
      const authStorage = localStorage.getItem('auth-storage');
      if (!authStorage) {
        router.push('/login');
      } else {
        try {
          const parsed = JSON.parse(authStorage);
          if (!parsed?.state?.token) router.push('/login');
        } catch {
          router.push('/login');
        }
      }
    }
    if (isHydrated && user?.role === 'saas_super_admin') {
      router.push('/super-admin');
    }
  }, [isHydrated, token, isAuthenticated, router, user?.role]);

  useEffect(() => {
    if (!isHydrated || !token) return;
    if (user?.role === 'saas_super_admin' || user?.role === 'admin' || user?.role === 'supervisor') return;
    if (user?.assignedTeacher) {
      if (diagnosticStore.assessmentRequired) diagnosticStore.reset();
      return;
    }

    // BUG-022: If initial check hasn't completed yet, trigger it immediately
    if (!diagnosticStore.initialCheckDone) {
      if (!diagnosticStore.isCheckingStatus) {
        diagnosticStore.checkAndSetStatus();
      }
      return; // Don't proceed until initial check is done
    }

    if (pathname === '/assessment') return;
    const phase = diagnosticStore.assessmentPhase;
    if ((pathname === '/simulation' || pathname === '/voice-training') &&
        phase !== 'idle' && phase !== 'done') return;
    if (diagnosticStore.assessmentRequired && phase !== 'done') {
      router.push('/assessment');
      return;
    }
    const timeSinceLastCheck = Date.now() - (diagnosticStore.lastCheckTimestamp || 0);
    const isNewSession = !diagnosticStore.lastCheckTimestamp || timeSinceLastCheck > 300000;
    const shouldCheck = isNewSession || timeSinceLastCheck > 60000;
    if (shouldCheck) diagnosticStore.checkAndSetStatus();
  }, [isHydrated, token, pathname, user?.role, user?.assignedTeacher, diagnosticStore, router]);

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

  // BUG-022: Block rendering until initial diagnostic check completes for students
  if (isStudentRole && !user?.assignedTeacher && !diagnosticStore.initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#0089B8]" />
          <span className="text-sm text-muted-foreground font-medium">Checking your profile...</span>
        </div>
      </div>
    );
  }

  const renderNavItems = (isMobile = false) => (
    <nav className="flex-1 px-3 py-3 overflow-y-auto" key={`nav-${language}-${isMobile ? 'mobile' : 'desktop'}`}>
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
              const isActive = activeNav === item.href;
              const isLocked = isAssessmentLocked && item.href !== '/dashboard';
              return (
                <Link
                  key={`${isMobile ? 'mobile-' : ''}${item.href}-${language}`}
                  href={item.href}
                  prefetch={!isLocked}
                  onClick={(e) => {
                    handleNavClick(item.href)(e);
                    if (isMobile) setMobileMenuOpen(false);
                  }}
                >
                  <div
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative',
                      isLocked
                        ? 'text-gray-600 cursor-not-allowed opacity-50'
                        : isActive
                          ? 'bg-[#0089B8]/15 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.06]',
                      isNavigating && activeNav === item.href && 'opacity-80'
                    )}
                  >
                    {/* Active accent bar */}
                    {isActive && !isLocked && (
                      <div className={cn(
                        'absolute top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full',
                        'bg-gradient-to-b from-[#0089B8] to-[#00B4D8]',
                        isRTL ? 'right-0' : 'left-0'
                      )} />
                    )}

                    {/* Icon with background */}
                    <div className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 shrink-0',
                      isLocked
                        ? 'bg-white/[0.02]'
                        : isActive
                          ? 'bg-[#0089B8]/20'
                          : 'bg-white/[0.04] group-hover:bg-white/[0.08]'
                    )}>
                      {isLocked ? (
                        <Lock className="h-[16px] w-[16px] text-gray-600" />
                      ) : (
                        <Icon className={cn(
                          'h-[18px] w-[18px] transition-colors duration-200',
                          isActive ? 'text-[#0089B8]' : 'text-gray-500 group-hover:text-gray-300'
                        )} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        'text-[13px] font-medium truncate block transition-colors duration-200',
                        isLocked ? 'text-gray-600' : isActive ? 'text-white' : 'group-hover:text-white'
                      )}>
                        {item.label}
                      </span>
                    </div>

                    {/* Lock icon or Active indicator dot */}
                    {isLocked ? (
                      <Lock className="h-3 w-3 text-gray-600 shrink-0" />
                    ) : isActive ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0089B8] shrink-0" />
                    ) : null}
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
              <GraduationCap className="h-3 w-3 text-[#0089B8]" />
              <span className="text-[11px] text-[#0089B8] font-medium">Learner</span>
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
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 w-[260px] hidden lg:flex flex-col z-30',
          'bg-gradient-to-b from-[#162B46] via-[#162B46] to-[#0F1F35]',
          isRTL ? 'right-0' : 'left-0'
        )}
        key={`sidebar-${language}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5" prefetch={true}>
            <img src="/images/logo-white.png" alt="2YStudy" className="h-8 w-auto" />
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
        <header className="h-14 bg-[#162B46] flex items-center justify-between px-4 lg:hidden">
          <Avatar className="h-8 w-8 ring-1 ring-white/20">
            <AvatarFallback className="bg-gradient-to-br from-[#0089B8] to-[#00B4D8] text-white text-xs font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/images/logo-white.png" alt="2YStudy" className="h-6 w-auto" />
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
          {children}
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
        key={`mobile-sidebar-${language}`}
        className={cn(
          'fixed inset-y-0 z-50 w-[280px] transform transition-transform duration-300 lg:hidden shadow-2xl',
          'bg-gradient-to-b from-[#162B46] via-[#162B46] to-[#0F1F35]',
          isRTL
            ? cn('right-0', mobileMenuOpen ? 'translate-x-0' : 'translate-x-full')
            : cn('left-0', mobileMenuOpen ? 'translate-x-0' : '-translate-x-full')
        )}
      >
        <div className="h-16 flex items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5" prefetch={true}>
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

      <FloatingAdminReturn />
    </div>
  );
}
