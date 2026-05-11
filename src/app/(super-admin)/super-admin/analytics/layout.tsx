import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تحليلات المنصة - Platform Analytics',
  description: 'عرض تحليلات وإحصائيات شاملة لأداء منصة 2YSTUDY.',
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
