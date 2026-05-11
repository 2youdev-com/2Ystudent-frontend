'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Globe, Moon, Sun, Monitor, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface LanguageToggleProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'minimal';
  showLabel?: boolean;
}

export function LanguageToggle({ className, variant = 'outline', showLabel = true }: LanguageToggleProps) {
  // TEMPORARY: Language toggle hidden — English only mode
  // To re-enable, remove the return null below
  return null;

  /* eslint-disable no-unreachable */
  const { language, toggleLanguage } = useLanguage();

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleLanguage}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium transition-colors",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          className
        )}
      >
        <Globe className="h-4 w-4" />
        <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
      </button>
    );
  }

  return (
    <Button
      variant={variant === 'minimal' ? 'ghost' : variant as 'default' | 'outline' | 'ghost'}
      size="sm"
      onClick={toggleLanguage}
      className={cn("gap-2", className)}
    >
      <Globe className="h-4 w-4" />
      {showLabel && (
        <span>
          {language === 'ar' ? 'English' : 'عربي'}
        </span>
      )}
    </Button>
  );
  /* eslint-enable no-unreachable */
}

/**
 * Language selector with both options visible
 */
export function LanguageSelector({ className }: { className?: string }) {
  // TEMPORARY: Language selector hidden — English only mode
  return null;

  /* eslint-disable no-unreachable */
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("inline-flex rounded-lg border border-border p-1 bg-muted/50", className)}>
      <button
        onClick={() => setLanguage('ar')}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          language === 'ar'
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        العربية
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          language === 'en'
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        English
      </button>
    </div>
  );
  /* eslint-enable no-unreachable */
}

/**
 * Theme toggle button
 */
interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'minimal';
  showLabel?: boolean;
}

export function ThemeToggle({ className, variant = 'outline', showLabel = false }: ThemeToggleProps) {
  const { isDark, toggleTheme, t } = useThemeWithTranslations();

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium transition-colors",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          className
        )}
        aria-label={isDark ? t.lightMode : t.darkMode}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        {showLabel && <span>{isDark ? t.lightMode : t.darkMode}</span>}
      </button>
    );
  }

  return (
    <Button
      variant={variant as 'default' | 'outline' | 'ghost'}
      size="icon"
      onClick={toggleTheme}
      className={cn("", className)}
      aria-label={isDark ? t.lightMode : t.darkMode}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

/**
 * Theme selector with all options visible
 */
export function ThemeSelector({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { t } = useThemeWithTranslations();

  return (
    <div className={cn("inline-flex rounded-lg border border-border p-1 bg-muted/50", className)}>
      <button
        onClick={() => setTheme('light')}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5",
          theme === 'light'
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label={t.lightMode}
      >
        <Sun className="h-4 w-4" />
        <span className="hidden sm:inline">{t.lightMode}</span>
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5",
          theme === 'dark'
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label={t.darkMode}
      >
        <Moon className="h-4 w-4" />
        <span className="hidden sm:inline">{t.darkMode}</span>
      </button>
      <button
        onClick={() => setTheme('system')}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5",
          theme === 'system'
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label={t.systemMode}
      >
        <Monitor className="h-4 w-4" />
        <span className="hidden sm:inline">{t.systemMode}</span>
      </button>
    </div>
  );
}

/**
 * Unified Settings Dropdown with language and theme controls
 */
interface SettingsDropdownProps {
  className?: string;
}

export function SettingsDropdown({ className }: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* TEMPORARY: Hide language indicator — English only mode */}
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute end-0 top-full mt-2 w-72 rounded-lg border border-border bg-card shadow-lg z-50 animate-fade-in">
          <div className="p-3">
            {/* TEMPORARY: Language section hidden — English only mode */}
            {/* To re-enable, uncomment the language section below */}
            {/*
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                {t.settings.language}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('ar')}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                    language === 'ar'
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/50 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  العربية
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                    language === 'en'
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/50 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  English
                </button>
              </div>
            </div>
            */}

            {/* Theme Section */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                {t.settings.theme}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    "px-2 py-2 rounded-lg text-sm font-medium transition-all border flex items-center justify-center gap-1",
                    theme === 'light'
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/50 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  aria-label={t.settings.lightMode}
                >
                  <Sun className="h-4 w-4 shrink-0" />
                  <span className="truncate text-xs">{t.settings.lightMode}</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "px-2 py-2 rounded-lg text-sm font-medium transition-all border flex items-center justify-center gap-1",
                    theme === 'dark'
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/50 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  aria-label={t.settings.darkMode}
                >
                  <Moon className="h-4 w-4 shrink-0" />
                  <span className="truncate text-xs">{t.settings.darkMode}</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={cn(
                    "px-2 py-2 rounded-lg text-sm font-medium transition-all border flex items-center justify-center gap-1",
                    theme === 'system'
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/50 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  aria-label={t.settings.systemMode}
                >
                  <Monitor className="h-4 w-4 shrink-0" />
                  <span className="truncate text-xs">{t.settings.systemMode}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact theme toggle — dual button (Sun | Moon)
 *
 * @param appearance - Background context:
 *   'dark'  → for dark backgrounds (sidebar, dark hero)
 *   'light' → for light backgrounds (navbar scrolled in light mode)
 *   'auto'  → uses semantic theme colors (adapts to dark/light mode)
 */
interface CompactSettingsProps {
  className?: string;
  appearance?: 'dark' | 'light' | 'auto';
}

export function CompactSettings({ className, appearance = 'auto' }: CompactSettingsProps) {
  const { isDark, setTheme } = useTheme();

  // Container styles based on background context
  const containerClass = {
    dark: 'bg-white/[0.08]',
    light: 'bg-gray-100 border border-gray-200/60',
    auto: 'bg-muted/50 border border-border',
  }[appearance];

  // Button styles: active (currently selected) vs inactive
  const activeClass = {
    dark: 'bg-white/15 text-white',
    light: 'bg-white text-[#0089B8] shadow-sm',
    auto: 'bg-background text-primary shadow-sm',
  }[appearance];

  const inactiveClass = {
    dark: 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.06]',
    light: 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50',
    auto: 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
  }[appearance];

  return (
    <div className={cn('inline-flex items-center rounded-lg p-1 gap-0.5', containerClass, className)}>
      <button
        onClick={() => setTheme('light')}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200',
          !isDark ? activeClass : inactiveClass
        )}
        aria-label="Light mode"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200',
          isDark ? activeClass : inactiveClass
        )}
        aria-label="Dark mode"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// Helper hook to get theme translations
function useThemeWithTranslations() {
  const { language } = useLanguage();
  const themeContext = useTheme();

  const t = {
    lightMode: language === 'ar' ? 'فاتح' : 'Light',
    darkMode: language === 'ar' ? 'داكن' : 'Dark',
    systemMode: language === 'ar' ? 'تلقائي' : 'System',
  };

  return { ...themeContext, t };
}
