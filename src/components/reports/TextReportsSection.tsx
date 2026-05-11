'use client';

/**
 * Text Chat Reports Section
 *
 * Displays text-based training session reports with detailed performance analysis,
 * chat transcript viewing, and PDF export functionality.
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { exportChatTranscriptToPDF } from '@/lib/utils/pdf-export';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  MessageSquare,
  Clock,
  Award,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Lightbulb,
  FileText,
  User,
  Bot,
} from 'lucide-react';

interface ConversationTurn {
  id: string;
  speaker: 'student' | 'trainee' | 'client';
  message: string;
  timestamp: string;
  sentiment?: string | null;
}

interface TextSession {
  id: string;
  studentId: string;
  scenarioType: string;
  difficultyLevel: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  durationSeconds: number | null;
  outcome: string | null;
  metrics: string | null;
  conversationTurns: ConversationTurn[];
}

interface ParsedMetrics {
  turnCount: number;
  // New engineering field names
  problemsSolved?: number;
  totalProblems?: number;
  // Old field names kept for backward compatibility
  resolvedObjections?: number;
  totalObjections?: number;
  preliminaryScore: number;
  aiEvaluatedScore?: number;
  aiGrade?: string;
}

interface TextReportsSectionProps {
  className?: string;
  studentId?: string; // For admin view of specific student's reports
}

// Safe number helper
function safeNumber(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed;
    }
  }
  return defaultValue;
}

export function TextReportsSection({ className, studentId }: TextReportsSectionProps) {
  const { t, isRTL } = useLanguage();
  const [sessions, setSessions] = useState<TextSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [loadingTranscript, setLoadingTranscript] = useState<string | null>(null);

  // Helper to get token
  const getAuthToken = (): string | null => {
    let token = localStorage.getItem('auth_token');
    if (!token) {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          token = parsed?.state?.token;
          if (token) localStorage.setItem('auth_token', token);
        } catch (e) {
          console.error('Failed to parse auth-storage:', e);
        }
      }
    }
    return token;
  };

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();

      if (!token) {
        // No token - silently return empty, user will be redirected by layout
        setSessions([]);
        return;
      }

      // FIXED: Use NEXT_PUBLIC_API_URL directly - it already includes /api
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      // Use admin endpoint if studentId is provided, otherwise use personal history
      const url = studentId
        ? `${apiUrl}/admin/trainee/${studentId}/simulations`
        : `${apiUrl}/simulations/history`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // For 401/403, silently return empty - user will be redirected
        if (response.status === 401 || response.status === 403) {
          setSessions([]);
          return;
        }
        // For other errors, silently return empty (no error shown)
        setSessions([]);
        return;
      }

      const data = await response.json();

      // Filter only completed sessions
      const completedSessions = (data.sessions || data || []).filter(
        (s: TextSession) => s.status === 'completed'
      );
      setSessions(completedSessions);
    } catch (err) {
      // Network errors - silently fail, show empty state
      console.error('[TextReportsSection] Failed to load:', err);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const fetchTranscript = async (sessionId: string) => {
    setLoadingTranscript(sessionId);
    try {
      const token = getAuthToken();
      if (!token) return;

      // FIXED: Use NEXT_PUBLIC_API_URL directly - it already includes /api
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      const response = await fetch(`${apiUrl}/simulations/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Silently fail - don't show error to user
        return;
      }

      const data = await response.json();

      // Update the session with conversation turns
      setSessions(prev => prev.map(s =>
        s.id === sessionId
          ? { ...s, conversationTurns: data.conversationTurns || [] }
          : s
      ));
    } catch (err) {
      // Silently fail - don't show error to user
      console.error('Failed to load transcript:', err);
    } finally {
      setLoadingTranscript(null);
    }
  };

  const parseMetrics = (metricsJson: string | null): ParsedMetrics | null => {
    if (!metricsJson) return null;
    try {
      return JSON.parse(metricsJson);
    } catch {
      return null;
    }
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '--';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '--';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '--';
    }
  };

  const formatScenarioType = (type: string): string => {
    const scenarioMap: Record<string, string> = {
      // New engineering scenario types
      hvac_systems: 'HVAC Systems & Troubleshooting',
      electrical_systems: 'Electrical Systems & Circuits',
      safety_compliance: 'Safety Procedures & Compliance',
      plc_automation: 'PLC Programming & Automation',
      industrial_maintenance: 'Industrial Maintenance Planning',
      advanced_troubleshooting: 'Advanced Troubleshooting',
      motor_controls: 'Motor Controls & VFD Systems',
      bms_systems: 'Building Management Systems',
      // Old keys kept as fallbacks for legacy data
      property_showing: 'HVAC Systems & Troubleshooting',
      price_negotiation: 'Electrical Systems & Circuits',
      objection_handling: 'Safety Procedures & Compliance',
      first_contact: 'PLC Programming & Automation',
      closing_deal: 'Industrial Maintenance Planning',
      difficult_client: 'Advanced Troubleshooting',
    };
    return scenarioMap[type] || type.replace(/_/g, ' ');
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-700 border-gray-200';
    if (score >= 80) return 'bg-green-50 text-green-600 border-green-200';
    if (score >= 60) return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    return 'bg-red-50 text-red-600 border-red-200';
  };

  const getGradeColor = (grade: string | null) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-700';
      case 'B': return 'bg-blue-100 text-blue-700';
      case 'C': return 'bg-yellow-100 text-yellow-700';
      case 'D': return 'bg-orange-100 text-orange-700';
      case 'F': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleToggleExpand = async (sessionId: string) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      return;
    }

    setExpandedSession(sessionId);

    // Check if we already have the transcript
    const session = sessions.find(s => s.id === sessionId);
    if (session && (!session.conversationTurns || session.conversationTurns.length === 0)) {
      await fetchTranscript(sessionId);
    }
  };

  const handleExportPDF = async (session: TextSession) => {
    setExportingId(session.id);
    try {
      // Fetch transcript if not loaded
      if (!session.conversationTurns || session.conversationTurns.length === 0) {
        await fetchTranscript(session.id);
        // Get updated session
        const updatedSession = sessions.find(s => s.id === session.id);
        if (updatedSession) {
          session = updatedSession;
        }
      }

      const metrics = parseMetrics(session.metrics);

      await exportChatTranscriptToPDF({
        sessionId: session.id,
        scenarioType: formatScenarioType(session.scenarioType),
        difficultyLevel: session.difficultyLevel,
        completedAt: session.completedAt ? new Date(session.completedAt) : new Date(),
        duration: session.durationSeconds || 0,
        score: metrics?.aiEvaluatedScore ?? metrics?.preliminaryScore ?? null,
        grade: metrics?.aiGrade ?? null,
        messages: (session.conversationTurns || []).map(turn => ({
          speaker: turn.speaker,
          message: turn.message,
          timestamp: new Date(turn.timestamp),
        })),
      }, {
        filename: `chat-transcript-${session.id.slice(0, 8)}.pdf`,
        isRTL,
      });
    } catch (err) {
      // Silently fail - don't show error to user
      console.error('Failed to export PDF:', err);
    } finally {
      setExportingId(null);
    }
  };

  // Calculate stats
  const stats = {
    totalSessions: sessions.length,
    averageScore: sessions.length > 0
      ? Math.round(
          sessions
            .map(s => {
              const m = parseMetrics(s.metrics);
              return m?.aiEvaluatedScore ?? m?.preliminaryScore ?? 0;
            })
            .filter(score => score > 0)
            .reduce((sum, score, _, arr) => sum + score / arr.length, 0)
        )
      : 0,
    totalDuration: sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0),
    totalMessages: sessions.reduce((sum, s) => {
      const m = parseMetrics(s.metrics);
      return sum + (m?.turnCount || 0);
    }, 0),
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">
            {'Loading chat reports...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Text Chat Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium leading-relaxed">
              {'Text Chats'}
            </CardTitle>
            <MessageSquare className="h-5 w-5 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mt-1">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {'Total training sessions'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium leading-relaxed">
              {'Average Score'}
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-3xl font-bold mt-1",
              stats.averageScore >= 70 ? "text-green-600" :
              stats.averageScore >= 50 ? "text-yellow-600" : "text-red-600"
            )}>
              {stats.averageScore > 0 ? `${stats.averageScore}%` : '--'}
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {'Across all chats'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium leading-relaxed">
              {'Total Messages'}
            </CardTitle>
            <FileText className="h-5 w-5 text-[#0089B8] flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mt-1">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {'Messages exchanged'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium leading-relaxed">
              {'Learning Time'}
            </CardTitle>
            <Clock className="h-5 w-5 text-green-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mt-1">
              {Math.floor(stats.totalDuration / 60)} <span className="text-lg font-normal">{'min'}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {'Total training time'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              {'Text Chat Reports'}
            </CardTitle>
            <CardDescription>
              {'Your text training performance evaluations'}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={fetchSessions}>
            <RefreshCw className={cn("h-4 w-4", "mr-2")} />
            {'Refresh'}
          </Button>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">
                {'No reports yet'}
              </p>
              <p className="text-sm mt-1">
                {'Complete a text training session to see reports here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const metrics = parseMetrics(session.metrics);
                const isExpanded = expandedSession === session.id;
                const score = metrics?.aiEvaluatedScore ?? metrics?.preliminaryScore ?? null;
                const grade = metrics?.aiGrade ?? null;

                return (
                  <div
                    key={session.id}
                    className="border rounded-xl overflow-hidden transition-all"
                  >
                    {/* Session Header */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors gap-4"
                      onClick={() => handleToggleExpand(session.id)}
                    >
                      {/* Score Box */}
                      <div className={cn(
                        "w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl border flex-shrink-0",
                        getScoreColor(score)
                      )}>
                        {score !== null ? `${Math.round(score)}` : '--'}
                      </div>

                      {/* Session Info - takes remaining space */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                            {formatScenarioType(session.scenarioType)}
                          </p>
                          {grade && (
                            <Badge className={cn("text-xs px-2 py-0.5", getGradeColor(grade))}>
                              {grade}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2 flex-wrap">
                          <span className="flex items-center gap-1.5 whitespace-nowrap">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{formatDate(session.completedAt)}</span>
                          </span>
                          <span className="flex items-center gap-1.5 whitespace-nowrap">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>{formatDuration(session.durationSeconds)}</span>
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {session.difficultyLevel}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportPDF(session);
                          }}
                          disabled={exportingId === session.id}
                        >
                          {exportingId === session.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          <span className="hidden sm:inline">
                            {'PDF'}
                          </span>
                        </Button>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details - Chat Transcript */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-4">
                        {/* Performance Summary */}
                        {metrics && (
                          <div className="mb-4 grid grid-cols-3 gap-3">
                            <div className="bg-white rounded-lg p-3 border text-center">
                              <p className="text-xs text-gray-500">
                                {'Messages'}
                              </p>
                              <p className="text-lg font-bold text-gray-900">
                                {metrics.turnCount || 0}
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border text-center">
                              <p className="text-xs text-gray-500">
                                {'Problems Solved'}
                              </p>
                              <p className="text-lg font-bold text-green-600">
                                {metrics.problemsSolved ?? metrics.resolvedObjections ?? 0}/{metrics.totalProblems ?? metrics.totalObjections ?? 0}
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border text-center">
                              <p className="text-xs text-gray-500">
                                {'Outcome'}
                              </p>
                              <p className="text-lg font-bold text-blue-600 capitalize">
                                {session.outcome?.replace(/_/g, ' ') || '--'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Chat Transcript */}
                        <div className="bg-white rounded-lg border p-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            {'Chat Transcript'}
                          </h4>

                          {loadingTranscript === session.id ? (
                            <div className="text-center py-8">
                              <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">
                                {'Loading transcript...'}
                              </p>
                            </div>
                          ) : session.conversationTurns && session.conversationTurns.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {session.conversationTurns.map((turn, index) => (
                                <div
                                  key={turn.id || index}
                                  className={cn(
                                    "flex gap-3",
                                    (turn.speaker === 'student' || turn.speaker === 'trainee') ? 'flex-row-reverse' : ''
                                  )}
                                >
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                    (turn.speaker === 'student' || turn.speaker === 'trainee')
                                      ? 'bg-blue-100 text-blue-600'
                                      : 'bg-gray-100 text-gray-700'
                                  )}>
                                    {(turn.speaker === 'student' || turn.speaker === 'trainee') ? (
                                      <User className="h-4 w-4" />
                                    ) : (
                                      <Bot className="h-4 w-4" />
                                    )}
                                  </div>
                                  <div className={cn(
                                    "flex-1 max-w-[80%]",
                                    (turn.speaker === 'student' || turn.speaker === 'trainee') ? 'text-right' : 'text-left'
                                  )}>
                                    <div className={cn(
                                      "inline-block rounded-2xl px-4 py-2",
                                      (turn.speaker === 'student' || turn.speaker === 'trainee')
                                        ? 'bg-blue-500 text-white rounded-tr-none'
                                        : 'bg-gray-100 text-gray-900 rounded-tl-none'
                                    )}>
                                      <p className="text-sm whitespace-pre-wrap">
                                        {turn.message}
                                      </p>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(turn.timestamp).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">
                                {'No messages found'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TextReportsSection;
