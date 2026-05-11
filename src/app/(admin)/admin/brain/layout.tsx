import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'قاعدة المعرفة - Knowledge Base',
  description: 'إدارة قاعدة المعرفة وتغذية الذكاء الاصطناعي بالمحتوى التدريبي في 2YSTUDY.',
};

export default function BrainLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
