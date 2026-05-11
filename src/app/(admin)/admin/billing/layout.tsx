import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الفوترة والاشتراك - Billing',
  description: 'إدارة الاشتراك والمدفوعات وعرض تفاصيل الفوترة لمؤسستك في 2YSTUDY.',
};

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
