/** @type {import('next').NextConfig} */

// Content Security Policy directives
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;
  img-src 'self' data: blob: https://img.youtube.com https://images.unsplash.com;
  media-src 'self' data: blob:;
  worker-src 'self' blob: https://cdn.jsdelivr.net;
  connect-src 'self' http://localhost:3001 ws://localhost:3001 https://2ystudy-backend-wzyl23fufa-uc.a.run.app wss://2ystudy-backend-wzyl23fufa-uc.a.run.app https://2ystudy-backend-1034531078253.us-central1.run.app wss://2ystudy-backend-1034531078253.us-central1.run.app https://*.elevenlabs.io wss://*.elevenlabs.io https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com;
  frame-src 'self' https://www.youtube.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none';
`;

// Security headers applied to all routes
const securityHeaders = [
  // HSTS — Force HTTPS for 1 year + subdomains + preload list
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  // CSP — Restrict resource loading to trusted origins
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  // Prevent MIME-type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Prevent clickjacking — deny all iframe embedding
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // XSS filter — legacy browsers fallback
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // Control referrer information sent with requests
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Restrict browser features/APIs
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(self "https://api.elevenlabs.io"), geolocation=(), interest-cohort=()',
  },
];

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Landing page — aggressive edge caching for fast TTFB
        source: '/',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Static assets — long-term cache (fonts, images, JS/CSS)
        source: '/:path(.+\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
