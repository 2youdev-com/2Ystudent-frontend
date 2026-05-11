import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تسجيل الدخول - Login',
  description: 'سجّل دخولك إلى منصة 2YSTUDY للتدريب المهني بالذكاء الاصطناعي. Sign in to your 2YSTUDY training account.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
