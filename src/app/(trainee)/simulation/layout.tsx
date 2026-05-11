import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المحاكاة التفاعلية - Simulation',
  description: 'تدرّب على سيناريوهات واقعية مع محاكاة تفاعلية مدعومة بالذكاء الاصطناعي في 2YSTUDY. Practice with AI-powered realistic simulations.',
};

export default function SimulationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
