import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تواصل معنا - Contact Us',
  description: 'تواصل مع فريق 2YSTUDY للاستفسارات والدعم الفني. راسلنا على support@2ystudy.ai. Contact the 2YSTUDY team for inquiries and support.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
