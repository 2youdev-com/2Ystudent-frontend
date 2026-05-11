import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إنشاء حساب - Register',
  description: 'أنشئ حسابك في 2YSTUDY وابدأ رحلة التدريب المهني بالذكاء الاصطناعي. Create your 2YSTUDY account and start your training journey.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
