import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إدارة البطاقات التعليمية - Manage Flashcards',
  description: 'إنشاء وإدارة مجموعات البطاقات التعليمية للمتدربين في 2YSTUDY.',
};

export default function AdminFlashcardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
