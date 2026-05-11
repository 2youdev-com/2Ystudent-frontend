'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useViewModeStore } from '@/stores/viewMode.store';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Users, Shield, ArrowLeftRight } from 'lucide-react';

interface ViewModeSwitcherProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function ViewModeSwitcher({ variant = 'default', className }: ViewModeSwitcherProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { viewMode, toggleViewMode } = useViewModeStore();
  const { isRTL } = useLanguage();

  // Only show for admins and supervisors
  const canSwitch = user?.role === 'admin' || user?.role === 'supervisor';

  if (!canSwitch) return null;

  const handleToggle = () => {
    toggleViewMode();
    if (viewMode === 'admin') {
      // Switching to student view
      router.push('/dashboard');
    } else {
      // Switching back to admin view
      router.push('/admin');
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className={cn(
          'gap-2 h-9 px-3 rounded-lg transition-all duration-200',
          viewMode === 'student'
            ? 'bg-[#0089B8]/10 border-[#0089B8]/30 text-[#0089B8] hover:bg-[#0089B8]/20'
            : 'bg-[#0089B8]/10 border-[#0089B8]/30 text-[#0089B8] hover:bg-[#0089B8]/20',
          className
        )}
      >
        <ArrowLeftRight className="h-4 w-4" />
        {viewMode === 'admin' ? (
          <span className="hidden sm:inline">
            {'Student View'}
          </span>
        ) : (
          <span className="hidden sm:inline">
            {'Admin Panel'}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleToggle}
      className={cn(
        'gap-2 h-11 px-4 rounded-xl transition-all duration-200 border-2',
        viewMode === 'student'
          ? 'bg-[#0089B8]/10 border-[#0089B8]/30 text-[#0089B8] hover:bg-[#0089B8]/20 hover:border-[#0089B8]/50'
          : 'bg-[#0089B8]/10 border-[#0089B8]/30 text-[#0089B8] hover:bg-[#0089B8]/20 hover:border-[#0089B8]/50',
        className
      )}
    >
      {viewMode === 'admin' ? (
        <>
          <Users className="h-4 w-4" />
          <span>{'Switch to Student View'}</span>
        </>
      ) : (
        <>
          <Shield className="h-4 w-4" />
          <span>{'Back to Admin Panel'}</span>
        </>
      )}
    </Button>
  );
}

// Floating button version for navigation between admin and student views
export function FloatingAdminReturn() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { viewMode, setViewMode } = useViewModeStore();
  const { isRTL } = useLanguage();

  // Check if user is admin or supervisor
  const isAdminOrSupervisor = user?.role === 'admin' || user?.role === 'supervisor';

  // Check if currently on admin pages
  const isOnAdminPage = pathname?.startsWith('/admin');

  // Show button when:
  // 1. User is admin/supervisor AND in student view mode (show "Back to Admin")
  // 2. User is admin/supervisor AND on admin page (show "Go to Student")
  const showButton = isAdminOrSupervisor && (viewMode === 'student' || isOnAdminPage);

  if (!showButton) return null;

  const handleNavigation = () => {
    if (isOnAdminPage) {
      // Currently on admin page - go to student view
      setViewMode('student');
      router.push('/dashboard');
    } else {
      // Currently on student page - go back to admin
      setViewMode('admin');
      router.push('/admin');
    }
  };

  // Determine button style and text based on current location
  const isGoingToStudent = isOnAdminPage;

  return (
    <div className={cn(
      'fixed bottom-6 z-50',
      isRTL ? 'left-6' : 'right-6'
    )}>
      <Button
        onClick={handleNavigation}
        className={cn(
          'gap-2 h-12 px-5 rounded-full shadow-lg',
          'text-white font-medium',
          'animate-bounce-subtle',
          isGoingToStudent
            ? 'bg-[#0089B8] hover:bg-[#007AA6]'
            : 'bg-[#0089B8] hover:bg-[#007AA6]'
        )}
      >
        {isGoingToStudent ? (
          <>
            <Users className="h-5 w-5" />
            <span>{'Go to Student Page'}</span>
          </>
        ) : (
          <>
            <Shield className="h-5 w-5" />
            <span>{'Back to Admin Panel'}</span>
          </>
        )}
      </Button>
    </div>
  );
}
