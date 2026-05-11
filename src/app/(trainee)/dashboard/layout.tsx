import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'لوحة التحكم - Dashboard',
  description: 'تابع تقدمك التدريبي وأداءك ونتائج اختباراتك في منصة 2YSTUDY. Track your training progress and performance.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
