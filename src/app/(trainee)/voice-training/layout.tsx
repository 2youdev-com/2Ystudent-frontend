import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'التدريب الصوتي - Voice Training',
  description: 'حسّن مهارات التواصل والعرض الصوتي مع تدريب مدعوم بالذكاء الاصطناعي في 2YSTUDY. Improve communication skills with AI voice training.',
};

export default function VoiceTrainingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
