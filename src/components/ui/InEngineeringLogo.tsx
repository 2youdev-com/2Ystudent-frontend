import Image from 'next/image';
import { cn } from '@/lib/utils';

interface InEngineeringLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'dark' | 'light';
}

const sizeMap = {
  sm: { height: 28, width: 112 },
  md: { height: 34, width: 136 },
  lg: { height: 40, width: 160 },
  xl: { height: 48, width: 192 },
};

export function InEngineeringLogo({ size = 'md', className, variant = 'dark' }: InEngineeringLogoProps) {
  const dimensions = sizeMap[size];
  return (
    <Image
      src={variant === 'light' ? '/images/logo-white.png' : '/images/logo-dark.png'}
      alt="2YStudy"
      width={dimensions.width}
      height={dimensions.height}
      className={cn('object-contain', className)}
      priority
    />
  );
}

export function InEngineeringLogoGlass({ size = 'lg', className }: InEngineeringLogoProps) {
  const dimensions = sizeMap[size];
  return (
    <Image
      src="/images/logo-white.png"
      alt="2YStudy"
      width={dimensions.width}
      height={dimensions.height}
      className={cn('object-contain', className)}
      priority
    />
  );
}
