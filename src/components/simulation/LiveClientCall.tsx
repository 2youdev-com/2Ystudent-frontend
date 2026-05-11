'use client';

/**
 * Live Mentor Session Component
 *
 * Connects the live session page to the existing ElevenLabs real-time call system.
 * This component reuses the working voice training infrastructure without modifications.
 *
 * Naming: "Live Mentor Session" for electromechanical learning professional training market positioning.
 */

import { useCallback, useState, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SimulationScenarioType, DifficultyLevel } from '@/types';
import {
  Phone,
  PhoneOff,
  Mic,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react';

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const directToken = localStorage.getItem('auth_token');
    if (directToken) return directToken;

    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.state?.token;
        if (token) {
          localStorage.setItem('auth_token', token);
          return token;
        }
      } catch (e) {
        console.error('[LiveClientCall] Failed to parse auth-storage:', e);
      }
    }
  }
  return null;
}

interface LiveMentorSessionProps {
  scenarioType: SimulationScenarioType;
  difficultyLevel: DifficultyLevel;
  topicTitle?: string;
  topicSystemPrompt?: string;
  courseContext?: string;
  onEnd: () => void;
  onBack: () => void;
}

interface PerformanceAnalysis {
  overallScore: number;
  breakdown: {
    opening: number;
    needsDiscovery: number;
    objectionHandling: number;
    persuasion: number;
    closing: number;
    communication: number;
  };
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
}

type CallStatus = 'idle' | 'connecting' | 'active' | 'ending' | 'analyzing' | 'complete' | 'setup_required';

