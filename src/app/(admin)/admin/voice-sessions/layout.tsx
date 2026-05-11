import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'جلسات التدريب الصوتي - Voice Sessions',
  description: 'عرض وإدارة جلسات التدريب الصوتي ومتابعة أداء المتدربين في 2YSTUDY.',
};

export default function VoiceSessionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
