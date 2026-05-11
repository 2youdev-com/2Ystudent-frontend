'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminRoleSafe } from '@/contexts/AdminRoleContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Activity,
  ChevronRight,
  RefreshCw,
  BarChart3,
  Clock,
  Phone,
  MessageSquare,
  UserCheck,
  Zap,
  Trophy,
  GraduationCap,
} from 'lucide-react';

interface OverviewStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  averageSessionsPerUser: number;
}

interface TeamPerformance {
  bestPerformer: {
    id: string;
    name: string;
    email: string;
    averageScore: number;
    totalSessions: number;
  } | null;
  worstPerformer: {
    id: string;
    name: string;
    email: string;
    averageScore: number;
    totalSessions: number;
  } | null;
  averageTeamScore: number;
}

interface MonthlyTrend {
  month: string;
  year: number;
  averageScore: number;
  totalSessions: number;
  activeUsers: number;
}

interface RecentActivity {
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details: string;
}

interface DashboardData {
  overview: OverviewStats;
  teamPerformance: TeamPerformance;
  monthlyTrends: MonthlyTrend[];
  recentActivity: RecentActivity[];
}

export default function AdminDashboardPage() {
  const { token, user } = useAuthStore();
  const { isRTL } = useLanguage();
  const { isSupervisor, isAdmin } = useAdminRoleSafe();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const getAuthToken = useCallback((): string | null => {
    if (token) return token;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed?.state?.token || null;
      }
    } catch (e) {
      console.error('Failed to parse auth-storage:', e);
    }
    return null;
  }, [token]);

  const fetchData = useCallback(async () => {
    const authToken = getAuthToken();
    if (!authToken) {
      setError('Not authorized');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError('Failed to load dashboard data');
        }
        return;
      }

      const data = await response.json();
      setDashboard(data);
      setError(null);
    } catch (err) {
      console.error('[AdminDashboard] Error fetching:', err);
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken, isRTL]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#0089B8]';
    if (score >= 70) return 'text-[#0089B8]';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-[#0089B8]';
    if (score >= 70) return 'bg-[#0089B8]';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getGradeLabel = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded-lg w-1/3 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 bg-muted rounded-xl animate-pulse" />
          <div className="h-96 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <div className="p-6 bg-amber-500/10 rounded-full mb-6">
            <AlertTriangle className="h-16 w-16 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Unable to Load Dashboard
          </h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">{error}</p>
          <Button onClick={fetchData} size="lg" className="bg-[#0089B8] hover:bg-[#007AA6] text-white">
            <RefreshCw className="h-5 w-5 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const engagementRate = dashboard?.overview.totalUsers
    ? Math.round((dashboard.overview.activeUsers / dashboard.overview.totalUsers) * 100)
    : 0;

  const completionRate = dashboard?.overview.totalSessions
    ? Math.round((dashboard.overview.completedSessions / dashboard.overview.totalSessions) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {`Welcome back, ${user?.firstName}!`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSupervisor
              ? "Here's how your assigned students are performing"
              : "Here's what's happening with your training team"
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSupervisor && (
            <Badge variant="outline" className="px-3 py-1.5 bg-[#0089B8]/10 border-[#0089B8]/30 text-[#0089B8]">
              <GraduationCap className="h-3.5 w-3.5 mr-2" />
              Supervisor View
            </Badge>
          )}
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <Card className="relative overflow-hidden border border-border shadow-sm bg-gradient-to-br from-[#0089B8]/10 via-background to-background">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0089B8]/5 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isSupervisor ? 'My Students' : 'Total Students'}
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#0089B8]/10">
              {isSupervisor ? <GraduationCap className="h-5 w-5 text-[#0089B8]" /> : <Users className="h-5 w-5 text-[#0089B8]" />}
            </div>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-3xl font-bold text-foreground">{dashboard?.overview.totalUsers ?? 0}</p>
            <div className="flex items-center gap-1 mt-2 text-muted-foreground">
              <UserCheck className="h-4 w-4 text-[#0089B8]" />
              <span className="text-sm">{dashboard?.overview.activeUsers ?? 0} active</span>
            </div>
          </CardContent>
        </Card>

        {/* Team Average Score */}
        <Card className="relative overflow-hidden border border-border shadow-sm bg-gradient-to-br from-[#162B46]/10 via-background to-background">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#162B46]/5 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isSupervisor ? 'Students Average' : 'Team Average'}
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#162B46]/10">
              <Target className="h-5 w-5 text-[#162B46] dark:text-gray-300" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-3xl font-bold text-foreground">{dashboard?.teamPerformance.averageTeamScore ?? '--'}%</p>
            <div className="flex items-center gap-1 mt-2 text-muted-foreground">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm">Grade {getGradeLabel(dashboard?.teamPerformance.averageTeamScore ?? 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Sessions */}
        <Card className="relative overflow-hidden border border-border shadow-sm bg-gradient-to-br from-[#0089B8]/10 via-background to-background">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0089B8]/5 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">Learning Sessions</CardTitle>
            <div className="p-2 rounded-lg bg-[#0089B8]/10">
              <Activity className="h-5 w-5 text-[#0089B8]" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-3xl font-bold text-foreground">{dashboard?.overview.totalSessions ?? 0}</p>
            <div className="flex items-center gap-1 mt-2 text-muted-foreground">
              <Zap className="h-4 w-4 text-[#0089B8]" />
              <span className="text-sm">{completionRate}% completed</span>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <Card className="relative overflow-hidden border border-border shadow-sm bg-gradient-to-br from-amber-500/10 via-background to-background">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Rate</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10">
              <BarChart3 className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-3xl font-bold text-foreground">{engagementRate}%</p>
            <div className="flex items-center gap-1 mt-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <span className="text-sm">{dashboard?.overview.averageSessionsPerUser?.toFixed(1) ?? 0} sessions/user</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Overview - Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Trends Chart */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BarChart3 className="h-5 w-5 text-[#0089B8]" />
                    Performance Trends
                  </CardTitle>
                  <CardDescription>
                    {isSupervisor
                      ? 'Monthly overview of your students performance'
                      : 'Monthly team performance overview'
                    }
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {`Last ${dashboard?.monthlyTrends?.length ?? 0} months`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {dashboard?.monthlyTrends && dashboard.monthlyTrends.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-end justify-between gap-2 h-48 pt-4">
                    {dashboard.monthlyTrends.map((trend, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative w-full flex flex-col items-center">
                          <span className="text-xs font-medium text-muted-foreground mb-1">
                            {trend.averageScore}%
                          </span>
                          <div
                            className={cn(
                              "w-full max-w-[60px] rounded-t-lg transition-all duration-500",
                              getScoreBg(trend.averageScore)
                            )}
                            style={{ height: `${Math.max(trend.averageScore * 1.5, 20)}px` }}
                          />
                        </div>
                        <div className="text-center">
                          <span className="text-xs font-medium text-foreground">{trend.month}</span>
                          <p className="text-[10px] text-muted-foreground">{trend.totalSessions} sessions</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#0089B8] rounded" />
                      <span className="text-xs text-muted-foreground">Good (70%+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-500 rounded" />
                      <span className="text-xs text-muted-foreground">Fair (60-69%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded" />
                      <span className="text-xs text-muted-foreground">Needs Work (&lt;60%)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No trend data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top & Needs Support */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Performer */}
            <Card className="border-border overflow-hidden">
              <div className="h-1.5 bg-[#0089B8]" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <Trophy className="h-5 w-5 text-[#0089B8]" />
                  Top Performer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.teamPerformance.bestPerformer ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-[#0089B8] flex items-center justify-center text-white font-bold text-lg">
                        {dashboard.teamPerformance.bestPerformer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {dashboard.teamPerformance.bestPerformer.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {dashboard.teamPerformance.bestPerformer.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#0089B8]/10 rounded-xl">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#0089B8]">
                          {dashboard.teamPerformance.bestPerformer.averageScore}%
                        </p>
                        <p className="text-xs text-muted-foreground">Avg Score</p>
                      </div>
                      <div className="h-10 w-px bg-[#0089B8]/30" />
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#0089B8]">
                          {dashboard.teamPerformance.bestPerformer.totalSessions}
                        </p>
                        <p className="text-xs text-muted-foreground">Sessions</p>
                      </div>
                      <div className="h-10 w-px bg-[#0089B8]/30" />
                      <Badge className="bg-[#0089B8] text-white">
                        Grade {getGradeLabel(dashboard.teamPerformance.bestPerformer.averageScore)}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Needs Support */}
            <Card className="border-border overflow-hidden">
              <div className="h-1.5 bg-amber-500" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Needs Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.teamPerformance.worstPerformer &&
                 dashboard.teamPerformance.worstPerformer.id !== dashboard.teamPerformance.bestPerformer?.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-lg">
                        {dashboard.teamPerformance.worstPerformer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {dashboard.teamPerformance.worstPerformer.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {dashboard.teamPerformance.worstPerformer.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-xl">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-500">
                          {dashboard.teamPerformance.worstPerformer.averageScore}%
                        </p>
                        <p className="text-xs text-muted-foreground">Avg Score</p>
                      </div>
                      <div className="h-10 w-px bg-amber-500/30" />
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-500">
                          {dashboard.teamPerformance.worstPerformer.totalSessions}
                        </p>
                        <p className="text-xs text-muted-foreground">Sessions</p>
                      </div>
                      <div className="h-10 w-px bg-amber-500/30" />
                      <Badge className="bg-amber-500 text-white">
                        Grade {getGradeLabel(dashboard.teamPerformance.worstPerformer.averageScore)}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">All students performing well!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/employees">
                <Button variant="outline" className="w-full justify-between hover:bg-[#0089B8]/10 hover:border-[#0089B8]/30 hover:text-[#0089B8]">
                  <span className="flex items-center gap-2">
                    {isSupervisor ? <GraduationCap className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                    {isSupervisor ? 'My Students' : 'Manage Students'}
                  </span>
                  <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
                </Button>
              </Link>
              <Link href="/admin/groups">
                <Button variant="outline" className="w-full justify-between hover:bg-[#0089B8]/10 hover:border-[#0089B8]/30 hover:text-[#0089B8]">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {isSupervisor ? 'My Groups' : 'Groups'}
                  </span>
                  <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
                </Button>
              </Link>
              <Link href="/admin/voice-sessions">
                <Button variant="outline" className="w-full justify-between hover:bg-[#0089B8]/10 hover:border-[#0089B8]/30 hover:text-[#0089B8]">
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Voice Sessions
                  </span>
                  <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
                </Button>
              </Link>
              <Link href="/admin/reports">
                <Button variant="outline" className="w-full justify-between hover:bg-[#0089B8]/10 hover:border-[#0089B8]/30 hover:text-[#0089B8]">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    View Reports
                  </span>
                  <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <Activity className="h-5 w-5 text-[#0089B8]" />
                  {isSupervisor ? 'Student Activity' : 'Recent Activity'}
                </CardTitle>
                <Badge variant="outline" className="text-xs">Live</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {dashboard.recentActivity.slice(0, 8).map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#0089B8] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {activity.userName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.userName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {activity.details}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Activity className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground text-sm">
                    {isSupervisor ? 'No activity from your students' : 'No recent activity'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
