import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'التقارير الإدارية - Admin Reports',
  description: 'عرض تقارير الأداء الشاملة وتحليلات المتدربين لمؤسستك في 2YSTUDY.',
};

export default function AdminReportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
