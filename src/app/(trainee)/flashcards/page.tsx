'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { flashcardApi } from '@/lib/api/flashcard.api';
import { studentCoursesApi, type Course as StudentCourse } from '@/lib/api/trainee-courses.api';
import type { DeckListItemWithProgress, FlashcardProgress } from '@/types/flashcard';
import {
  Layers,
  BookOpen,
  Clock,
  Loader2,
  Sparkles,
  Wand2,
  Zap,
  GraduationCap,
  ChevronDown,
} from 'lucide-react';

export default function FlashcardsPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const [decks, setDecks] = useState<DeckListItemWithProgress[]>([]);
  const [progress, setProgress] = useState<FlashcardProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMode, setGenerateMode] = useState<'auto' | 'course' | null>(null);

  // Course selection for "Cards from Course" mode
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [showGenerateMenu, setShowGenerateMenu] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const generateMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [decksData, progressData, coursesRes] = await Promise.all([
          flashcardApi.getAvailableDecks(),
          flashcardApi.getProgress(),
          studentCoursesApi.listCourses().then(res => res.courses).catch(() => []),
        ]);
        setDecks(decksData.decks);
        setProgress(progressData);
        setCourses(coursesRes);
      } catch (err) {
        console.error('Failed to fetch flashcards:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Close generate menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (generateMenuRef.current && !generateMenuRef.current.contains(e.target as Node)) {
        setShowGenerateMenu(false);
        setShowCourseDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getMasteryPercent = (p: DeckListItemWithProgress['progress']) => {
    if (p.totalCards === 0) return 0;
    return Math.round((p.masteredCards / p.totalCards) * 100);
  };

  const handleGenerateDeck = async (mode: 'auto' | 'course', courseId?: string) => {
    setIsGenerating(true);
    setGenerateMode(mode);
    setShowGenerateMenu(false);
    setShowCourseDropdown(false);
    try {
      const newDeck = await flashcardApi.generateDeck({
        courseId,
        numberOfCards: 10,
      });

      // Refresh the deck list
      const decksData = await flashcardApi.getAvailableDecks();
      setDecks(decksData.decks);

      // Navigate to study the new deck
      router.push(`/flashcards/${newDeck.id}/study`);
    } catch (err) {
      console.error('Failed to generate deck:', err);
      alert('Failed to generate deck. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerateMode(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className={cn('p-6 space-y-6 max-w-5xl mx-auto', isRTL && 'text-right')}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-7 h-7 text-amber-500" />
            {t.flashcard.flashcards}
          </h1>
          <p className="text-gray-500 mt-1">{t.flashcard.description}</p>
        </div>

        {/* Generate Flashcards Dropdown */}
        <div className="relative" ref={generateMenuRef}>
          {isGenerating ? (
            <Button
              disabled
              className="bg-gradient-to-r from-[#0089B8] to-[#006d93] text-white gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              {generateMode === 'course'
                ? 'Generating course cards...'
                : 'Generating...'}
            </Button>
          ) : (
            <Button
              onClick={() => setShowGenerateMenu(!showGenerateMenu)}
              className="bg-gradient-to-r from-[#0089B8] to-[#006d93] hover:from-[#007AA6] hover:to-[#005a7a] text-white gap-2"
            >
              <Wand2 className="w-4 h-4" />
              {'AI Smart Cards'}
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}

          {showGenerateMenu && !isGenerating && (
            <div className={cn(
              "absolute top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden",
              isRTL ? "left-0" : "right-0"
            )}>
              {/* Quick Smart Cards */}
              <button
                onClick={() => handleGenerateDeck('auto')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#0089B8]/5 dark:hover:bg-[#0089B8]/20 transition-colors text-start"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0089B8] to-[#006d93] flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {'Quick Smart Cards'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {'Cards based on all your course progress'}
                  </p>
                </div>
              </button>

              <div className="border-t border-gray-100 dark:border-gray-700" />

              {/* Cards from Course */}
              <button
                onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-start"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {'Cards from Course'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {'Select a course to generate cards from'}
                  </p>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", showCourseDropdown && "rotate-180")} />
              </button>

              {/* Course List */}
              {showCourseDropdown && (
                <div className="border-t border-gray-100 dark:border-gray-700 max-h-48 overflow-y-auto">
                  {courses.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500 text-center">
                      {'No courses available'}
                    </p>
                  ) : (
                    courses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => handleGenerateDeck('course', course.id)}
                        className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-start"
                      >
                        <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {course.titleEn}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Stats */}
      {progress && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-amber-600">{progress.totalCards}</div>
              <div className="text-xs text-gray-500 mt-1">{t.flashcard.totalCards}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{progress.studiedCards}</div>
              <div className="text-xs text-gray-500 mt-1">{t.flashcard.studiedCards}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{progress.masteredCards}</div>
              <div className="text-xs text-gray-500 mt-1">{t.flashcard.masteredCards}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">{progress.dueToday}</div>
              <div className="text-xs text-gray-500 mt-1">{t.flashcard.dueToday}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deck Grid */}
      {decks.length === 0 ? (
        <div className="text-center py-16">
          <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">{t.flashcard.noDecks}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => {
            const mastery = getMasteryPercent(deck.progress);
            return (
              <Card key={deck.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {deck.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {deck.description}
                      </p>
                    </div>
                    {deck.generationType === 'ai_generated' && (
                      <Badge className="bg-[#0089B8]/10 text-[#0089B8] shrink-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {deck.cardCount} {t.flashcard.cards}
                    </span>
                    {deck.category && (
                      <Badge variant="outline" className="text-xs">
                        {deck.category}
                      </Badge>
                    )}
                  </div>

                  {/* Progress Ring */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="14" fill="none"
                            stroke={mastery >= 80 ? '#22c55e' : mastery >= 40 ? '#f59e0b' : '#94a3b8'}
                            strokeWidth="3"
                            strokeDasharray={`${mastery * 0.88} 88`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                          {mastery}%
                        </span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">{t.flashcard.mastered}</div>
                        <div className="text-sm font-medium">
                          {deck.progress.masteredCards}/{deck.progress.totalCards}
                        </div>
                      </div>
                    </div>

                    {deck.progress.dueCards > 0 && (
                      <Badge className="bg-orange-100 text-orange-700">
                        <Clock className="w-3 h-3" />
                        {deck.progress.dueCards} {t.flashcard.dueToday}
                      </Badge>
                    )}
                  </div>

                  {/* Study Button */}
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => router.push(`/flashcards/${deck.id}/study`)}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {t.flashcard.startStudy}
                    {deck.progress.dueCards > 0 && ` (${deck.progress.dueCards})`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
