import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إدارة المؤسسات - Organizations',
  description: 'عرض وإدارة جميع المؤسسات المسجلة في منصة 2YSTUDY.',
};

export default function OrganizationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
