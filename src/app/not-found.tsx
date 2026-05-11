'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const { language, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const text = {
    title: language === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found',
    description:
      language === 'ar'
        ? 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
        : "Sorry, the page you're looking for doesn't exist or has been moved.",
    home: language === 'ar' ? 'العودة للرئيسية' : 'Back to Home',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <span className="text-8xl font-bold bg-gradient-to-r from-primary via-emerald-400 to-teal-500 bg-clip-text text-transparent">
            404
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">{text.title}</h1>
        <p className="text-muted-foreground mb-8">{text.description}</p>
        <Button asChild className="btn-gradient">
          <Link href="/" className="inline-flex items-center gap-2">
            <Home className="h-4 w-4" />
            {text.home}
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
