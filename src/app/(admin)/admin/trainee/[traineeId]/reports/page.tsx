'use client';

/**
 * Admin View of Student Reports
 *
 * This page allows admins to view the full reports page for any student,
 * showing the same data and visualizations as the student sees.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { ScoreChart } from '@/components/charts/ScoreChart';
import { SkillRadarChart } from '@/components/charts/SkillRadarChart';
import { VoiceReportsSection } from '@/components/reports/VoiceReportsSection';
import { TextReportsSection } from '@/components/reports/TextReportsSection';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Target,
  Calendar,
  Award,
  ChevronRight,
  ChevronLeft,
  Filter,
  BarChart3,
  Lightbulb,
  BookOpen,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  User,
} from 'lucide-react';

interface StudentInfo {
  traineeId: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface DashboardData {
  totalSessions: number;
  completedSessions: number;
  averageScore: number | null;
  improvement: number;
  scoreHistory: { date: string; score: number; sessionId: string }[];
  recentSessions: {
    id: string;
    scenarioType: string;
    difficultyLevel: string;
    completedAt: string;
    score: number | null;
    grade: string | null;
  }[];
}

interface SkillData {
  skills: {
    skill: string;
    skillKey: string;
    averageScore: number | null;
    sessionCount: number;
    benchmark: number;
    tips: string[];
    isStrength: boolean;
    isWeakness: boolean;
  }[];
  strengths: string[];
  weaknesses: string[];
}

interface SessionData {
  sessions: {
    id: string;
    scenarioType: string;
    difficultyLevel: string;
    status: string;
    completedAt: string;
    durationSeconds: number | null;
    score: number | null;
    grade: string | null;
  }[];
  total: number;
  page: number;
  totalPages: number;
}

interface TrendData {
  month: string;
  year: number;
  averageScore: number | null;
  sessionCount: number;
}

interface RecommendationData {
  recommendations: {
    priority: string;
    title: string;
    description: string;
    category: string;
  }[];
  weakSkills: string[];
  suggestedCourses: { title: string; reason: string }[];
}

export default function AdminStudentReportsPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const { isRTL } = useLanguage();

  const traineeId = params.traineeId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentInfo, setTraineeInfo] = useState<StudentInfo | null>(null);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [skills, setSkills] = useState<SkillData | null>(null);
  const [sessions, setSessions] = useState<SessionData | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);

  const [scenarioFilter, setScenarioFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Helper to get token
  const getAuthToken = useCallback((): string | null => {
    console.log('[Admin Reports] getAuthToken called, zustand token:', token ? 'present' : 'null');
    if (token) return token;

    // Try auth_token directly first (simpler)
    const directToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (directToken) {
      console.log('[Admin Reports] Found token in auth_token localStorage');
      return directToken;
    }

    // Fallback to auth-storage
    try {
      const authStorage = localStorage.getItem('auth-storage');
      console.log('[Admin Reports] auth-storage from localStorage:', authStorage ? 'present' : 'null');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        const storedToken = parsed?.state?.token || null;
        console.log('[Admin Reports] Parsed token from auth-storage:', storedToken ? 'present' : 'null');
        return storedToken;
      }
    } catch (e) {
      console.error('Failed to parse auth-storage:', e);
    }
    return null;
  }, [token]);

  // Fetch student info and reports data
  const fetchData = useCallback(async () => {
    console.log('[Admin Reports] fetchData called for traineeId:', traineeId);
    const authToken = getAuthToken();
    console.log('[Admin Reports] authToken:', authToken ? `present (${authToken.substring(0, 20)}...)` : 'null');

    if (!authToken) {
      console.error('[Admin Reports] No auth token found!');
      setError('Not authorized');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    // Ensure apiUrl ends with /api and use it directly (don't create baseUrl)
    console.log('[Admin Reports] API URL:', apiUrl);

    const headers: HeadersInit = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };

    const fetchOptions: RequestInit = {
      headers,
      mode: 'cors',
    };

    try {
      // First verify admin has access to this student
      console.log('[Admin Reports] Fetching student info from:', `${apiUrl}/admin/trainee/${traineeId}/reports`);
      const studentRes = await fetch(`${apiUrl}/admin/trainee/${traineeId}/reports`, fetchOptions);
      if (!studentRes.ok) {
        if (studentRes.status === 404) {
          setError('Student not found');
        } else {
          setError('Access denied');
        }
        setIsLoading(false);
        return;
      }
      const studentData = await studentRes.json();
      setTraineeInfo(studentData);

      // Fetch all reports data for the student (using student's reports endpoints with admin override)
      // Use the traineeId returned from the first API call (which is the actual ID)
      const actualTraineeId = studentData.traineeId;
      console.log('[Admin Reports] Using actual traineeId:', actualTraineeId, '(from URL param:', traineeId, ')');

      const [dashboardRes, skillsRes, sessionsRes, trendsRes, recsRes] = await Promise.all([
        fetch(`${apiUrl}/reports/${actualTraineeId}/dashboard`, fetchOptions),
        fetch(`${apiUrl}/reports/${actualTraineeId}/skills`, fetchOptions),
        fetch(`${apiUrl}/reports/${actualTraineeId}/sessions?page=${currentPage}&limit=10&scenarioType=${scenarioFilter}`, fetchOptions),
        fetch(`${apiUrl}/reports/${actualTraineeId}/trends?months=6`, fetchOptions),
        fetch(`${apiUrl}/reports/${actualTraineeId}/recommendations`, fetchOptions),
      ]);

      console.log('[Admin Reports] Dashboard response:', dashboardRes.status, dashboardRes.ok);
      console.log('[Admin Reports] Skills response:', skillsRes.status, skillsRes.ok);
      console.log('[Admin Reports] Sessions response:', sessionsRes.status, sessionsRes.ok);
      console.log('[Admin Reports] Trends response:', trendsRes.status, trendsRes.ok);
      console.log('[Admin Reports] Recommendations response:', recsRes.status, recsRes.ok);

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        console.log('[Admin Reports] Dashboard data:', dashboardData);
        setDashboard(dashboardData);
      } else {
        console.error('[Admin Reports] Dashboard error:', await dashboardRes.text());
      }

      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        console.log('[Admin Reports] Skills data:', skillsData);
        setSkills(skillsData);
      } else {
        console.error('[Admin Reports] Skills error:', await skillsRes.text());
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        console.log('[Admin Reports] Sessions data:', sessionsData);
        setSessions(sessionsData);
      } else {
        console.error('[Admin Reports] Sessions error:', await sessionsRes.text());
      }

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        console.log('[Admin Reports] Trends data:', trendsData);
        setTrends(trendsData);
      } else {
        console.error('[Admin Reports] Trends error:', await trendsRes.text());
      }

      if (recsRes.ok) {
        const recsData = await recsRes.json();
        console.log('[Admin Reports] Recommendations data:', recsData);
        setRecommendations(recsData);
      } else {
        console.error('[Admin Reports] Recommendations error:', await recsRes.text());
      }

    } catch (err) {
      console.error('[Admin Reports] Error fetching student reports:', err);
      setError('Failed to load reports');
    } finally {
      console.log('[Admin Reports] fetchData completed');
      setIsLoading(false);
    }
  }, [getAuthToken, traineeId, currentPage, scenarioFilter, isRTL]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('[Admin Reports] State update:', {
      isLoading,
      error,
      studentInfo: studentInfo ? 'present' : 'null',
      dashboard: dashboard ? { completedSessions: dashboard.completedSessions, averageScore: dashboard.averageScore } : 'null',
      skills: skills ? `${skills.skills.length} skills` : 'null',
      sessions: sessions ? `${sessions.sessions.length} sessions` : 'null',
      trends: trends.length,
    });
  }, [isLoading, error, studentInfo, dashboard, skills, sessions, trends]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const formatScenarioType = (type: string) => {
    const scenarioMap: Record<string, { en: string; ar: string }> = {
      // Engineering scenario types
      'hvac_systems': { en: 'HVAC Systems & Troubleshooting', ar: 'HVAC Systems & Troubleshooting' },
      'electrical_systems': { en: 'Electrical Systems & Circuits', ar: 'Electrical Systems & Circuits' },
      'safety_compliance': { en: 'Safety Procedures & Compliance', ar: 'Safety Procedures & Compliance' },
      'plc_automation': { en: 'PLC Programming & Automation', ar: 'PLC Programming & Automation' },
      'industrial_maintenance': { en: 'Industrial Maintenance Planning', ar: 'Industrial Maintenance Planning' },
      'advanced_troubleshooting': { en: 'Advanced Troubleshooting', ar: 'Advanced Troubleshooting' },
      'motor_controls': { en: 'Motor Controls & VFD Systems', ar: 'Motor Controls & VFD Systems' },
      'bms_systems': { en: 'Building Management Systems', ar: 'Building Management Systems' },
      // Legacy key fallbacks (mapped to engineering types)
      'property_showing': { en: 'HVAC Systems & Troubleshooting', ar: 'HVAC Systems & Troubleshooting' },
      'price_negotiation': { en: 'Electrical Systems & Circuits', ar: 'Electrical Systems & Circuits' },
      'objection_handling': { en: 'Safety Procedures & Compliance', ar: 'Safety Procedures & Compliance' },
      'first_contact': { en: 'PLC Programming & Automation', ar: 'PLC Programming & Automation' },
      'closing_deal': { en: 'Industrial Maintenance Planning', ar: 'Industrial Maintenance Planning' },
      'difficult_client': { en: 'Advanced Troubleshooting', ar: 'Advanced Troubleshooting' },
    };
    return scenarioMap[type]?.['en'] || type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--';
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  };

  const getGradeColor = (grade: string | null) => {
    switch (grade) {
      case 'A': return 'bg-blue-500/20 text-blue-500 border-blue-500/20';
      case 'B': return 'bg-blue-500/20 text-blue-500 border-blue-500/20';
      case 'C': return 'bg-amber-500/20 text-amber-500 border-amber-500/20';
      case 'D': return 'bg-orange-500/20 text-orange-500 border-orange-500/20';
      case 'F': return 'bg-red-500/20 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      'easy': { en: 'Easy', ar: 'Easy' },
      'medium': { en: 'Medium', ar: 'Medium' },
      'hard': { en: 'Hard', ar: 'Hard' },
    };
    return labels[difficulty]?.['en'] || difficulty;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      'high': { en: 'High', ar: 'High' },
      'medium': { en: 'Medium', ar: 'Medium' },
      'low': { en: 'Low', ar: 'Low' },
    };
    return labels[priority]?.['en'] || priority;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <BackIcon className="h-5 w-5" />
          </Button>
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        </div>
        <Card className="border-border">
          <CardContent className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0089B8] mb-4" />
            <p className="text-muted-foreground">{'Loading reports...'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <BackIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {'Student Reports'}
          </h1>
        </div>
        <Card className="border-border">
          <CardContent className="py-16 flex flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">{error}</p>
            <Link href="/admin/voice-sessions">
              <Button className="mt-4 bg-[#0089B8] hover:bg-[#0089B8]/90">
                <BackIcon className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {'Back to Sessions'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <BackIcon className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#0089B8]" />
              <h1 className="text-2xl font-bold text-foreground">
                {studentInfo ? `${studentInfo.firstName} ${studentInfo.lastName}` : ('Student Reports')}
              </h1>
            </div>
            {studentInfo && (
              <p className="text-muted-foreground text-sm mt-1">{studentInfo.email}</p>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
          {'Refresh'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {'Total Sessions'}
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{dashboard?.completedSessions ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{'Completed simulations'}</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-[#0089B8]/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {'Average Score'}
            </CardTitle>
            <Target className="h-4 w-4 text-[#0089B8]" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-3xl font-bold", getScoreColor(dashboard?.averageScore ?? null))}>
              {dashboard?.averageScore ?? '--'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{'Across all scenarios'}</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {'Improvement'}
            </CardTitle>
            {(dashboard?.improvement ?? 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-blue-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-3xl font-bold",
              (dashboard?.improvement ?? 0) >= 0 ? "text-blue-500" : "text-red-500"
            )}>
              {(dashboard?.improvement ?? 0) >= 0 ? '+' : ''}{dashboard?.improvement ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{'Points since start'}</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-amber-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {'Top Skill'}
            </CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground truncate">
              {skills?.strengths?.[0] || ('Keep practicing')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{'Strongest area'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skill Breakdown */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5 text-[#0089B8]" />
              {'Skill Performance'}
            </CardTitle>
            <CardDescription>{'Performance across different areas'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skills?.skills?.map((skill) => (
                <div key={skill.skillKey} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {skill.isStrength && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                      {skill.isWeakness && <AlertCircle className="h-4 w-4 text-red-500" />}
                      <span className="text-sm font-medium text-foreground">{skill.skill}</span>
                    </div>
                    <span className={cn("text-sm font-bold", getScoreColor(skill.averageScore))}>
                      {skill.averageScore ?? '--'}
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "absolute inset-y-0 rounded-full transition-all duration-500",
                        isRTL ? "right-0" : "left-0",
                        skill.averageScore !== null && skill.averageScore >= 75 ? "bg-blue-500" :
                        skill.averageScore !== null && skill.averageScore >= 60 ? "bg-blue-500" :
                        skill.averageScore !== null ? "bg-amber-500" : "bg-muted-foreground"
                      )}
                      style={{ width: `${skill.averageScore ?? 0}%` }}
                    />
                  </div>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-8">
                  {'Complete simulations to see skill analysis'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Score Trend Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              {'Score Progression'}
            </CardTitle>
            <CardDescription>{'Performance over time'}</CardDescription>
          </CardHeader>
          <CardContent>
            {trends.length > 0 ? (
              <ScoreChart
                data={trends}
                height={200}
                showBenchmark={true}
                benchmarkValue={75}
              />
            ) : (
              <p className="text-muted-foreground text-center py-16">
                {'Complete more simulations to see the chart'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skill Radar Chart */}
      {skills?.skills && skills.skills.some(s => s.averageScore !== null) && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Target className="h-5 w-5 text-[#0089B8]" />
              {'Skill Radar'}
            </CardTitle>
            <CardDescription>{'Visual comparison of skills'}</CardDescription>
          </CardHeader>
          <CardContent>
            <SkillRadarChart
              skills={skills.skills}
              height={300}
              showBenchmark={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Sessions Table */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">{'Session History'}</CardTitle>
              <CardDescription>{'All completed sessions'}</CardDescription>
            </div>
            <Select value={scenarioFilter} onValueChange={setScenarioFilter}>
              <SelectTrigger className="w-48">
                <Filter className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                <SelectValue placeholder="Filter by scenario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{'All Scenarios'}</SelectItem>
                <SelectItem value="hvac_systems">{'HVAC Systems & Troubleshooting'}</SelectItem>
                <SelectItem value="electrical_systems">{'Electrical Systems & Circuits'}</SelectItem>
                <SelectItem value="safety_compliance">{'Safety Procedures & Compliance'}</SelectItem>
                <SelectItem value="plc_automation">{'PLC Programming & Automation'}</SelectItem>
                <SelectItem value="industrial_maintenance">{'Industrial Maintenance Planning'}</SelectItem>
                <SelectItem value="advanced_troubleshooting">{'Advanced Troubleshooting'}</SelectItem>
                <SelectItem value="motor_controls">{'Motor Controls & VFD Systems'}</SelectItem>
                <SelectItem value="bms_systems">{'Building Management Systems'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {sessions?.sessions && sessions.sessions.length > 0 ? (
            <>
              <div className="space-y-3">
                {sessions.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border",
                        getGradeColor(session.grade)
                      )}>
                        {session.grade || '--'}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {formatScenarioType(session.scenarioType)}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {formatDate(session.completedAt)}
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {getDifficultyLabel(session.difficultyLevel)}
                          </Badge>
                        </p>
                      </div>
                    </div>
                    <div className={cn("text-right", isRTL && "text-left")}>
                      <p className={cn("text-xl font-bold", getScoreColor(session.score))}>
                        {session.score ?? '--'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(session.durationSeconds)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {sessions.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    {'Previous'}
                  </Button>
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    {`Page ${sessions.page} of ${sessions.totalPages}`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(sessions.totalPages, p + 1))}
                    disabled={currentPage === sessions.totalPages}
                  >
                    {'Next'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              {'No sessions yet'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            {'Personalized Recommendations'}
          </CardTitle>
          <CardDescription>{'AI suggestions for improvement'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-[#0089B8]" />
                {'Focus Areas'}
              </h4>
              {recommendations?.recommendations && recommendations.recommendations.length > 0 ? (
                recommendations.recommendations.slice(0, 3).map((rec, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-xl",
                      isRTL ? "border-r-4" : "border-l-4",
                      rec.priority === 'high' ? "bg-red-500/10 border-red-500" :
                      rec.priority === 'medium' ? "bg-amber-500/10 border-amber-500" :
                      "bg-blue-500/10 border-blue-500"
                    )}
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs uppercase font-semibold mb-2",
                        rec.priority === 'high' ? "text-red-500 border-red-500/50" :
                        rec.priority === 'medium' ? "text-amber-500 border-amber-500/50" :
                        "text-blue-500 border-blue-500/50"
                      )}
                    >
                      {getPriorityLabel(rec.priority)}
                    </Badge>
                    <h5 className="font-medium text-foreground">{rec.title}</h5>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground py-4">
                  {'Complete more sessions for recommendations'}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                {'Suggested Courses'}
              </h4>
              {recommendations?.suggestedCourses && recommendations.suggestedCourses.length > 0 ? (
                recommendations.suggestedCourses.map((course, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-xl">
                    <h5 className="font-medium text-foreground">{course.title}</h5>
                    <p className="text-sm text-muted-foreground mt-1">{course.reason}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <h5 className="font-medium text-blue-500">{'Great job!'}</h5>
                  <p className="text-sm text-muted-foreground mt-1">
                    {'Keep practicing to maintain your skills!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Reports Section */}
      <VoiceReportsSection studentId={traineeId} />

      {/* Text Reports Section */}
      <TextReportsSection studentId={traineeId} />
    </div>
  );
}
