import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'استعادة كلمة المرور - Forgot Password',
  description: 'استعد كلمة المرور الخاصة بحسابك في 2YSTUDY. Reset your 2YSTUDY account password.',
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
