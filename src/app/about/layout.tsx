import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'من نحن - About Us',
  description: 'تعرّف على فريق 2YSTUDY ورؤيتنا لمستقبل التدريب المهني في المملكة العربية السعودية. Learn about the 2YSTUDY team and our vision for professional training.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
