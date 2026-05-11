import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الدورات التدريبية - Courses',
  description: 'تصفح الدورات التدريبية المتاحة وطوّر مهاراتك المهنية مع دورات فيديو متقدمة في 2YSTUDY. Browse and enroll in professional training courses.',
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
