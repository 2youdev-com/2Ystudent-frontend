'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { CompactSettings } from '@/components/ui/LanguageToggle';
import { cn } from '@/lib/utils';
import { Menu, X, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';

export function EnhancedNavbar() {
  const { t, isRTL } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setScrolled(scrollY > 30);

    if (scrollY < 100) {
      setActiveSection('hero');
      return;
    }

    const sections = ['features', 'how-it-works', 'testimonials'];
    for (const id of [...sections].reverse()) {
      const element = document.getElementById(id);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 200) {
          setActiveSection(id);
          return;
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    if (targetId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const navItems = [
    { href: '#hero', label: 'Home', id: 'hero' },
    { href: '#features', label: t.landing.nav.features, id: 'features' },
    { href: '#how-it-works', label: t.landing.nav.howItWorks, id: 'how-it-works' },
    { href: '#testimonials', label: t.landing.nav.testimonials, id: 'testimonials' },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile menu */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300',
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 dark:bg-[#162B46]/95 backdrop-blur-sm shadow-sm border-b border-gray-100 dark:border-white/10'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center z-10"
              onClick={(e) => scrollToSection(e, '#hero')}
            >
              <div className="relative">
                <img
                  src={scrolled ? '/images/logo-dark.png' : '/images/logo-white.png'}
                  alt="2YStudy"
                  className="h-8 w-auto transition-all duration-300 dark:hidden"
                />
                <img
                  src="/images/logo-white.png"
                  alt="2YStudy"
                  className="h-8 w-auto transition-all duration-300 hidden dark:block"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                    activeSection === item.id
                      ? scrolled ? 'text-[#0089B8]' : 'text-white'
                      : scrolled
                        ? 'text-gray-600 dark:text-gray-300 hover:text-[#162B46] dark:hover:text-white'
                        : 'text-gray-300 hover:text-white'
                  )}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:block">
                <CompactSettings appearance={scrolled ? 'auto' : 'dark'} />
              </div>

              <Link
                href="/login"
                className={cn(
                  'hidden lg:inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  scrolled
                    ? 'text-gray-600 dark:text-gray-300 hover:text-[#162B46] dark:hover:text-white'
                    : 'text-gray-300 hover:text-white'
                )}
              >
                {t.landing.nav.signIn}
              </Link>

              <Link
                href="/register"
                className={cn(
                  'hidden lg:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-200',
                  scrolled
                    ? 'bg-[#0089B8] text-white hover:bg-[#007AA6]'
                    : 'border-2 border-white/30 text-white hover:border-white/60'
                )}
              >
                {t.landing.nav.getStarted}
                <ArrowIcon className="h-4 w-4" />
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  'lg:hidden p-2 rounded-lg transition-colors',
                  scrolled ? 'text-[#162B46] dark:text-white' : 'text-white'
                )}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          'lg:hidden fixed top-0 bottom-0 w-[85vw] max-w-sm z-50',
          'bg-white dark:bg-[#162B46] shadow-2xl transition-transform duration-300 ease-out',
          isRTL ? 'left-0 border-r border-gray-100 dark:border-white/10' : 'right-0 border-l border-gray-100 dark:border-white/10',
          mobileMenuOpen
            ? 'translate-x-0'
            : isRTL ? '-translate-x-full' : 'translate-x-full'
        )}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
            <img src="/images/logo-dark.png" alt="2YStudy" className="h-7 w-auto dark:hidden" />
            <img src="/images/logo-white.png" alt="2YStudy" className="h-7 w-auto hidden dark:block" />
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="flex flex-col h-[calc(100%-5rem)] overflow-y-auto">
            <nav className="flex flex-col p-4 gap-1">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5',
                    activeSection === item.id && 'text-[#0089B8] dark:text-[#0089B8] bg-[#0089B8]/5'
                  )}
                >
                  <span>{item.label}</span>
                  <ChevronRight className={cn('h-4 w-4 opacity-30', isRTL && 'rotate-180')} />
                </a>
              ))}
            </nav>

            <div className="mx-4 border-t border-gray-100 dark:border-white/10" />

            <div className="flex flex-col gap-3 p-4 mt-auto">
              <div className="flex justify-center mb-2">
                <CompactSettings appearance="auto" />
              </div>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full h-11 text-sm font-medium rounded-lg border border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  {t.landing.nav.signIn}
                </button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full h-11 text-sm font-semibold rounded-lg bg-[#0089B8] text-white hover:bg-[#007AA6] transition-colors">
                  {t.landing.nav.getStarted}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
