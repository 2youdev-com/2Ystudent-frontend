import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إدارة الدورات - Manage Courses',
  description: 'إنشاء وإدارة الدورات التدريبية ومحتوى الفيديو لمؤسستك في 2YSTUDY.',
};

export default function AdminCoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
