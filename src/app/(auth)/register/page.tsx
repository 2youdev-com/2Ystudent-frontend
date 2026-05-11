'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  ChevronRight,
  ChevronLeft,
  Check,
  Building,
  User,
  Lock,
  Sparkles,
} from 'lucide-react';

// Industry types for electromechanical engineering organizations
const INDUSTRY_TYPES = [
  { value: 'hvac_systems', labelEn: 'HVAC Systems' },
  { value: 'electrical_contracting', labelEn: 'Electrical Contracting' },
  { value: 'mechanical_engineering', labelEn: 'Mechanical Engineering' },
  { value: 'industrial_automation', labelEn: 'Industrial Automation' },
  { value: 'training_institute', labelEn: 'Learning Institute' },
  { value: 'corporate', labelEn: 'Corporate Engineering' },
  { value: 'other', labelEn: 'Other' },
];

// Team size options
const TEAM_SIZES = [
  { value: '1-10', labelEn: '1-10 employees' },
  { value: '11-50', labelEn: '11-50 employees' },
  { value: '51-200', labelEn: '51-200 employees' },
  { value: '200+', labelEn: '200+ employees' },
];

interface FormData {
  organizationName: string;
  industryType: string;
  teamSize: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const { t, isRTL } = useLanguage();
  const { register } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    organizationName: '',
    industryType: '',
    teamSize: '',
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const NextArrow = isRTL ? ChevronLeft : ChevronRight;
  const PrevArrow = isRTL ? ChevronRight : ChevronLeft;

