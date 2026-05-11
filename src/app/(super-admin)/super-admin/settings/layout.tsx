import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إعدادات المنصة - Platform Settings',
  description: 'إدارة الإعدادات العامة وتكوين منصة 2YSTUDY.',
};

export default function PlatformSettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
