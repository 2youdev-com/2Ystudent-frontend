'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t, isRTL } = useLanguage();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = useCallback((field: 'email' | 'password', value: string): string | undefined => {
    if (field === 'email') {
      if (!value.trim()) return 'Email is required';
      if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email';
    }
    if (field === 'password') {
      if (!value) return 'Password is required';
      if (value.length < 4) return 'Password is too short';
    }
    return undefined;
  }, []);

  // Real-time validation on change (only if field was touched)
  useEffect(() => {
    if (touched.email) {
      const err = validateField('email', email);
      setFieldErrors((prev) => ({ ...prev, email: err }));
    }
  }, [email, touched.email, validateField]);

  useEffect(() => {
    if (touched.password) {
      const err = validateField('password', password);
      setFieldErrors((prev) => ({ ...prev, password: err }));
    }
  }, [password, touched.password, validateField]);

  const validateForm = (): boolean => {
    const emailErr = validateField('email', email);
    const passwordErr = validateField('password', password);
    setFieldErrors({ email: emailErr, password: passwordErr });
    setTouched({ email: true, password: true });

    if (emailErr || passwordErr) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the highlighted fields',
        variant: 'destructive',
        duration: 4000,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.auth.loginFailed;
      setError(msg);
      toast({
        title: isRTL ? 'فشل تسجيل الدخول' : 'Login Failed',
        description: msg,
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
    setFieldErrors({});
    setTouched({});
    setIsLoading(true);

    try {
      await login({ email: userEmail, password: userPassword });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-background">
      {/* Left Panel — Photo + Brand */}
      <div
        className={cn(
          'hidden lg:flex lg:w-[50%] xl:w-[52%] relative flex-col overflow-hidden',
          isRTL && 'order-2'
        )}
      >
        {/* Background Image */}
        <Image
          src="/images/login-bg.jpg"
          alt="Learning workspace"
          fill
          className="object-cover"
          priority
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-[#162B46]/75" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
          {/* Logo */}
          <div>
            <Link href="/" className="flex items-center">
              <img src="/images/logo-white.png" alt="2YStudy" className="h-9 w-auto" />
            </Link>
            <p className="text-sm text-gray-400 mt-1">
              AI-Powered Learning Platform
            </p>
          </div>

          {/* Hero Text */}
          <div className="max-w-lg space-y-6">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Learn Smarter.
              <br />
              Grow Faster.
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              AI-powered learning platform that transforms students into high-performers.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-4">
              {[
                { value: '2,500+', label: 'Active Users' },
                { value: '95%', label: 'Success Rate' },
                { value: '50+', label: 'Organizations' },
              ].map((stat, i) => (
                <div key={i}>
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <span className="text-xs text-gray-400 block mt-0.5 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="max-w-md">
            <p className="text-sm text-gray-400 italic leading-relaxed">
              &ldquo;2YStudy completely transformed how our students learn. Performance improved 40% in just 3 months.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-8 h-8 rounded-full bg-[#0089B8]/30 flex items-center justify-center">
                <span className="text-xs font-bold text-[#0089B8]">SA</span>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-300 block">Sarah Anderson</span>
                <span className="text-[10px] text-gray-500 block">Head of Learning, TechCorp</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div
        className={cn(
          'flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16',
          isRTL && 'order-1'
        )}
      >
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-10">
            <img src="/images/logo-dark.png" alt="2YStudy" className="h-8 w-auto dark:hidden" />
            <img src="/images/logo-white.png" alt="2YStudy" className="h-8 w-auto hidden dark:block" />
          </div>

          {/* Welcome Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="p-3.5 text-sm text-destructive bg-destructive/8 rounded-lg border border-destructive/15 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-destructive rounded-full flex-shrink-0" />
                <span className="text-[13px]">{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                required
                className={cn(
                  "h-11 rounded-lg bg-background border-border px-4 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-[#0089B8]/20 focus-visible:border-[#0089B8]/40",
                  fieldErrors.email && 'border-[#EF4444] focus-visible:ring-[#EF4444]/20 focus-visible:border-[#EF4444]'
                )}
              />
              {fieldErrors.email && (
                <p className="flex items-center gap-1.5 text-[12px] text-[#EF4444] mt-1">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#0089B8] hover:text-[#0089B8]/80 transition-colors font-medium"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                  required
                  className={cn(
                    'h-11 rounded-lg bg-background border-border px-4 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-[#0089B8]/20 focus-visible:border-[#0089B8]/40',
                    isRTL ? 'pl-11' : 'pr-11',
                    fieldErrors.password && 'border-[#EF4444] focus-visible:ring-[#EF4444]/20 focus-visible:border-[#EF4444]'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 p-2 text-muted-foreground/50 hover:text-foreground/70 transition-colors rounded-lg',
                    isRTL ? 'left-1' : 'right-1'
                  )}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password error message */}
              {fieldErrors.password && (
                <p className="flex items-center gap-1.5 text-[12px] text-[#EF4444] mt-1 animate-fade-in-up">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 rounded-lg text-sm font-semibold bg-[#0089B8] hover:bg-[#007AA6] text-white transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowIcon className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-background text-xs text-muted-foreground/60 uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link href="/register" className="block">
            <button className="w-full h-11 rounded-lg border border-border bg-background hover:bg-muted/30 hover:border-border transition-all text-sm font-medium text-foreground/80 hover:text-foreground group flex items-center justify-center gap-2">
              Create an account
              <ChevronIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </Link>

          {/* Terms */}
          <p className="mt-6 text-center text-[11px] text-muted-foreground/50 leading-relaxed">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-muted-foreground/70 hover:text-foreground/70 underline underline-offset-2 transition-colors">
              Terms
            </Link>
            {' '}&{' '}
            <Link href="/privacy" className="text-muted-foreground/70 hover:text-foreground/70 underline underline-offset-2 transition-colors">
              Privacy
            </Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-5">
            <div className="p-4 rounded-lg bg-muted/20 border border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 bg-[#0089B8] rounded-full" />
                <span className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider">
                  Quick Login — Demo Accounts
                </span>
              </div>
              <div className="space-y-1.5">
                {[
                  { role: 'Super Admin', name: 'Super Admin', email: 'superadmin@2ystudy.com', password: 'SuperAdmin@123!', color: 'text-rose-500 bg-rose-500/8 border-rose-500/15 hover:bg-rose-500/15' },
                  { role: 'Admin', name: 'James Miller', email: 'admin@macsoft.com', password: 'Test1234', color: 'text-[#0089B8] bg-[#0089B8]/8 border-[#0089B8]/15 hover:bg-[#0089B8]/15' },
                  { role: 'Supervisor', name: 'Daniel Roberts', email: 'abdullah@macsoft.com', password: 'Test1234', color: 'text-[#0089B8] bg-[#0089B8]/8 border-[#0089B8]/15 hover:bg-[#0089B8]/15' },
                  { role: 'Learner', name: 'Ryan Cooper', email: 'fahad@macsoft.com', password: 'Test1234', color: 'text-sky-500 bg-sky-500/8 border-sky-500/15 hover:bg-sky-500/15' },
                ].map((cred, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickLogin(cred.email, cred.password)}
                    disabled={isLoading}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 p-2.5 rounded-lg border transition-colors text-left',
                      cred.color
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-background/50">
                        {cred.role}
                      </span>
                      <span className="text-[11px] font-medium truncate">
                        {cred.name}
                      </span>
                      <code className="text-muted-foreground/50 font-mono text-[10px] truncate hidden sm:block">
                        {cred.email}
                      </code>
                    </div>
                    <ChevronIcon className="h-3.5 w-3.5 opacity-40 flex-shrink-0" />
                  </button>
                ))}
              </div>
              <p className="pt-2 mt-2 border-t border-border/30 text-[10px] text-muted-foreground/50 text-center">
                Click any role to sign in instantly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
