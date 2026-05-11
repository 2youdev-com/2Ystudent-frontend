import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تطبيق الدورة - Course Practice',
  description: 'طبّق ما تعلمته في الدورات التدريبية مع تمارين عملية تفاعلية في 2YSTUDY. Practice what you learned with hands-on exercises.',
};

export default function CoursePracticeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
