'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { studentCoursesApi, Course } from '@/lib/api/trainee-courses.api';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { studentApi } from '@/lib/api/trainee.api';
import { diagnosticApi } from '@/lib/api/diagnostic.api';
import type { SkillReport } from '@/types/diagnostic';
import {
  BookOpen,
  Clock,
  Play,
  GraduationCap,
  Search,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Phone,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Target,
  Loader2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

// Skill-to-category mapping for weakness prioritization
const SKILL_TO_CATEGORIES: Record<string, string[]> = {
  communication: ['fundamentals', 'Fundamentals', 'safety', 'Safety & Compliance'],
  technicalKnowledge: ['hvac', 'HVAC Systems', 'electrical', 'Electrical Systems'],
  problemSolving: ['plc_automation', 'PLC & Automation', 'maintenance', 'Industrial Maintenance'],
  systemsThinking: ['hvac', 'HVAC Systems', 'plc_automation', 'PLC & Automation'],
  practicalSkills: ['maintenance', 'Industrial Maintenance', 'electrical', 'Electrical Systems'],
  safetyAwareness: ['safety', 'Safety & Compliance', 'fundamentals', 'Fundamentals'],
};

// Group content types
interface GroupInfo {
  id: string;
  name: string;
  description: string | null;
  specialization: string | null;
}

interface GroupContentResponse {
  group: GroupInfo | null;
  courses: Course[];
}

export default function CoursesPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const { token } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [diagnosticReport, setDiagnosticReport] = useState<SkillReport | null>(null);
  const [recommendedCategories, setRecommendedCategories] = useState<Set<string>>(new Set());

  // Group content state
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null | undefined>(undefined); // undefined = loading, null = no group
  const [groupCourses, setGroupCourses] = useState<Course[]>([]);
  const [groupLoadFailed, setGroupLoadFailed] = useState(false);

  // Dynamic courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await studentCoursesApi.listCourses();
        setCourses(response.courses);
      } catch (err: any) {
        console.error('Failed to fetch courses:', err);
        setError(err.message || 'Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch group content (courses assigned to student's group)
  useEffect(() => {
    const fetchGroupContent = async () => {
      try {
        const authToken = token || (() => {
          try {
            const s = localStorage.getItem('auth-storage');
            return s ? JSON.parse(s)?.state?.token : null;
          } catch { return null; }
        })();
        if (!authToken) { setGroupInfo(null); return; }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/groups/my-content`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          setGroupInfo(data.group || null);
          if (data.courses && data.courses.length > 0) {
            setGroupCourses(data.courses);
          }
        } else {
          setGroupLoadFailed(true);
          setGroupInfo(null);
        }
      } catch {
        setGroupLoadFailed(true);
        setGroupInfo(null);
      }
    };
    fetchGroupContent();
  }, [token]);

  // Fetch completed lessons and diagnostic report
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, diagnosticStatus] = await Promise.all([
          studentApi.getProfile().catch(() => null),
          diagnosticApi.getStatus().catch(() => null),
        ]);
        if (profile?.progress?.completedLectureIds) {
          setCompletedLessonIds(new Set(profile.progress.completedLectureIds));
        }
        if (diagnosticStatus?.currentReport) {
          setDiagnosticReport(diagnosticStatus.currentReport);
          // Build recommended categories from weaknesses
          const weakCategories = new Set<string>();
          const scores = diagnosticStatus.currentReport.skillScores;
          for (const [skill, score] of Object.entries(scores)) {
            if (score < 60) {
              const cats = SKILL_TO_CATEGORIES[skill];
              if (cats) cats.forEach(c => weakCategories.add(c));
            }
          }
          setRecommendedCategories(weakCategories);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };

    fetchData();
  }, []);

  // Calculate progress for each course
  const getCourseProgress = (course: Course): number => {
    if (!course.lessons || course.lessons.length === 0) return 0;
    const completedCount = course.lessons.filter(lesson => completedLessonIds.has(lesson.id)).length;
    return Math.round((completedCount / course.lessons.length) * 100);
  };

  // Check if course is completed
  const isCourseCompleted = (course: Course): boolean => {
    if (!course.lessons || course.lessons.length === 0) return false;
    return course.lessons.every(lesson => completedLessonIds.has(lesson.id));
  };

  // Localized categories
  const categories = useMemo(() => [
    { id: 'All', label: 'All Categories' },
    { id: 'fundamentals', label: 'Engineering Fundamentals' },
    { id: 'hvac', label: 'HVAC Systems' },
    { id: 'electrical', label: 'Electrical Systems' },
    { id: 'plc_automation', label: 'PLC & Automation' },
    { id: 'maintenance', label: 'Industrial Maintenance' },
    { id: 'safety', label: 'Safety & Compliance' },
  ], [isRTL]);

  // Localized difficulties
  const difficulties = useMemo(() => [
    { id: 'All', label: 'All Levels' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
  ], [isRTL]);

  const filteredCourses = useMemo(() => {
    const filtered = courses.filter(course => {
      const title = studentCoursesApi.getCourseTitle(course, isRTL).toLowerCase();
      const description = studentCoursesApi.getCourseDescription(course, isRTL).toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch = title.includes(query) || description.includes(query);
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // Sort recommended courses to top if we have diagnostic data
    if (recommendedCategories.size > 0) {
      filtered.sort((a, b) => {
        const aRec = recommendedCategories.has(a.category) ? 1 : 0;
        const bRec = recommendedCategories.has(b.category) ? 1 : 0;
        return bRec - aRec;
      });
    }

    return filtered;
  }, [courses, searchQuery, selectedCategory, selectedDifficulty, isRTL, recommendedCategories]);

  const getSimulationLabel = (type: 'text' | 'voice') => {
    if (type === 'text') {
      return 'Text Simulation';
    }
    return 'Voice Call';
  };

  // Get appropriate course image - prefer thumbnailUrl, fallback to category-based images
  const getCourseImage = (course: Course) => {
    if (course.thumbnailUrl) {
      return course.thumbnailUrl;
    }

    // Fallback images by category
    const categoryImages: Record<string, string> = {
      'fundamentals': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=450&fit=crop&q=80',
      'hvac': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&h=450&fit=crop&q=80',
      'electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=450&fit=crop&q=80',
      'plc_automation': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=450&fit=crop&q=80',
      'maintenance': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=450&fit=crop&q=80',
      'safety': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=450&fit=crop&q=80',
    };

    return categoryImages[course.category] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop&q=80';
  };

  const handleStartSimulation = (course: Course, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (course.recommendedSimulation) {
      const { type, scenarioType, difficultyLevel } = course.recommendedSimulation;
      if (type === 'text') {
        router.push(`/simulation?scenario=${scenarioType}&difficulty=${difficultyLevel}`);
      } else {
        router.push('/voice-training');
      }
    }
  };

  // RTL-aware icons
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Loading state (also wait for group content check)
  if (isLoading || (!groupLoadFailed && groupInfo === undefined)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Error Loading Courses
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Group content view - student is assigned to a group with courses
  if (groupInfo && groupCourses.length > 0 && !groupLoadFailed) {
    // Use the group courses as the main course list, applying same card design as regular courses
    const groupFilteredCourses = groupCourses.filter(course => {
      // Filter out draft/unpublished courses
      if (course.isPublished === false) return false;
      const title = studentCoursesApi.getCourseTitle(course, isRTL).toLowerCase();
      const description = studentCoursesApi.getCourseDescription(course, isRTL).toLowerCase();
      const query = searchQuery.toLowerCase();
      return title.includes(query) || description.includes(query);
    });

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-b from-card to-background border-b border-border">
          <div className="container mx-auto py-8 px-4 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                {groupInfo.specialization && (
                  <div className="flex items-center gap-2 text-primary">
                    <GraduationCap className="h-5 w-5" />
                    <span className="text-sm font-semibold uppercase tracking-wider">{groupInfo.specialization}</span>
                  </div>
                )}
                <h1 className="text-3xl font-bold text-foreground leading-relaxed">
                  Learning Courses
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  Develop your skills with expert-led courses
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-card/50 px-4 py-2 rounded-xl border border-border">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="font-medium">{groupCourses.length} courses available</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-8 px-4 lg:px-8">
          {/* Search */}
          <div className="bg-card rounded-2xl border border-border p-5 mb-8 shadow-sm">
            <div className="relative flex-1">
              <Search className={cn(
                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                isRTL ? "right-4" : "left-4"
              )} />
              <Input
                placeholder="Search for a course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "h-12 rounded-xl border-border focus:border-primary transition-colors",
                  isRTL ? "pr-12 text-right" : "pl-12"
                )}
              />
            </div>
          </div>

          {/* Course Grid - same design as regular courses */}
          {groupFilteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No courses found</h3>
              <p className="text-muted-foreground">Try adjusting your search</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groupFilteredCourses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`} prefetch={true}>
                  <Card className="h-full overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-card">
                    {/* Course Image/Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-muted/80 to-muted overflow-hidden">
                      <img
                        src={getCourseImage(course)}
                        alt={studentCoursesApi.getCourseTitle(course, isRTL)}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/90 shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                          <Play className={cn("h-6 w-6 text-primary", isRTL ? "mr-0.5" : "ml-0.5")} />
                        </div>
                      </div>
                      <div className={cn("absolute top-3", isRTL ? "right-3" : "left-3")}>
                        <Badge className={cn("border font-medium backdrop-blur-sm", studentCoursesApi.getDifficultyColor(course.difficulty))}>
                          {studentCoursesApi.getDifficultyLabel(course.difficulty, isRTL)}
                        </Badge>
                      </div>
                      <div className={cn("absolute top-3", isRTL ? "left-3" : "right-3")}>
                        {isCourseCompleted(course) ? (
                          <Badge className="bg-green-500 text-white font-medium backdrop-blur-sm border-0">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-white/90 text-foreground font-medium backdrop-blur-sm">
                            {course.lessons?.length || 0} lessons
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2.5 h-2.5 rounded-full", studentCoursesApi.getCategoryColor(course.category))} />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {studentCoursesApi.getCategoryLabel(course.category, isRTL)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-relaxed">
                          {studentCoursesApi.getCourseTitle(course, isRTL)}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {studentCoursesApi.getCourseDescription(course, isRTL)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{studentCoursesApi.formatDuration(course.estimatedDurationMinutes, isRTL)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span>{course.lessons?.length || 0} lessons</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className={cn(
                            "font-semibold",
                            isCourseCompleted(course) ? "text-green-500" : "text-foreground"
                          )}>
                            {getCourseProgress(course)}%
                            {isCourseCompleted(course) && (
                              <CheckCircle className="inline h-3 w-3 ml-1" />
                            )}
                          </span>
                        </div>
                        <Progress
                          value={getCourseProgress(course)}
                          className={cn("h-2", isCourseCompleted(course) && "[&>div]:bg-green-500")}
                        />
                      </div>

                      <Button className={cn(
                        "w-full h-11 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all",
                        isCourseCompleted(course)
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white"
                      )}>
                        {isCourseCompleted(course)
                          ? 'Completed ✓'
                          : getCourseProgress(course) > 0
                            ? 'Continue'
                            : 'Start Learning'
                        }
                        {!isCourseCompleted(course) && (
                          <ArrowIcon className={cn(
                            "h-4 w-4 transition-transform",
                            isRTL ? "mr-2 group-hover:-translate-x-1" : "ml-2 group-hover:translate-x-1"
                          )} />
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // No group assigned - show empty state
  if (groupInfo === null && !groupLoadFailed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            No Group Assigned Yet
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            You haven&apos;t been assigned to a learning group yet. Once your administrator adds you to a group, your course materials will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Fallback: regular courses view (when group content API fails)
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-card to-background border-b border-border">
        <div className="container mx-auto py-8 px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground leading-relaxed">
                Learning Courses
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Develop your skills with expert-led courses
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground bg-card/50 px-4 py-2 rounded-xl border border-border">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-medium">{courses.length} courses available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 lg:px-8">
        {/* Filters */}
        <div className="bg-card rounded-2xl border border-border p-5 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className={cn(
                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                isRTL ? "right-4" : "left-4"
              )} />
              <Input
                placeholder="Search for a course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "h-12 rounded-xl border-border focus:border-primary transition-colors",
                  isRTL ? "pr-12 text-right" : "pl-12"
                )}
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "rounded-lg transition-all",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-primary/10 hover:border-primary/30"
                  )}
                >
                  {category.label}
                </Button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div className="flex gap-2">
              {difficulties.map(diff => (
                <Button
                  key={diff.id}
                  variant={selectedDifficulty === diff.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={cn(
                    "rounded-lg transition-all",
                    selectedDifficulty === diff.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-primary/10 hover:border-primary/30"
                  )}
                >
                  {diff.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Diagnostic Recommendation Banner */}
        {recommendedCategories.size > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 flex items-center gap-3">
            <Target className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-primary">{t.diagnostic.basedOnAssessment}</p>
              <p className="text-xs text-muted-foreground">
                {`Focus on: ${Array.from(recommendedCategories).map(c => {
                    const cat = categories.find(cat => cat.id === c);
                    return cat?.label || c;
                  }).join(', ')}`
                }
              </p>
            </div>
          </div>
        )}

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No courses found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search filters
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} prefetch={true}>
                <Card className="h-full overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-card flex flex-col">
                  {/* Course Image/Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-muted/80 to-muted overflow-hidden">
                    {/* Background image */}
                    <img
                      src={getCourseImage(course)}
                      alt={studentCoursesApi.getCourseTitle(course, isRTL)}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                        <Play className={cn("h-6 w-6 text-primary", isRTL ? "mr-0.5" : "ml-0.5")} />
                      </div>
                    </div>
                    <div className={cn("absolute top-3", isRTL ? "right-3" : "left-3")}>
                      <Badge className={cn("border font-medium backdrop-blur-sm", studentCoursesApi.getDifficultyColor(course.difficulty))}>
                        {studentCoursesApi.getDifficultyLabel(course.difficulty, isRTL)}
                      </Badge>
                    </div>
                    <div className={cn("absolute top-3", isRTL ? "left-3" : "right-3")}>
                      {isCourseCompleted(course) ? (
                        <Badge className="bg-green-500 text-white font-medium backdrop-blur-sm border-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-white/90 text-foreground font-medium backdrop-blur-sm">
                          {course.lessons?.length || 0} lessons
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-5 flex flex-col flex-1">
                    {/* Category */}
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2.5 h-2.5 rounded-full", studentCoursesApi.getCategoryColor(course.category))} />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {studentCoursesApi.getCategoryLabel(course.category, isRTL)}
                      </span>
                      {recommendedCategories.has(course.category) && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0">
                          <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                          {t.diagnostic.recommendedForYou}
                        </Badge>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2 flex-1 mt-4">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-relaxed">
                        {studentCoursesApi.getCourseTitle(course, isRTL)}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {studentCoursesApi.getCourseDescription(course, isRTL)}
                      </p>
                    </div>

                    {/* Course Info */}
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-border mt-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{studentCoursesApi.formatDuration(course.estimatedDurationMinutes, isRTL)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span>{course.lessons?.length || 0} lessons</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className={cn(
                          "font-semibold",
                          isCourseCompleted(course) ? "text-green-500" : "text-foreground"
                        )}>
                          {getCourseProgress(course)}%
                          {isCourseCompleted(course) && (
                            <CheckCircle className="inline h-3 w-3 ml-1" />
                          )}
                        </span>
                      </div>
                      <Progress
                        value={getCourseProgress(course)}
                        className={cn("h-2", isCourseCompleted(course) && "[&>div]:bg-green-500")}
                      />
                    </div>

                    {/* Recommended Simulation Badge */}
                    {course.recommendedSimulation && (
                      <div
                        className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 cursor-pointer hover:from-primary/10 hover:to-primary/15 transition-colors mt-4"
                        onClick={(e) => handleStartSimulation(course, e)}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            {course.recommendedSimulation.type === 'text' ? (
                              <MessageSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Phone className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-primary truncate">
                              Recommended Learning
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {getSimulationLabel(course.recommendedSimulation.type)}
                            </p>
                          </div>
                        </div>
                        <Sparkles className="h-4 w-4 text-primary/60" />
                      </div>
                    )}

                    {/* CTA */}
                    <Button className={cn(
                      "mt-4",
                      "w-full h-11 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all",
                      isCourseCompleted(course)
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white"
                    )}>
                      {isCourseCompleted(course)
                        ? 'Completed ✓'
                        : getCourseProgress(course) > 0
                          ? 'Continue'
                          : 'Start Learning'
                      }
                      {!isCourseCompleted(course) && (
                        <ArrowIcon className={cn(
                          "h-4 w-4 transition-transform",
                          isRTL ? "mr-2 group-hover:-translate-x-1" : "ml-2 group-hover:translate-x-1"
                        )} />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
