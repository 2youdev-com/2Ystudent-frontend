import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إدارة المجموعات - Groups',
  description: 'إنشاء وإدارة مجموعات المتدربين وتنظيم الفرق التدريبية في 2YSTUDY.',
};

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
