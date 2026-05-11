import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إدارة الاختبارات - Manage Quizzes',
  description: 'إنشاء وإدارة الاختبارات التقييمية ومتابعة نتائج المتدربين في 2YSTUDY.',
};

export default function AdminQuizzesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
