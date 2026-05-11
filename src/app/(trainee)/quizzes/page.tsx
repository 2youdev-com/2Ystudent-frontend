'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { quizApi } from '@/lib/api/quiz.api';
import { studentCoursesApi, type Course as StudentCourse } from '@/lib/api/trainee-courses.api';
import type { QuizListItem, StudentAttemptHistoryItem } from '@/types/quiz';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useAuthStore } from '@/stores/auth.store';
import {
  ClipboardCheck,
  Search,
  Clock,
  Target,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Trophy,
  BarChart3,
  Sparkles,
  BookOpen,
  History,
  Loader2,
  Wand2,
  Trash2,
  GraduationCap,
  ChevronDown,
  Zap,
} from 'lucide-react';

export default function QuizzesPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [history, setHistory] = useState<StudentAttemptHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMode, setGenerateMode] = useState<'auto' | 'course' | null>(null);
  const [deleteQuizId, setDeleteQuizId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Course selection for "Quiz from Course" mode
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showGenerateMenu, setShowGenerateMenu] = useState(false);
  const generateMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizzesRes, historyRes, coursesRes] = await Promise.all([
          quizApi.getAvailableQuizzes(),
          quizApi.getStudentHistory(),
          studentCoursesApi.listCourses().then(res => res.courses).catch(() => []),
        ]);
        setQuizzes(quizzesRes.quizzes);
        setHistory(historyRes.history);
        setCourses(coursesRes);
      } catch (err) {
        console.error('Failed to fetch quiz data:', err);
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

  const difficulties = useMemo(() => [
    { id: 'all', label: 'All Levels' },
    { id: 'easy', label: t.quiz.easy },
    { id: 'medium', label: t.quiz.medium },
    { id: 'hard', label: t.quiz.hard },
  ], [isRTL, t]);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(quiz => {
      const title = quiz.title.toLowerCase();
      const desc = quiz.description.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = title.includes(query) || desc.includes(query);
      const matchesDifficulty = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [quizzes, searchQuery, selectedDifficulty, isRTL]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return t.quiz.easy;
      case 'medium': return t.quiz.medium;
      case 'hard': return t.quiz.hard;
      default: return difficulty;
    }
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const handleGenerateQuiz = async (mode: 'auto' | 'course', courseId?: string) => {
    setIsGenerating(true);
    setGenerateMode(mode);
    setShowGenerateMenu(false);
    setShowCourseDropdown(false);
    try {
      const newQuiz = await quizApi.generateQuiz({
        mode,
        courseId,
        numberOfQuestions: 5,
        questionTypes: ['multiple_choice', 'true_false'],
      });

      // Refresh the quiz list
      const quizzesRes = await quizApi.getAvailableQuizzes();
      setQuizzes(quizzesRes.quizzes);

      // Navigate to the new quiz
      router.push(`/quizzes/${newQuiz.id}`);
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerateMode(null);
    }
  };

  const canDeleteQuiz = (quiz: QuizListItem) =>
    quiz.quizType === 'ai_generated' && quiz.createdById === user?.id;

  const handleDeleteQuiz = async () => {
    if (!deleteQuizId) return;
    setIsDeleting(true);
    try {
      await quizApi.deleteQuiz(deleteQuizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== deleteQuizId));
    } catch (err) {
      console.error('Failed to delete quiz:', err);
    } finally {
      setIsDeleting(false);
      setDeleteQuizId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-blue-500" />
            {t.quiz.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.quiz.quizzesDesc}</p>
        </div>

        {/* Generate Quiz Dropdown */}
        <div className="relative" ref={generateMenuRef}>
          {isGenerating ? (
            <Button
              disabled
              className="bg-gradient-to-r from-[#0089B8] to-[#006d93] text-white gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              {generateMode === 'course'
                ? 'Generating course quiz...'
                : 'Generating...'}
            </Button>
          ) : (
            <Button
              onClick={() => setShowGenerateMenu(!showGenerateMenu)}
              className="bg-gradient-to-r from-[#0089B8] to-[#006d93] hover:from-[#007AA6] hover:to-[#005a7a] text-white gap-2"
            >
              <Wand2 className="w-4 h-4" />
              {'AI Smart Quiz'}
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}

          {showGenerateMenu && !isGenerating && (
            <div className={cn(
              "absolute top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden",
              isRTL ? "left-0" : "right-0"
            )}>
              {/* Quick Smart Quiz */}
              <button
                onClick={() => handleGenerateQuiz('auto')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#0089B8]/5 dark:hover:bg-[#0089B8]/20 transition-colors text-start"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0089B8] to-[#006d93] flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {'Quick Smart Quiz'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {'Questions based on all your course progress'}
                  </p>
                </div>
              </button>

              <div className="border-t border-gray-100 dark:border-gray-700" />

              {/* Quiz from Course */}
              <button
                onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-start"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {'Quiz from Course'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {'Select a course to generate quiz from'}
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
                        onClick={() => handleGenerateQuiz('course', course.id)}
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('available')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'available'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <BookOpen className="w-4 h-4" />
          {t.quiz.availableQuizzes}
          <Badge variant="secondary" className="ml-1">{quizzes.length}</Badge>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'history'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <History className="w-4 h-4" />
          {t.quiz.myAttempts}
          <Badge variant="secondary" className="ml-1">{history.length}</Badge>
        </button>
      </div>

      {activeTab === 'available' && (
        <>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400", isRTL ? "right-3" : "left-3")} />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("h-10", isRTL ? "pr-9" : "pl-9")}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {difficulties.map((d) => (
                <Button
                  key={d.id}
                  variant={selectedDifficulty === d.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty(d.id)}
                  className={selectedDifficulty === d.id ? 'bg-blue-500 hover:bg-blue-600' : ''}
                >
                  {d.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Quiz Grid */}
          {filteredQuizzes.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">{t.quiz.noQuizzesAvailable}</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden"
                  onClick={() => router.push(`/quizzes/${quiz.id}`)}
                >
                  {/* Gradient top stripe */}
                  <div className="h-2 bg-gradient-to-r from-blue-400 to-cyan-500" />
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {quiz.title}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        {canDeleteQuiz(quiz) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteQuizId(quiz.id);
                            }}
                            className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-0 max-sm:opacity-100"
                            title={t.quiz.confirmDelete}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <Badge className={cn('text-xs', getDifficultyColor(quiz.difficulty))}>
                          {getDifficultyLabel(quiz.difficulty)}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {quiz.description}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        {quiz.questionCount} {t.quiz.questions}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {quiz.timeLimit ? `${quiz.timeLimit} min` : t.quiz.noTimeLimit}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" />
                        {quiz.passingScore}%
                      </span>
                    </div>

                    {quiz.quizType === 'ai_generated' && (
                      <Badge variant="outline" className="text-xs text-[#0089B8] border-[#0089B8]/30 bg-[#0089B8]/5">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {t.quiz.aiGenerated}
                      </Badge>
                    )}

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <Button
                        size="sm"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {t.quiz.takeQuiz}
                        <ChevronIcon className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <>
          {history.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">{t.quiz.noAttemptsYet}</h3>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((attempt) => (
                <Card
                  key={attempt.attemptId}
                  className="hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    if (attempt.status === 'completed') {
                      router.push(`/quizzes/results/${attempt.attemptId}`);
                    }
                  }}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        attempt.passed ? 'bg-green-100 text-green-600' :
                        attempt.status === 'completed' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-500'
                      )}>
                        {attempt.passed ? <Trophy className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {attempt.quizTitle}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(attempt.startedAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                          {attempt.timeSpentSeconds && ` • ${formatTime(attempt.timeSpentSeconds)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {attempt.status === 'completed' && attempt.score !== null && (
                        <div className={cn(
                          'text-lg font-bold',
                          attempt.passed ? 'text-green-600' : 'text-red-600'
                        )}>
                          {Math.round(attempt.score)}%
                        </div>
                      )}
                      <Badge variant={attempt.passed ? 'default' : 'secondary'} className={cn(
                        attempt.passed ? 'bg-green-100 text-green-700' :
                        attempt.status === 'completed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      )}>
                        {attempt.status === 'completed'
                          ? (attempt.passed ? t.quiz.passed : t.quiz.failed)
                          : attempt.status === 'in_progress'
                            ? 'In Progress'
                            : 'Abandoned'
                        }
                      </Badge>
                      {attempt.status === 'completed' && (
                        <ChevronIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteQuizId !== null}
        onOpenChange={(open) => { if (!open) setDeleteQuizId(null); }}
        onConfirm={handleDeleteQuiz}
        title={t.quiz.confirmDelete}
        description={t.quiz.confirmDeleteDesc}
        variant="danger"
        icon="delete"
        isLoading={isDeleting}
        confirmText="Delete"
      />
    </div>
  );
}
