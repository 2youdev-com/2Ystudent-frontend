import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المعلم الذكي - AI Teacher',
  description: 'تعلّم مع معلم ذكي يقدم إرشاداً مخصصاً ومحادثات تفاعلية بالذكاء الاصطناعي في 2YSTUDY. Learn with a personalized AI mentor.',
};

export default function AITeacherLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
