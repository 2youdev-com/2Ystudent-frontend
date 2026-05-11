import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة ملفات تعريف الارتباط - Cookie Policy',
  description: 'تعرّف على كيفية استخدام 2YSTUDY لملفات تعريف الارتباط وإدارة تفضيلاتك. Learn how 2YSTUDY uses cookies.',
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
