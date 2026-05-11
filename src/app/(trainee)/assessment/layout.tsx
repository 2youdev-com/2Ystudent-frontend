import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'التقييم المهني - Assessment',
  description: 'أكمل تقييمك المهني لتحديد مستواك والحصول على خطة تدريب مخصصة في 2YSTUDY. Complete your professional assessment.',
};

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
