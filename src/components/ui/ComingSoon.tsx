'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InEngineeringLogo as InLearnLogo } from '@/components/ui/InEngineeringLogo';

interface ComingSoonProps {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
}

export function ComingSoon({ titleAr, titleEn, descriptionAr, descriptionEn }: ComingSoonProps) {
  const { isRTL } = useLanguage();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      {/* Logo */}
      <div className="mb-8">
        <InLearnLogo size="lg" />
      </div>

      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Construction className="h-10 w-10 text-primary" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-foreground mb-3 font-heading">
        {isRTL ? titleAr : titleEn}
      </h1>

      {/* Description */}
      <p className="text-muted-foreground text-base max-w-md mb-2">
        {isRTL
          ? (descriptionAr || 'هذه الصفحة قيد التطوير وستكون متاحة قريباً.')
          : (descriptionEn || 'This page is under development and will be available soon.')}
      </p>

      <p className="text-muted-foreground/60 text-sm mb-8">
        {isRTL ? 'نعمل على تجهيزها لكم بأفضل شكل ممكن' : 'We are working hard to bring it to you'}
      </p>

      {/* Back button */}
      <div className="flex gap-3">
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <BackArrow className="h-4 w-4" />
            {isRTL ? 'الرئيسية' : 'Home'}
          </Button>
        </Link>
        <Link href="/login">
          <Button className="gap-2">
            {isRTL ? 'تسجيل الدخول' : 'Sign In'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
