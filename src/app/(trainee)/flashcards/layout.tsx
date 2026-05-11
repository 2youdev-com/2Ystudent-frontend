import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'البطاقات التعليمية - Flashcards',
  description: 'راجع المفاهيم الأساسية وعزّز حفظك مع بطاقات تعليمية ذكية في 2YSTUDY. Review key concepts with smart flashcards.',
};

export default function FlashcardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
