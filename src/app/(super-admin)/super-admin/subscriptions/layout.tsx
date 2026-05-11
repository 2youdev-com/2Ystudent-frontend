import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إدارة الاشتراكات - Subscriptions',
  description: 'إدارة خطط الاشتراك والمدفوعات لجميع المؤسسات في 2YSTUDY.',
};

export default function SubscriptionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
