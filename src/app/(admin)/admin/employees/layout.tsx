import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إدارة المتدربين - Employees',
  description: 'عرض وإدارة المتدربين في مؤسستك ومتابعة أدائهم التدريبي في 2YSTUDY.',
};

export default function EmployeesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
