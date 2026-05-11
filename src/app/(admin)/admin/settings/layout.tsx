import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الإعدادات - Settings',
  description: 'إدارة إعدادات المؤسسة وتخصيص تجربة التدريب في 2YSTUDY.',
};

export default function AdminSettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
