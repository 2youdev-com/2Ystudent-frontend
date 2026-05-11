import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إدارة المعلمين الأذكياء - Manage AI Teachers',
  description: 'إدارة وتخصيص المعلمين الأذكياء وتكوين شخصياتهم التدريبية في 2YSTUDY.',
};

export default function AdminAITeachersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
