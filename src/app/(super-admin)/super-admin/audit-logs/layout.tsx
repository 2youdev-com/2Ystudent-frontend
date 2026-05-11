import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سجل المراجعة - Audit Logs',
  description: 'عرض سجل الأنشطة والتغييرات والعمليات في منصة 2YSTUDY.',
};

export default function AuditLogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
