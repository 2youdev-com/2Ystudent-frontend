/**
 * Professor Avatar Component
 *
 * Displays a professor/mentor avatar for voice learning sessions
 */

import { cn } from '@/lib/utils';

interface SaudiAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
}

export function SaudiAvatar({ className, size = 'lg', isActive = false }: SaudiAvatarProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'text-xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Pulsing glow effect when active */}
      {isActive && (
        <>
          <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping" />
          <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
        </>
      )}

      <div className={cn(
        "relative z-10 w-full h-full drop-shadow-lg flex items-center justify-center rounded-full bg-gradient-to-br from-[#0089B8] to-[#006d93]",
        isActive && "animate-subtle-bounce"
      )}>
        <svg className={cn("text-white", iconSizes[size])} width="60%" height="60%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="4" fill="white" opacity="0.9"/>
          <path d="M4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6" stroke="white" strokeWidth="1.5" fill="white" opacity="0.9"/>
          <path d="M8 3.5L12 1l4 2.5" stroke="white" strokeWidth="1.2" fill="none" opacity="0.7"/>
          <rect x="6" y="6.5" width="12" height="1" rx="0.5" fill="white" opacity="0.5"/>
        </svg>
      </div>
    </div>
  );
}
