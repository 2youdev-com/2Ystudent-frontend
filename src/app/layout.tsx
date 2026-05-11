import type { Metadata } from 'next';
import { Inter, Cairo, Alexandria } from 'next/font/google';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LessonContextProvider } from '@/contexts/LessonContext';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/globals.css';

// Inter - Premium tech font for English (clean, modern)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// Cairo - Premium Arabic font for body text (highly readable)
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// Alexandria - Premium Arabic font for headings (modern, elegant)
const alexandria = Alexandria({
  subsets: ['arabic', 'latin'],
  variable: '--font-alexandria',
  display: 'swap',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://estateiq-app.vercel.app'),
  title: '2YStudy | AI-Powered Learning Platform',
  description: 'AI-powered learning platform for students. Master skills through realistic simulations, expert-led courses, and AI-powered mentoring.',
  keywords: ['student learning', 'AI courses', 'certification', 'AI simulation', 'professional development', 'education', '2YStudy'],
  authors: [{ name: '2YStudy' }],
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: '2YStudy | AI-Powered Learning Platform',
    description: 'AI-powered learning platform with realistic simulations and expert-led courses.',
    type: 'website',
    locale: 'en_US',
    siteName: '2YStudy',
  },
  twitter: {
    card: 'summary_large_image',
    title: '2YStudy | AI-Powered Learning Platform',
    description: 'AI-powered learning platform with realistic simulations and expert-led courses.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#162B46" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: '2YStudy',
              url: 'https://estateiq-app.vercel.app',
              description: 'AI-Powered Learning Platform',
              publisher: {
                '@type': 'Organization',
                name: '2YStudy',
                url: 'https://estateiq-app.vercel.app',
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${cairo.variable} ${alexandria.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <LanguageProvider>
            <LessonContextProvider>
              <main id="main-content">{children}</main>
              <Toaster />
            </LessonContextProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
