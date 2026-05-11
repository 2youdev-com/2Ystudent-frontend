import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إدارة المستخدمين - Users',
  description: 'عرض وإدارة جميع المستخدمين والأدوار في منصة 2YSTUDY.',
};

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
