'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth.context';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { CompactSettings } from '@/components/ui/LanguageToggle';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  ChevronLeft,
  Crown,
  Loader2,
  Zap,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavSection {
  label: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { token, user, logout } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const { isSuperAdmin } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeNav, setActiveNav] = useState(pathname);

  const navSections: NavSection[] = useMemo(
    () => [
      {
        label: 'Overview',
        items: [
          { href: '/super-admin', label: 'Dashboard', icon: LayoutDashboard },
        ],
      },
      {
        label: 'Management',
        items: [
          { href: '/super-admin/organizations', label: 'Organizations', icon: Building2 },
          { href: '/super-admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
          { href: '/super-admin/users', label: 'Users', icon: Users },
        ],
      },
      {
        label: 'Insights',
        items: [
          { href: '/super-admin/analytics', label: 'Analytics', icon: BarChart3 },
          { href: '/super-admin/reports', label: 'Reports', icon: FileText },
          { href: '/super-admin/audit-logs', label: 'Audit Logs', icon: Shield },
        ],
      },
      {
        label: 'System',
        items: [
          { href: '/super-admin/settings', label: 'Settings', icon: Settings },
        ],
      },
    ],
    []
  );

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setActiveNav(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!token) {
      router.replace('/login');
      return;
    }
    if (user && !isSuperAdmin) {
      if (user.role === 'admin' || user.role === 'supervisor') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [token, user, isSuperAdmin, router, isHydrated]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/super-admin') {
      return pathname === '/super-admin';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    // Hard redirect is already handled inside logout() via window.location.href
  };

  const getInitials = () => {
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'SA';
  };

  if (!isHydrated || !token || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          <span className="text-sm text-muted-foreground font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  const renderNavItems = (isMobile = false) => (
    <nav className="flex-1 px-3 py-3 overflow-y-auto" key={`sa-nav-${language}-${isMobile ? 'mobile' : 'desktop'}`}>
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
              const active = isActive(item.href);

              return (
                <Link
                  key={`${isMobile ? 'mobile-' : ''}${item.href}-${language}`}
                  href={item.href}
                  onClick={() => {
                    if (isMobile) setMobileMenuOpen(false);
                  }}
                >
                  <div
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative',
                      active
                        ? 'bg-rose-500/15 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
                    )}
                  >
                    {/* Active accent bar */}
                    {active && (
                      <div className={cn(
                        'absolute top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full',
                        'bg-gradient-to-b from-rose-500 to-rose-400',
                        isRTL ? 'right-0' : 'left-0'
                      )} />
                    )}

                    {/* Icon with background */}
                    <div className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 shrink-0',
                      active
                        ? 'bg-rose-500/20'
                        : 'bg-white/[0.04] group-hover:bg-white/[0.08]'
                    )}>
                      <Icon className={cn(
                        'h-[18px] w-[18px] transition-colors duration-200',
                        active ? 'text-rose-500' : 'text-gray-500 group-hover:text-gray-300'
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        'text-[13px] font-medium truncate block transition-colors duration-200',
                        active ? 'text-white' : 'group-hover:text-white'
                      )}>
                        {item.label}
                      </span>
                    </div>

                    {/* Active indicator dot */}
                    {active && (
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
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
            <Avatar className="h-10 w-10 ring-2 ring-rose-500/30 ring-offset-1 ring-offset-[#162B46]">
              <AvatarFallback className="bg-gradient-to-br from-rose-500 to-rose-400 text-white text-xs font-bold">
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
              <Crown className="h-3 w-3 text-rose-500" />
              <span className="text-[11px] text-rose-500 font-medium">Platform Admin</span>
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
        Sign Out
      </button>
    </div>
  );

  return (
    <div className={cn('min-h-screen bg-background', isRTL && 'rtl')}>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 w-[260px] hidden lg:flex flex-col z-30',
          'bg-gradient-to-b from-[#162B46] via-[#162B46] to-[#0F1F35]',
          isRTL ? 'right-0' : 'left-0'
        )}
        key={`sa-sidebar-${language}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5">
          <Link href="/super-admin" className="flex items-center gap-2.5">
            <img src="/images/logo-white.png" alt="2YStudy" className="h-8 w-auto" />
            <span className="text-[10px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Platform
            </span>
          </Link>
        </div>

        {/* Accent line under logo */}
        <div className="mx-4 h-px bg-gradient-to-r from-rose-500/40 via-rose-500/10 to-transparent" />

        {renderNavItems()}
        {renderUserSection()}
      </aside>

      {/* Mobile Header */}
      <header className="h-14 bg-[#162B46] flex items-center justify-between px-4 lg:hidden">
        <Avatar className="h-8 w-8 ring-1 ring-white/20">
          <AvatarFallback className="bg-gradient-to-br from-rose-500 to-rose-400 text-white text-xs font-bold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <Link href="/super-admin" className="flex items-center gap-2">
          <img src="/images/logo-white.png" alt="2YStudy" className="h-6 w-auto" />
          <span className="text-[9px] font-semibold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full uppercase">
            Platform
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        key={`sa-mobile-sidebar-${language}`}
        className={cn(
          'fixed inset-y-0 z-50 w-[280px] transform transition-transform duration-300 lg:hidden shadow-2xl',
          'bg-gradient-to-b from-[#162B46] via-[#162B46] to-[#0F1F35]',
          isRTL
            ? cn('right-0', mobileMenuOpen ? 'translate-x-0' : 'translate-x-full')
            : cn('left-0', mobileMenuOpen ? 'translate-x-0' : '-translate-x-full')
        )}
      >
        <div className="h-16 flex items-center justify-between px-5">
          <Link href="/super-admin" className="flex items-center gap-2.5">
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
        <div className="mx-4 h-px bg-gradient-to-r from-rose-500/40 via-rose-500/10 to-transparent" />

        {renderNavItems(true)}
        {renderUserSection()}
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen lg:pt-0',
          isRTL ? 'lg:mr-[260px]' : 'lg:ml-[260px]'
        )}
      >
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
