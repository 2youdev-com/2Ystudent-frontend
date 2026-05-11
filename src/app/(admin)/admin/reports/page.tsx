'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  BarChart3,
  Calendar,
  Award,
  AlertTriangle,
  Download,
  FileText,
  Table2,
} from 'lucide-react';
import jsPDF from 'jspdf';

interface TeamReport {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
  };
  topPerformers: {
    id: string;
    name: string;
    email: string;
    averageScore: number;
    totalSessions: number;
  }[];
  lowPerformers: {
    id: string;
    name: string;
    email: string;
    averageScore: number;
    totalSessions: number;
  }[];
  monthlyTrends: {
    month: string;
    year: number;
    averageScore: number;
    totalSessions: number;
    activeUsers: number;
  }[];
}

export default function AdminReportsPage() {
  const { token } = useAuthStore();
  const { isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<TeamReport | null>(null);

  // Helper to get token from Zustand store or localStorage
  const getAuthToken = useCallback((): string | null => {
    if (token) return token;

    // Fallback to localStorage if store isn't hydrated yet
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
      // NEXT_PUBLIC_API_URL already includes /api
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load reports');
      }

      const data = await response.json();

      // Transform dashboard data to report format
      setReport({
        overview: data.overview,
        topPerformers: data.teamPerformance?.bestPerformer
          ? [data.teamPerformance.bestPerformer]
          : [],
        lowPerformers: data.teamPerformance?.worstPerformer &&
          data.teamPerformance.worstPerformer.id !== data.teamPerformance.bestPerformer?.id
          ? [data.teamPerformance.worstPerformer]
          : [],
        monthlyTrends: data.monthlyTrends || [],
      });
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : ('Failed to load reports'));
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken, isRTL]);

  useEffect(() => {
    // Small delay to allow store hydration
    const timer = setTimeout(() => {
      fetchData();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // ==========================================
  // Export Functions
  // ==========================================

  const handleExportCSV = () => {
    if (!report) {
      alert('No data to export');
      return;
    }

    const lines: string[] = [];

    // Overview section
    lines.push('=== Team Overview ===');
    lines.push('Metric,Value');
    lines.push(`Total Students,${report.overview.totalUsers}`);
    lines.push(`Active Students,${report.overview.activeUsers}`);
    lines.push(`Team Average Score,${report.overview.averageScore}%`);
    lines.push(`Total Sessions,${report.overview.totalSessions}`);
    lines.push(`Completed Sessions,${report.overview.completedSessions}`);
    const engRate = report.overview.totalUsers
      ? Math.round((report.overview.activeUsers / report.overview.totalUsers) * 100)
      : 0;
    lines.push(`Engagement Rate,${engRate}%`);
    lines.push('');

    // Monthly Trends
    if (report.monthlyTrends.length > 0) {
      lines.push('=== Monthly Trends ===');
      lines.push('Month,Year,Average Score,Total Sessions,Active Users');
      for (const t of report.monthlyTrends) {
        lines.push(`${t.month},${t.year},${t.averageScore}%,${t.totalSessions},${t.activeUsers}`);
      }
      lines.push('');
    }

    // Top Performers
    if (report.topPerformers.length > 0) {
      lines.push('=== Top Performers ===');
      lines.push('Name,Email,Average Score,Sessions');
      for (const p of report.topPerformers) {
        lines.push(`"${p.name}",${p.email},${p.averageScore}%,${p.totalSessions}`);
      }
      lines.push('');
    }

    // Low Performers
    if (report.lowPerformers.length > 0) {
      lines.push('=== Need Support ===');
      lines.push('Name,Email,Average Score,Sessions');
      for (const p of report.lowPerformers) {
        lines.push(`"${p.name}",${p.email},${p.averageScore}%,${p.totalSessions}`);
      }
    }

    const csv = lines.join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!report) {
      alert('No data to export');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 137, 184); // #0089B8
    doc.text('Team Reports', pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
    y += 14;

    // Overview Stats
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Overview', 14, y);
    y += 8;

    const engRate = report.overview.totalUsers
      ? Math.round((report.overview.activeUsers / report.overview.totalUsers) * 100)
      : 0;

    doc.setFontSize(10);
    const overviewData = [
      ['Total Students', String(report.overview.totalUsers)],
      ['Active Students', String(report.overview.activeUsers)],
      ['Team Average', `${report.overview.averageScore}%`],
      ['Total Sessions', String(report.overview.totalSessions)],
      ['Completed Sessions', String(report.overview.completedSessions)],
      ['Engagement Rate', `${engRate}%`],
    ];

    // Draw overview table
    for (const [label, value] of overviewData) {
      doc.setTextColor(80, 80, 80);
      doc.text(label, 14, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(value, 90, y);
      doc.setFont('helvetica', 'normal');
      y += 6;
    }
    y += 8;

    // Monthly Trends
    if (report.monthlyTrends.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Monthly Trends', 14, y);
      y += 8;

      // Table header
      doc.setFontSize(9);
      doc.setFillColor(0, 137, 184);
      doc.rect(14, y - 4, pageWidth - 28, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Month', 16, y);
      doc.text('Avg Score', 60, y);
      doc.text('Sessions', 100, y);
      doc.text('Active Users', 140, y);
      doc.setFont('helvetica', 'normal');
      y += 6;

      // Table rows
      for (const t of report.monthlyTrends) {
        doc.setTextColor(60, 60, 60);
        doc.text(`${t.month} ${t.year}`, 16, y);
        doc.text(`${t.averageScore}%`, 60, y);
        doc.text(String(t.totalSessions), 100, y);
        doc.text(String(t.activeUsers), 140, y);
        y += 6;
      }
      y += 8;
    }

    // Top Performers
    if (report.topPerformers.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Top Performers', 14, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFillColor(59, 130, 246); // blue-500
      doc.rect(14, y - 4, pageWidth - 28, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Name', 16, y);
      doc.text('Email', 70, y);
      doc.text('Score', 140, y);
      doc.text('Sessions', 170, y);
      doc.setFont('helvetica', 'normal');
      y += 6;

      for (const p of report.topPerformers) {
        doc.setTextColor(60, 60, 60);
        doc.text(p.name.slice(0, 30), 16, y);
        doc.text(p.email.slice(0, 35), 70, y);
        doc.text(`${p.averageScore}%`, 140, y);
        doc.text(String(p.totalSessions), 170, y);
        y += 6;
      }
      y += 8;
    }

    // Need Support
    if (report.lowPerformers.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Need Support', 14, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFillColor(245, 158, 11); // amber-500
      doc.rect(14, y - 4, pageWidth - 28, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Name', 16, y);
      doc.text('Email', 70, y);
      doc.text('Score', 140, y);
      doc.text('Sessions', 170, y);
      doc.setFont('helvetica', 'normal');
      y += 6;

      for (const p of report.lowPerformers) {
        doc.setTextColor(60, 60, 60);
        doc.text(p.name.slice(0, 30), 16, y);
        doc.text(p.email.slice(0, 35), 70, y);
        doc.text(`${p.averageScore}%`, 140, y);
        doc.text(String(p.totalSessions), 170, y);
        y += 6;
      }
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text('2YStudy - Team Performance Report', pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`team-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded-lg w-1/3 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="p-6 bg-amber-500/10 rounded-full mb-6">
          <AlertTriangle className="h-16 w-16 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {'Unable to Load Reports'}
        </h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={fetchData} className="bg-[#0089B8] hover:bg-[#0089B8]/90">
          <RefreshCw className="h-5 w-5 mr-2" />
          {'Try Again'}
        </Button>
      </div>
    );
  }

  const engagementRate = report?.overview.totalUsers
    ? Math.round((report.overview.activeUsers / report.overview.totalUsers) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {'Team Reports'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {'Team performance analytics and statistics'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {'Refresh'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                {'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                {'Export PDF'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
                <Table2 className="h-4 w-4" />
                {'Export CSV'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{'Total Students'}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{report?.overview.totalUsers ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {report?.overview.activeUsers ?? 0} {'active'}
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-[#0089B8]/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{'Team Average'}</p>
                <p className={cn("text-3xl font-bold mt-1", getScoreColor(report?.overview.averageScore ?? 0))}>
                  {report?.overview.averageScore ?? '--'}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {'Overall score'}
                </p>
              </div>
              <div className="p-3 bg-[#0089B8]/20 rounded-xl">
                <Target className="h-6 w-6 text-[#0089B8]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{'Completed Sessions'}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{report?.overview.completedSessions ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {'of'} {report?.overview.totalSessions ?? 0} {'total'}
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-amber-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{'Engagement Rate'}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{engagementRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {'Active users'}
                </p>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5 text-[#0089B8]" />
                {'Monthly Performance Trends'}
              </CardTitle>
              <CardDescription>
                {'Team performance progression over recent months'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {report?.monthlyTrends && report.monthlyTrends.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-2 h-48 pt-4">
                {report.monthlyTrends.map((trend, index) => (
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
                      <p className="text-[10px] text-muted-foreground">
                        {trend.totalSessions} {'sessions'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-xs text-muted-foreground">{'Excellent (80%+)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-xs text-muted-foreground">{'Good (70-79%)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded" />
                  <span className="text-xs text-muted-foreground">{'Fair (60-69%)'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">{'Not enough data yet'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top & Low Performers */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performers */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Award className="h-5 w-5 text-blue-500" />
              {'Top Performers'}
            </CardTitle>
            <CardDescription>
              {'Students with the highest scores'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {report?.topPerformers && report.topPerformers.length > 0 ? (
              <div className="space-y-3">
                {report.topPerformers.map((performer, index) => (
                  <div key={performer.id} className="flex items-center gap-4 p-3 bg-blue-500/5 rounded-xl border border-blue-500/20">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{performer.name}</p>
                      <p className="text-sm text-muted-foreground">{performer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-500">{performer.averageScore}%</p>
                      <p className="text-xs text-muted-foreground">
                        {performer.totalSessions} {'sessions'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {'No data yet'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Low Performers */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {'Need Support'}
            </CardTitle>
            <CardDescription>
              {'Students who may need additional help'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {report?.lowPerformers && report.lowPerformers.length > 0 ? (
              <div className="space-y-3">
                {report.lowPerformers.map((performer) => (
                  <div key={performer.id} className="flex items-center gap-4 p-3 bg-amber-500/5 rounded-xl border border-amber-500/20">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{performer.name}</p>
                      <p className="text-sm text-muted-foreground">{performer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-500">{performer.averageScore}%</p>
                      <p className="text-xs text-muted-foreground">
                        {performer.totalSessions} {'sessions'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20 text-center">
                <Award className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="font-medium text-blue-500">
                  {'All students are doing well!'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {'No students need extra support'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
