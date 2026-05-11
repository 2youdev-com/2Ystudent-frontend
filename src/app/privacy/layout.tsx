import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية - Privacy Policy',
  description: 'تعرّف على كيفية حماية 2YSTUDY لبياناتك الشخصية وسياسة الخصوصية الخاصة بنا. Learn how 2YSTUDY protects your personal data.',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
