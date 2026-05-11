import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الشروط والأحكام - Terms of Service',
  description: 'اقرأ شروط وأحكام استخدام منصة 2YSTUDY للتدريب المهني بالذكاء الاصطناعي. Read the terms and conditions for using 2YSTUDY platform.',
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
