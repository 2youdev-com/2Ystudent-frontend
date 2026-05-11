import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الاختبارات - Quizzes',
  description: 'اختبر معرفتك ومهاراتك المهنية مع اختبارات تفاعلية وتقييمات ذكية في 2YSTUDY. Test your knowledge with interactive quizzes.',
};

export default function QuizzesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
