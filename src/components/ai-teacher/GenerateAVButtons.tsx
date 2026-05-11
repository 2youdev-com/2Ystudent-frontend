'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Headphones, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GenerateAVButtonsProps {
  onGenerateLecture: () => Promise<void>;
  onGenerateSummary: () => Promise<void>;
  disabled?: boolean;
  language?: 'ar' | 'en';
  className?: string;
}

export function GenerateAVButtons({
  onGenerateLecture,
  onGenerateSummary,
  disabled = false,
  language = 'en',
  className,
}: GenerateAVButtonsProps) {
  const [isGeneratingLecture, setIsGeneratingLecture] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const handleGenerateLecture = async () => {
    if (isGeneratingLecture || isGeneratingSummary || disabled) return;
    setIsGeneratingLecture(true);
    try {
      await onGenerateLecture();
    } finally {
      setIsGeneratingLecture(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (isGeneratingLecture || isGeneratingSummary || disabled) return;
    setIsGeneratingSummary(true);
    try {
      await onGenerateSummary();
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const isGenerating = isGeneratingLecture || isGeneratingSummary;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Section Header */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
        <Sparkles className="h-4 w-4 text-[#0089B8]" />
        <span>AI Visual Content</span>
      </div>

      {/* Generate Lecture Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleGenerateLecture}
          disabled={isGenerating || disabled}
          className={cn(
            'w-full h-12 relative overflow-hidden',
            'bg-gradient-to-r from-[#0089B8] via-[#007AA6] to-[#0089B8]',
            'hover:from-[#0089B8] hover:via-[#0089B8] hover:to-[#0089B8]',
            'text-white font-medium',
            'shadow-lg shadow-[#0089B8]/25',
            'border border-[#0089B8]/20',
            'transition-all duration-300',
            isGeneratingLecture && 'animate-pulse'
          )}
        >
          {/* Animated Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Content */}
          <span className="relative flex items-center justify-center gap-2">
            {isGeneratingLecture ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Video className="h-5 w-5" />
                <span>Generate Video Lecture</span>
              </>
            )}
          </span>
        </Button>
      </motion.div>

      {/* Generate Summary Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleGenerateSummary}
          disabled={isGenerating || disabled}
          className={cn(
            'w-full h-11',
            'border-[#0089B8]/30 bg-[#0089B8]/5',
            'hover:bg-[#0089B8]/10 hover:border-[#0089B8]/50',
            'text-[#0089B8] hover:text-[#0089B8]/80',
            'transition-all duration-200',
            isGeneratingSummary && 'animate-pulse'
          )}
        >
          {isGeneratingSummary ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Headphones className="h-4 w-4 mr-2" />
              <span>Interactive Audio Summary</span>
            </>
          )}
        </Button>
      </motion.div>

      {/* Helper Text */}
      <p className="text-xs text-slate-500 text-center">
        Content adapts to your weak areas automatically
      </p>
    </div>
  );
}