  const steps = [
    { number: 1, title: 'Organization', icon: Building },
    { number: 2, title: 'Account', icon: User },
    { number: 3, title: 'Security', icon: Lock },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.organizationName.trim()) { setError('Please enter organization name'); return false; }
        if (!formData.industryType) { setError('Please select industry type'); return false; }
        return true;
      case 2:
        if (!formData.firstName.trim() || !formData.lastName.trim()) { setError('Please enter your full name'); return false; }
        if (!formData.email.trim() || !formData.email.includes('@')) { setError('Please enter a valid email'); return false; }
        return true;
      case 3:
        if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return false; }
        if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return false; }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setError('');
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsLoading(true);
    setError('');

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        organizationName: formData.organizationName,
        industryType: formData.industryType,
        teamSize: formData.teamSize,
        jobTitle: formData.jobTitle,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const pw = formData.password;
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s += 25;
    if (/[A-Z]/.test(pw)) s += 25;
    if (/[a-z]/.test(pw)) s += 25;
    if (/[0-9!@#$%^&*]/.test(pw)) s += 25;
    return s;
  };

  const passwordStrength = getPasswordStrength();
  const strengthColor =
    passwordStrength <= 25 ? 'bg-destructive' :
    passwordStrength <= 50 ? 'bg-orange-500' :
    passwordStrength <= 75 ? 'bg-amber-500' : 'bg-[#0089B8]';
  const strengthLabel =
    passwordStrength <= 25 ? 'Weak' :
    passwordStrength <= 50 ? 'Fair' :
    passwordStrength <= 75 ? 'Good' : 'Strong';

  return (
    <div className="min-h-screen flex overflow-hidden bg-background">
      {/* Left Panel — Photo + Brand */}
      <div className={cn(
        'hidden lg:flex lg:w-[48%] relative flex-col overflow-hidden',
        isRTL && 'order-2'
      )}>
        {/* Background Image */}
        <Image
          src="/images/register-bg.jpg"
          alt="Engineering team"
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
              AI-Powered Student Learning
            </p>
          </div>

          {/* Hero Content */}
          <div className="max-w-lg space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/15">
              <Sparkles className="h-4 w-4 text-[#0089B8]" />
              <span className="text-sm text-white font-medium">Start Your Free Trial</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Take Your Engineering Team to the Next Level
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Join 50+ engineering organizations using 2YStudy to train their teams and boost performance.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                'AI-Powered Learning',
                'Performance Analytics',
                'Team Management',
                'Enterprise Security',
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#0089B8]/20 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-[#0089B8]" />
                  </div>
                  <span className="text-sm text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-gray-500">
            14-day free trial &bull; No credit card required
          </p>
        </div>
      </div>

      {/* Right Panel — Registration Form */}
      <div className={cn(
        'flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-10 overflow-y-auto',
        isRTL && 'order-1'
      )}>
        <div className="w-full max-w-[480px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <img src="/images/logo-dark.png" alt="2YStudy" className="h-8 w-auto dark:hidden" />
            <img src="/images/logo-white.png" alt="2YStudy" className="h-8 w-auto hidden dark:block" />
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300',
                      currentStep === step.number
                        ? 'bg-[#0089B8] text-white shadow-sm'
                        : currentStep > step.number
                        ? 'bg-[#0089B8] text-white'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {currentStep > step.number ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <p className={cn(
                      'text-xs font-medium mt-1.5 transition-colors',
                      currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      'w-full h-0.5 mx-3 rounded-full transition-colors',
                      currentStep > step.number ? 'bg-[#0089B8]' : 'bg-muted'
                    )} style={{ minWidth: '40px', maxWidth: '80px' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-sm">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-1">
                {currentStep === 1 && 'Organization Details'}
                {currentStep === 2 && 'Admin Account'}
                {currentStep === 3 && 'Set Your Password'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentStep === 1 && 'Tell us about your organization'}
                {currentStep === 2 && "You'll be the organization admin"}
                {currentStep === 3 && 'Choose a strong password'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-3.5 text-sm text-destructive bg-destructive/8 rounded-lg border border-destructive/15 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-destructive rounded-full flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Organization */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="organizationName" className="text-sm font-medium text-foreground">
                      Organization Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="organizationName"
                      name="organizationName"
                      placeholder="e.g., Elite Engineering Co."
                      value={formData.organizationName}
                      onChange={handleChange}
                      className="h-11 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="industryType" className="text-sm font-medium text-foreground">
                      Industry Type <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="industryType"
                      name="industryType"
                      value={formData.industryType}
                      onChange={handleChange}
                      className="input-premium h-11 w-full appearance-none cursor-pointer rounded-lg"
                    >
                      <option value="">Select industry type</option>
                      {INDUSTRY_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="teamSize" className="text-sm font-medium text-foreground">
                      Team Size
                    </label>
                    <select
                      id="teamSize"
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleChange}
                      className="input-premium h-11 w-full appearance-none cursor-pointer rounded-lg"
                    >
                      <option value="">Select team size (optional)</option>
                      {TEAM_SIZES.map(size => (
                        <option key={size.value} value={size.value}>
                          {size.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Admin Account */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                        First Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="h-11 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                        Last Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="h-11 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Work Email <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="h-11 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="jobTitle" className="text-sm font-medium text-foreground">
                      Job Title
                    </label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      placeholder="e.g., Learning Manager"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      className="h-11 rounded-lg"
                    />
                  </div>

                  {/* Admin Badge */}
                  <div className="p-4 bg-[#0089B8]/8 border border-[#0089B8]/15 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#0089B8]/10 rounded-lg">
                        <Shield className="h-4 w-4 text-[#0089B8]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          You&apos;ll be assigned as Organization Admin
                        </p>
                        <p className="text-xs text-muted-foreground">
                          You can add supervisors and trainees later
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Password */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      Password <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        className={cn('h-11 rounded-lg', isRTL ? 'pl-11' : 'pr-11')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                          'absolute top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg',
                          isRTL ? 'left-1' : 'right-1'
                        )}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Strength Indicator */}
                    {formData.password && (
                      <div className="space-y-1.5">
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn('h-full transition-all duration-300 rounded-full', strengthColor)}
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Password strength: <span className={cn('font-medium',
                            passwordStrength <= 25 ? 'text-destructive' :
                            passwordStrength <= 50 ? 'text-orange-500' :
                            passwordStrength <= 75 ? 'text-amber-500' : 'text-[#0089B8]'
                          )}>{strengthLabel}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                      Confirm Password <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={cn('h-11 rounded-lg', isRTL ? 'pl-11' : 'pr-11')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={cn(
                          'absolute top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg',
                          isRTL ? 'left-1' : 'right-1'
                        )}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Match indicator */}
                    {formData.confirmPassword && formData.password && (
                      <div className="flex items-center gap-2">
                        {formData.password === formData.confirmPassword ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-[#0089B8]" />
                            <span className="text-xs text-[#0089B8]">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-destructive" />
                            <span className="text-xs text-destructive">Passwords do not match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center gap-4 mt-8">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    className="flex-1 h-11 rounded-lg"
                  >
                    <PrevArrow className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                    Previous
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 h-11 rounded-lg bg-[#0089B8] hover:bg-[#007AA6] text-white"
                  >
                    Next
                    <NextArrow className={cn('h-4 w-4', isRTL ? 'mr-2' : 'ml-2')} />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1 h-11 rounded-lg bg-[#0089B8] hover:bg-[#007AA6] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
                        Creating...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                )}
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-[#0089B8] font-semibold hover:text-[#007AA6] transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-[#0089B8] hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[#0089B8] hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
