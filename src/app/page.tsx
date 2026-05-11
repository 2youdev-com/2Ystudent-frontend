'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { EnhancedNavbar } from '@/components/landing/EnhancedNavbar';
import {
  MessageSquare,
  BarChart,
  Award,
  CheckCircle,
  Star,
  ArrowRight,
  ArrowLeft,
  Zap,
  BookOpen,
  Phone,
  Shield,
  Users,
  TrendingUp,
  Cpu,
} from 'lucide-react';

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    const elements = ref.current?.querySelectorAll('[data-scroll-reveal]');
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function HomePage() {
  const { t, isRTL } = useLanguage();
  const scrollRef = useScrollReveal();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Simulations',
      description: 'Practise real learning scenarios with AI-powered mentors using the Socratic method.',
    },
    {
      icon: Phone,
      title: 'Voice Learning',
      description: 'Real-time voice conversations with AI mentors for hands-on technical communication.',
    },
    {
      icon: BarChart,
      title: 'Performance Analytics',
      description: 'Detailed skill assessments, progress tracking, and personalised recommendations.',
    },
    {
      icon: BookOpen,
      title: 'Structured Courses',
      description: 'Comprehensive professional skills curriculum with interactive content.',
    },
    {
      icon: Award,
      title: 'Certifications',
      description: 'Industry-recognised certifications upon completing learning programmes.',
    },
    {
      icon: Shield,
      title: 'Safety & Compliance',
      description: 'Learning aligned with BS, IEC, and IEEE standards for workplace safety.',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Students Enrolled' },
    { value: '95%', label: 'Success Rate' },
    { value: '50,000+', label: 'Sessions Completed' },
    { value: '4.9', label: 'User Rating' },
  ];

  const steps = [
    {
      number: '01',
      title: 'Set Up Your Organisation',
      description: 'Register your team and configure learning programmes tailored to your needs.',
    },
    {
      number: '02',
      title: 'Learn with AI Mentors',
      description: 'Engage in realistic simulations and voice sessions guided by AI-powered AI mentors.',
    },
    {
      number: '03',
      title: 'Track & Certify',
      description: 'Monitor progress with detailed analytics and earn certifications upon completion.',
    },
  ];

  const testimonials = [
    {
      name: 'James Harrison',
      role: 'Senior Electrical Engineer',
      company: 'Siemens Energy',
      quote: '2YStudy transformed how our junior students learn. The AI simulations feel remarkably realistic.',
      initials: 'JH',
    },
    {
      name: 'Sarah Mitchell',
      role: 'Learning Director',
      company: 'ABB Industrial',
      quote: 'The voice learning feature is exceptional. Our team\'s technical communication improved significantly.',
      initials: 'SM',
    },
    {
      name: 'David Chen',
      role: 'Lead Maintenance Engineer',
      company: 'Shell Education',
      quote: 'Finally, a learning platform that understands professional skills. The content is spot-on.',
      initials: 'DC',
    },
  ];

  return (
    <div ref={scrollRef} className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <EnhancedNavbar />

      <main className="flex-grow">
        {/* ═══════════════════════════════════════
            Hero Section
           ═══════════════════════════════════════ */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-bg.jpg"
              alt="Learning workspace"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-[#162B46]/80" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center" data-scroll-reveal>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-[#0089B8]" />
              <span className="text-sm text-gray-200">AI-Powered Student Learning</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Learn Smarter.{' '}
              <span className="text-[#0089B8]">Grow Faster.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              The AI-powered learning platform for students.
              Master technical skills through realistic simulations and voice-guided mentoring.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#0089B8] hover:bg-[#007AA6] text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
              >
                Get Started Free
                <ArrowIcon className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
              >
                Sign In
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#0089B8]" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#0089B8]" />
                <span>14-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#0089B8]" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            Stats Section
           ═══════════════════════════════════════ */}
        <section className="py-16 bg-white dark:bg-card border-b border-gray-100 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8" data-scroll-reveal>
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-[#162B46] dark:text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">{stat.label}</div>
                  <div className="w-8 h-0.5 bg-[#0089B8] mx-auto mt-3" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            Features Section
           ═══════════════════════════════════════ */}
        <section id="features" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16" data-scroll-reveal>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#162B46] dark:text-white mb-4">
                Powerful Features for Modern Engineers
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                Everything you need to learn, assess, and certify your student team.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-scroll-reveal>
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className="bg-white dark:bg-card dark:border dark:border-white/10 rounded-lg shadow-soft p-8 hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-lg bg-[#0089B8]/10 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-[#0089B8]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#162B46] dark:text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            How It Works Section
           ═══════════════════════════════════════ */}
        <section id="how-it-works" className="py-20 bg-[#162B46]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16" data-scroll-reveal>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Get your team up and running in three simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12" data-scroll-reveal>
              {steps.map((step, i) => (
                <div key={i} className="text-center md:text-left">
                  <div className="text-5xl font-bold text-[#0089B8]/20 mb-4">{step.number}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            Testimonials Section
           ═══════════════════════════════════════ */}
        <section id="testimonials" className="py-20 bg-white dark:bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16" data-scroll-reveal>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#162B46] dark:text-white mb-4">
                Trusted by Engineers Worldwide
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                See what students say about 2YStudy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-scroll-reveal>
              {testimonials.map((testimonial, i) => (
                <div key={i} className="bg-background rounded-lg p-8">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-[#0089B8] text-[#0089B8]" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic mb-6 leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#162B46] dark:bg-white/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">{testimonial.initials}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-[#162B46] dark:text-white text-sm">{testimonial.name}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            CTA Section
           ═══════════════════════════════════════ */}
        <section className="py-20 bg-[#162B46]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center" data-scroll-reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Student Learning?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of engineers who are already using 2YStudy to accelerate their professional development.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#0089B8] hover:bg-[#007AA6] text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
            >
              Start Free Trial
              <ArrowIcon className="w-5 h-5" />
            </Link>
            <p className="text-gray-500 text-sm mt-4">No credit card required. 14-day free trial.</p>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════
          Footer
         ═══════════════════════════════════════ */}
      <footer className="bg-[#162B46] border-t border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="mb-3">
                <img src="/images/logo-white.png" alt="2YStudy" className="h-8 w-auto" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                AI-powered learning platform for students.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Simulations', 'Courses', 'Analytics'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-[#0089B8] transition-colors text-sm">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Company</h4>
              <ul className="space-y-2">
                {['About', 'Careers', 'Contact', 'Blog'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-[#0089B8] transition-colors text-sm">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2">
                {['Privacy', 'Terms', 'Security', 'Compliance'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-[#0089B8] transition-colors text-sm">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} 2YStudy. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {/* Social Icons */}
              {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                <a key={social} href="#" className="text-gray-500 hover:text-[#0089B8] transition-colors text-sm">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
