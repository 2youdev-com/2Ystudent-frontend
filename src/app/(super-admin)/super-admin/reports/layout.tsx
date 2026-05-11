import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Reports - تقارير المنصة',
  description: 'Cross-organization platform reports: users, organizations, sessions, and scores.',
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
