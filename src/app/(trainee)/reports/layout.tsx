import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'التقارير - Reports',
  description: 'اطلع على تقارير أدائك التفصيلية وتحليلات تقدمك التدريبي في 2YSTUDY. View your detailed performance reports and analytics.',
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