export function LiveClientCall({
  scenarioType,
  difficultyLevel,
  topicTitle,
  topicSystemPrompt,
  courseContext,
  onEnd,
  onBack,
}: LiveMentorSessionProps) {
  const router = useRouter();
  const { isRTL } = useLanguage();
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  // ElevenLabs conversation hook - uses the same service as voice-training
  const conversation = useConversation({
    onConnect: () => {
      console.log('[LiveClientCall] Connected to ElevenLabs');
      setCallStatus('active');
      setError(null);
    },
    onDisconnect: () => {
      console.log('[LiveClientCall] Disconnected from ElevenLabs');
      if (callStatus === 'active') {
        setCallStatus('ending');
      }
    },
    onMessage: (message) => {
      console.log('[LiveClientCall] Message:', message);
    },
    onError: (error) => {
      console.error('[LiveClientCall] Error:', error);
      setError(`Connection error: ${error}`);
      setCallStatus('idle');
    },
  });

  // Timer for session duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (callStatus === 'active') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  // Start session - uses the same backend endpoint as voice-training
  const handleStartCall = useCallback(async () => {
    try {
      setCallStatus('connecting');
      setError(null);
      setCallDuration(0);

      const token = getAuthToken();
      if (!token) {
        throw new Error('Please log in first');
      }

      // Sync token
      localStorage.setItem('auth_token', token);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/elevenlabs/signed-url`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error('Authentication session expired - please log in again');
        }

        if (errorData.message?.includes('permission') || errorData.message?.includes('create agent')) {
          setCallStatus('setup_required');
          return;
        }

        throw new Error(errorData.message || 'Failed to start session');
      }

      const { signedUrl, agentId } = await response.json();
      console.log('[LiveClientCall] Got signed URL for agent:', agentId);

      // Map scenario type to readable labels for the agent
      const scenarioLabels: Record<string, { name: string; role: string; firstMessage: string }> = {
        hvac_systems: {
          name: 'HVAC Systems & Troubleshooting',
          role: 'a facilities manager reporting HVAC problems for you to diagnose',
          firstMessage: `Right then, I'm James, your learning mentor. I've got an HVAC issue on site that needs your attention — a ${difficultyLevel === 'easy' ? 'straightforward cooling problem' : difficultyLevel === 'medium' ? 'chiller system that\'s playing up' : 'complex multi-zone climate control failure'}. Shall we have a look?`,
        },
        electrical_systems: {
          name: 'Electrical Systems & Circuits',
          role: 'a site engineer discussing power system design or an electrical fault',
          firstMessage: `Good afternoon, I'm James. We've got an electrical issue to work through today — ${difficultyLevel === 'easy' ? 'a straightforward distribution problem' : difficultyLevel === 'medium' ? 'some protection relay trips we need to investigate' : 'a complex power quality issue affecting the whole facility'}. Ready to crack on?`,
        },
        safety_compliance: {
          name: 'Safety Procedures & Compliance',
          role: 'a safety inspector conducting an audit or investigating a near-miss incident',
          firstMessage: `Hello there, I'm James. I'm here as the safety inspector today — we need to ${difficultyLevel === 'easy' ? 'go through a routine safety check together' : difficultyLevel === 'medium' ? 'review some findings from a recent audit' : 'investigate a serious near-miss incident that occurred yesterday'}. Shall we begin?`,
        },
        plc_automation: {
          name: 'PLC Programming & Automation',
          role: 'a production manager reporting automation system malfunctions',
          firstMessage: `Right, I'm James, your mentor. We've got an automation problem to solve — ${difficultyLevel === 'easy' ? 'a basic PLC I/O issue on the line' : difficultyLevel === 'medium' ? 'a communication fault between the PLC and SCADA' : 'a complex multi-controller system failure bringing production to a halt'}. Let's work through it.`,
        },
        industrial_maintenance: {
          name: 'Industrial Maintenance Planning',
          role: 'a maintenance supervisor discussing equipment reliability and breakdown prevention',
          firstMessage: `Afternoon, I'm James. We need to discuss ${difficultyLevel === 'easy' ? 'setting up a preventive maintenance schedule for a new pump' : difficultyLevel === 'medium' ? 'some recurring bearing failures that are costing us downtime' : 'a critical reliability issue — we\'ve had three unplanned shutdowns this month'}. Where would you start?`,
        },
        advanced_troubleshooting: {
          name: 'Advanced Multi-System Troubleshooting',
          role: 'a plant engineer dealing with a complex fault spanning multiple systems',
          firstMessage: `James here. We've got a tricky one today — a ${difficultyLevel === 'easy' ? 'fault that\'s affecting one of our production lines' : difficultyLevel === 'medium' ? 'problem that seems to involve both the electrical and mechanical systems' : 'cascade failure across multiple interconnected systems'}. This will test your diagnostic skills. Ready?`,
        },
        motor_controls: {
          name: 'Motor Controls & Drives',
          role: 'a plant operator reporting motor control issues or an engineer commissioning a new drive',
          firstMessage: `Good afternoon, I'm James. We've got a motor issue to sort out — ${difficultyLevel === 'easy' ? 'a basic overload trip on one of the pumps' : difficultyLevel === 'medium' ? 'a VFD that\'s throwing intermittent fault codes' : 'a critical motor failure on the main production line that needs root cause analysis'}. Talk me through your approach.`,
        },
        bms_systems: {
          name: 'Building Management Systems',
          role: 'a building services engineer dealing with BMS integration issues',
          firstMessage: `Right then, I'm James. We've got a BMS issue — ${difficultyLevel === 'easy' ? 'a sensor reading that doesn\'t look right' : difficultyLevel === 'medium' ? 'some integration problems between the BMS and the HVAC controllers' : 'a complete BMS communication breakdown across the whole building'}. Let's diagnose it together.`,
        },
      };

      const scenario = scenarioLabels[scenarioType] || scenarioLabels.hvac_systems;

      // Start ElevenLabs conversation with scenario context via dynamic variables
      // Note: overrides.agent.firstMessage requires "Allow overrides" enabled in agent Security settings
      // Dynamic variables work without security changes as long as {{var}} placeholders exist in the prompt
      // Use WebRTC with agentId for stable, high-quality audio (echo cancellation + noise removal)
      const conversationId = await conversation.startSession({
        agentId,
        connectionType: 'webrtc',
        dynamicVariables: {
          scenario_type: topicTitle || scenario.name,
          difficulty: difficultyLevel,
          mentor_role: scenario.role,
          course_context: courseContext || '',
          custom_instructions: topicSystemPrompt || '',
        },
      });

      setCurrentConversationId(conversationId);
      console.log('[LiveClientCall] Started conversation:', conversationId);
    } catch (err) {
      console.error('[LiveClientCall] Failed to start call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start session');
      setCallStatus('idle');
    }
  }, [conversation]);

  // End session - uses the same backend endpoint as voice-training
  const handleEndCall = useCallback(async () => {
    try {
      setCallStatus('ending');
      await conversation.endSession();
      // Wait for ElevenLabs to process the conversation (transcript needs time)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      if (currentConversationId) {
        setCallStatus('analyzing');

        const token = getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/elevenlabs/conversations/${currentConversationId}/save`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[LiveClientCall] Save error:', response.status, errorData);
          throw new Error(errorData.message || errorData.error || `Failed to save session (${response.status})`);
        }

        const result = await response.json();
        setAnalysis(result.analysis);
        setCallStatus('complete');
      } else {
        setCallStatus('idle');
      }
    } catch (err) {
      console.error('[LiveClientCall] Failed to end call:', err);
      setError(err instanceof Error ? err.message : 'Failed to save session');
      setCallStatus('idle');
    }
  }, [conversation, currentConversationId]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // View full report
  const handleViewReport = () => {
    router.push('/reports');
  };

  // New session
  const handleNewSession = () => {
    setCallStatus('idle');
    setAnalysis(null);
    setCurrentConversationId(null);
    setCallDuration(0);
    setError(null);
  };

  // ============ RENDER ============

  // Setup Required
  if (callStatus === 'setup_required') {
    return (
      <Card className="border-yellow-200 bg-yellow-50/30">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-yellow-700">ElevenLabs Setup Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600 text-center">
            To use live voice sessions, ElevenLabs Agent must be configured.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              Back
            </Button>
            <Button onClick={handleNewSession}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Complete with Analysis
  if (callStatus === 'complete' && analysis) {
    return (
      <div className="space-y-6">
        {/* Overall Score */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <Award className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-slate-900">Professional Performance Review</CardTitle>
            <p className="text-slate-500">Learning session with AI Mentor</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className={cn("text-6xl font-bold mb-2", getScoreColor(analysis.overallScore))}>
              {analysis.overallScore}%
            </div>
            <p className="text-slate-600">{analysis.summary}</p>
          </CardContent>
        </Card>

        {/* Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Detailed Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'opening', label: 'Introduction', score: analysis.breakdown.opening },
                { key: 'needsDiscovery', label: 'Knowledge Depth', score: analysis.breakdown.needsDiscovery },
                { key: 'objectionHandling', label: 'Problem Solving', score: analysis.breakdown.objectionHandling },
                { key: 'persuasion', label: 'Critical Thinking', score: analysis.breakdown.persuasion },
                { key: 'closing', label: 'Practical Application', score: analysis.breakdown.closing },
                { key: 'communication', label: 'Technical Communication', score: analysis.breakdown.communication },
              ].map(({ key, label, score }) => (
                <div key={key} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className={cn("font-bold text-sm", getScoreColor(score))}>{score}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", getScoreBg(score))}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.strengths.map((item, i) => (
                  <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-red-700">
                <XCircle className="h-5 w-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.weaknesses.map((item, i) => (
                  <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Improvements */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <Lightbulb className="h-5 w-5" />
              Suggestions for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.improvements.map((item, i) => (
                <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            Back to Topics
          </Button>
          <Button onClick={handleNewSession} variant="secondary">
            New Session
          </Button>
          <Button onClick={handleViewReport}>
            View Full Report
          </Button>
        </div>
      </div>
    );
  }

  // Idle - Start Session
  if (callStatus === 'idle') {
    return (
      <Card className="border-primary/20">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
            <Phone className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl text-foreground">Live Mentor Session</CardTitle>
          <p className="text-muted-foreground">
            Practice with an AI learning mentor in a live voice session
          </p>
          <Badge className="mt-2 bg-amber-100 text-amber-700 border-amber-200">
            {scenarioType.replace(/_/g, ' ')} - {difficultyLevel}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-xl border">
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                Real-time voice conversation with AI mentor
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                Instant responses from the AI learning mentor
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                Performance evaluation at the end of the session
              </li>
            </ul>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              Back
            </Button>
            <Button
              size="lg"
              onClick={handleStartCall}
              className="px-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Phone className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
              Start Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Connecting
  if (callStatus === 'connecting') {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-foreground">Connecting...</p>
          <p className="text-sm text-muted-foreground">Setting up the voice session</p>
        </CardContent>
      </Card>
    );
  }

  // Analyzing
  if (callStatus === 'analyzing') {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-foreground">Analyzing performance...</p>
          <p className="text-sm text-muted-foreground">Evaluating your learning skills</p>
        </CardContent>
      </Card>
    );
  }

  // Ending
  if (callStatus === 'ending') {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-lg text-foreground">Ending session...</p>
        </CardContent>
      </Card>
    );
  }

  // Active Session
  return (
    <Card className="border-green-200">
      <CardContent className="py-8">
        <div className="flex flex-col items-center space-y-8">
          {/* Session Visual */}
          <div className="relative w-48 h-48 rounded-full flex items-center justify-center bg-green-500/20 animate-pulse">
            <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
            <div className="absolute inset-4 rounded-full bg-green-500/20 animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600">
              <Mic className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Status */}
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground">Session in Progress</p>
            <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-3xl font-mono text-green-600">{formatDuration(callDuration)}</span>
            </div>
          </div>

          {/* Speaking Indicator */}
          {conversation.isSpeaking && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
              Mentor is speaking...
            </div>
          )}

          {/* End Session Button */}
          <Button
            size="lg"
            variant="destructive"
            onClick={handleEndCall}
            className="px-8"
          >
            <PhoneOff className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
            End Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default LiveClientCall;
