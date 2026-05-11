'use client';

/**
 * Voice Sessions Page
 *
 * Real-time voice session training using ElevenLabs Conversational AI.
 * The student interacts with an AI Mentor for professional skills education.
 */

import { useCallback, useState, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Phone, PhoneOff, Mic, ExternalLink, RefreshCw, SkipForward, ClipboardCheck, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { studentCoursesApi, CourseAIContextResponse, Course } from '@/lib/api/trainee-courses.api';
import { useDiagnosticStore } from '@/stores/diagnostic.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SaudiAvatar } from '@/components/ui/SaudiAvatar';
import { cn } from '@/lib/utils';

// Helper function to get auth token from all possible sources
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const directToken = localStorage.getItem('auth_token');
    if (directToken) {
      return directToken;
    }

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
        console.error('[VoiceTraining] Failed to parse auth-storage:', e);
      }
    }
  }

  return null;
}

// Error translation helper
function translateError(error: unknown): string {
  const errorString = String(error).toLowerCase();

  // Microphone permission errors
  if (errorString.includes('permission denied') ||
      errorString.includes('notallowederror') ||
      errorString.includes('not allowed')) {
    return 'Microphone access denied. Please allow microphone access in your browser settings and try again.';
  }

  if (errorString.includes('permission') && errorString.includes('microphone')) {
    return 'Please allow microphone access to start voice sessions.';
  }

  // Device not found
  if (errorString.includes('notfounderror') ||
      errorString.includes('no microphone') ||
      errorString.includes('device not found')) {
    return 'No microphone found. Please make sure a microphone is connected to your device.';
  }

  // Device in use
  if (errorString.includes('notreadableerror') ||
      errorString.includes('device in use') ||
      errorString.includes('could not start')) {
    return 'Microphone is currently in use by another application. Please close other apps and try again.';
  }

  // Connection errors
  if (errorString.includes('network') ||
      errorString.includes('connection') ||
      errorString.includes('websocket')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }

  // Timeout
  if (errorString.includes('timeout')) {
    return 'Connection timed out. Please try again.';
  }

  // HTTPS required
  if (errorString.includes('secure context') ||
      errorString.includes('https')) {
    return 'Voice sessions require a secure connection (HTTPS). Please access the site via HTTPS.';
  }

  // Generic browser support
  if (errorString.includes('not supported') ||
      errorString.includes('notsupportederror')) {
    return 'Your browser does not support voice sessions. Please use Chrome, Firefox, or Safari.';
  }

  // Default - show original error with prefix
  return `An error occurred: ${error}`;
}

// Types
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
  transcriptHighlights: {
    good: string[];
    needsWork: string[];
  };
}

interface SavedSession {
  sessionId: string;
  conversationId: string;
  analysis: PerformanceAnalysis;
}

type CallStatus = 'idle' | 'connecting' | 'active' | 'ending' | 'analyzing' | 'complete' | 'setup_required';

// Setup Instructions Component
function SetupInstructions({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
        <span>⚠️</span> ElevenLabs Setup Required
      </h2>
      <p className="text-muted-foreground mb-4">
        To use voice sessions, you need to create an Agent in ElevenLabs:
      </p>

      <div className="space-y-4 text-sm">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-bold text-foreground mb-2">Step 1: Open ElevenLabs Conversational AI</h3>
          <a
            href="https://elevenlabs.io/app/conversational-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            elevenlabs.io/app/conversational-ai
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-bold text-foreground mb-2">Step 2: Create a New Agent</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ms-4">
            <li>Click &quot;Create Agent&quot; → Choose &quot;Blank Template&quot;</li>
            <li>Agent name: &quot;Engineering Mentor&quot;</li>
            <li>Language: English</li>
            <li>Voice: Choose a British English voice (e.g. &quot;Burt&quot;)</li>
            <li>First message: &quot;Good afternoon. I&apos;m James, your engineering mentor. Right then, I&apos;ve got a scenario lined up for us today — shall we crack on?&quot;</li>
          </ul>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-bold text-foreground mb-2">Step 3: Add System Prompt</h3>
          <p className="text-xs text-muted-foreground mb-2">Set the agent as a British engineering mentor who covers HVAC, electrical systems, PLC &amp; automation, safety compliance, industrial maintenance, and motor controls. The agent should use scenario-based training, ask one question at a time, and keep responses short for natural voice flow.</p>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-bold text-foreground mb-2">Step 4: Copy Agent ID</h3>
          <p className="text-muted-foreground">After saving, copy the Agent ID from the URL or settings</p>
          <p className="text-xs text-muted-foreground mt-1">It will look something like: <code className="bg-muted px-1 rounded">pR7...xyz</code></p>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-bold text-foreground mb-2">Step 5: Add ID to Settings</h3>
          <p className="text-muted-foreground">In the file <code className="bg-muted px-1 rounded">backend/.env</code>:</p>
          <code className="block bg-card border border-border p-2 rounded mt-2 text-blue-600 dark:text-blue-400">
            ELEVENLABS_AGENT_ID=your-agent-id-here
          </code>
          <p className="text-xs text-muted-foreground mt-2">Then restart the server</p>
        </div>
      </div>

      <Button
        onClick={onRetry}
        className="mt-6 w-full"
        size="lg"
      >
        <RefreshCw className="w-4 h-4 me-2" />
        Try Again
      </Button>
    </Card>
  );
}

export default function VoiceTrainingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isRTL } = useLanguage();
  const diagnosticStore = useDiagnosticStore();
  const isDiagnosticMode = searchParams.get('diagnostic') === 'true';
  const courseId = searchParams.get('courseId');
  const [aiContext, setAiContext] = useState<CourseAIContextResponse | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);

  const storeToken = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    setError(null);
    const timer = setTimeout(() => {
      setIsHydrated(true);
      const token = storeToken || getAuthToken();
      console.log('[VoiceTraining] Hydration complete:', {
        storeToken: storeToken ? `${storeToken.substring(0, 20)}...` : 'null',
        helperToken: getAuthToken() ? 'present' : 'null',
        isAuthenticated,
      });

      if (!storeToken && typeof window !== 'undefined') {
        const localToken = getAuthToken();
        if (localToken) {
          localStorage.setItem('auth_token', localToken);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [storeToken, isAuthenticated]);

  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

  // Fetch course AI context when courseId is present
  useEffect(() => {
    if (courseId) {
      studentCoursesApi.getCourseAIContext(courseId)
        .then((ctx) => setAiContext(ctx))
        .catch((err) => console.error('[VoiceTraining] Failed to load course context:', err));
    } else {
      // No courseId = assessment mode — fetch available courses for topic rotation
      studentCoursesApi.listCourses()
        .then((res) => setAvailableCourses(res.courses || []))
        .catch((err) => console.error('[VoiceTraining] Failed to load courses:', err));
    }
  }, [courseId]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const conversation = useConversation({
    onConnect: () => {
      console.log('[VoiceTraining] Connected to ElevenLabs');
      setCallStatus('active');
      setError(null);
    },
    onDisconnect: () => {
      console.log('[VoiceTraining] Disconnected from ElevenLabs');
      if (callStatus === 'active') {
        setCallStatus('ending');
      }
    },
    onMessage: (message) => {
      console.log('[VoiceTraining] Message:', message);
    },
    onError: (error) => {
      console.error('[VoiceTraining] Error:', error);
      const errorMessage = translateError(error);
      setError(errorMessage);
      setCallStatus('idle');
    },
  });

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

  const handleStartCall = useCallback(async () => {
    try {
      setCallStatus('connecting');
      setError(null);
      setCallDuration(0);

      let token = storeToken || getAuthToken();

      if (!token) {
        throw new Error('Please log in first - authentication token not found');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/elevenlabs/signed-url`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: { message?: string; error?: string } = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        if (response.status === 401) {
          throw new Error('Authentication session expired - please log in again');
        }

        if (errorData.message?.includes('permission') || errorData.message?.includes('create agent')) {
          setCallStatus('setup_required');
          return;
        }
        throw new Error(errorData.message || errorData.error || `Failed to get connection URL (${response.status})`);
      }

      const { signedUrl, agentId } = await response.json();

      // Teaching agent for course-specific sessions, assessment agent for general
      const TEACHING_AGENT_ID = 'agent_9701kjqpkefsep0r3nqe4jj8ptvt';
      const activeAgentId = aiContext ? TEACHING_AGENT_ID : agentId;

      console.log('[VoiceTraining] Using agent:', activeAgentId, aiContext ? '(teaching mode)' : '(assessment mode)');

      // Build dynamic variables — course-specific when available, random topic for assessment
      let dynamicVariables: Record<string, string>;
      if (aiContext) {
        dynamicVariables = {
          scenario_type: aiContext.courseTitle,
          difficulty: aiContext.courseDifficulty,
          mentor_role: `a teaching mentor explaining ${aiContext.courseTitle}`,
          course_context: aiContext.contextString,
          custom_instructions: `Focus on: ${aiContext.lessonTopics}. Use the course knowledge base content when relevant.`,
        };
      } else if (availableCourses.length > 0) {
        // Pick a random course for assessment variety
        const randomCourse = availableCourses[Math.floor(Math.random() * availableCourses.length)];
        const title = randomCourse.titleEn || randomCourse.titleAr;
        const lessons = randomCourse.lessons?.map(l => l.titleEn || l.titleAr).join(', ') || '';
        dynamicVariables = {
          scenario_type: `${title} (${randomCourse.category})`,
          difficulty: randomCourse.difficulty || 'medium',
          mentor_role: `a senior engineering mentor assessing knowledge on ${title}`,
        };
      } else {
        dynamicVariables = {
          scenario_type: 'General Engineering Practice',
          difficulty: 'medium',
          mentor_role: 'a senior engineering mentor conducting a general training session',
        };
      }

      // Use WebRTC with agentId for stable, high-quality audio streaming
      const conversationId = await conversation.startSession({
        agentId: activeAgentId,
        connectionType: 'webrtc',
        dynamicVariables,
      });

      setCurrentConversationId(conversationId);
      console.log('[VoiceTraining] Started conversation:', conversationId);
    } catch (err) {
      console.error('[VoiceTraining] Failed to start call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
      setCallStatus('idle');
    }
  }, [conversation, storeToken]);

  const handleEndCall = useCallback(async () => {
    try {
      setCallStatus('ending');
      await conversation.endSession();

      if (currentConversationId) {
        setCallStatus('analyzing');

        const token = localStorage.getItem('auth_token');
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
          throw new Error(errorData.message || `Save failed: ${response.status}`);
        }

        const result: SavedSession = await response.json();
        setAnalysis(result.analysis);
        setSavedSessionId(result.sessionId);
        setCallStatus('complete');
      } else {
        setCallStatus('idle');
      }
    } catch (err) {
      console.error('[VoiceTraining] Failed to end call:', err);
      setError(err instanceof Error ? err.message : 'Failed to save session');
      setCallStatus('idle');
    }
  }, [conversation, currentConversationId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNewSession = () => {
    setCallStatus('idle');
    setAnalysis(null);
    setCurrentConversationId(null);
    setCallDuration(0);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Diagnostic Banner */}
        {isDiagnosticMode && (
          <div className="mb-6 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm font-medium text-primary">
              {t.diagnostic.stepOf} 2/2: {t.diagnostic.step2Title}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            {aiContext ? `Voice Practice: ${aiContext.courseTitle}` : 'Voice Learning Sessions'}
          </h1>
          <p className="text-muted-foreground">
            {aiContext
              ? `Practice ${aiContext.courseCategory} topics with your AI Mentor`
              : 'Practice with your AI Mentor to improve your professional skills'}
          </p>
          {courseId && (
            <a href={`/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2">
              <BookOpen className="w-3.5 h-3.5" />
              Back to Course
            </a>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-rose-100 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-rose-200 dark:bg-rose-900/50 rounded-full flex items-center justify-center">
                <span className="text-xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-rose-800 dark:text-rose-200 mb-1">Session Error</h3>
                <p className="text-rose-700 dark:text-rose-300 text-sm">{error}</p>
                {error.includes('Microphone') && (
                  <div className="mt-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mb-2">How to allow microphone access:</p>
                    <ol className="text-xs text-rose-600 dark:text-rose-400 space-y-1 list-decimal list-inside">
                      <li>Click the lock icon next to the site URL</li>
                      <li>Find &quot;Microphone&quot;</li>
                      <li>Change the setting to &quot;Allow&quot;</li>
                      <li>Reload the page and try again</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {callStatus === 'setup_required' ? (
          isDiagnosticMode ? (
            <Card className="p-6 max-w-md mx-auto text-center space-y-4">
              <p className="text-muted-foreground">
                Voice session is not available right now. You can skip this step.
              </p>
              <Button
                onClick={() => {
                  diagnosticStore.skipVoice();
                  router.push('/assessment');
                }}
                size="lg"
              >
                <SkipForward className="w-4 h-4 me-2" />
                {t.diagnostic.skipVoice}
              </Button>
            </Card>
          ) : (
            <SetupInstructions onRetry={handleNewSession} />
          )
        ) : callStatus === 'complete' && analysis ? (
          /* Analysis Results */
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="p-6 text-center">
              <h2 className="text-xl mb-4 text-foreground">Overall Score</h2>
              <div className="text-6xl font-bold mb-2" style={{
                color: analysis.overallScore >= 70 ? '#22c55e' :
                       analysis.overallScore >= 50 ? '#eab308' : '#ef4444'
              }}>
                {analysis.overallScore}%
              </div>
              <p className="text-muted-foreground">{analysis.summary}</p>
            </Card>

            {/* Breakdown Scores */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Detailed Performance Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'opening', label: 'Problem Solving', score: analysis.breakdown.opening },
                  { key: 'needsDiscovery', label: 'Technical Knowledge', score: analysis.breakdown.needsDiscovery },
                  { key: 'objectionHandling', label: 'Safety Awareness', score: analysis.breakdown.objectionHandling },
                  { key: 'persuasion', label: 'Critical Thinking', score: analysis.breakdown.persuasion },
                  { key: 'closing', label: 'Practical Application', score: analysis.breakdown.closing },
                  { key: 'communication', label: 'Communication', score: analysis.breakdown.communication },
                ].map(({ key, label, score }) => (
                  <div key={key} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-bold text-foreground">{score}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${score}%`,
                          backgroundColor: score >= 70 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                <h3 className="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-400">Strengths</h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, i) => (
                    <li key={i} className="text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-6 border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20">
                <h3 className="text-lg font-semibold mb-3 text-rose-700 dark:text-rose-400">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, i) => (
                    <li key={i} className="text-muted-foreground flex items-start gap-2">
                      <span className="text-rose-600 dark:text-rose-400">✗</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Improvements */}
            <Card className="p-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <h3 className="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-400">Suggestions for Improvement</h3>
              <ul className="space-y-2">
                {analysis.improvements.map((improvement, i) => (
                  <li key={i} className="text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">→</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              {isDiagnosticMode ? (
                <Button
                  size="lg"
                  className="btn-gradient px-8"
                  onClick={() => {
                    if (savedSessionId) {
                      diagnosticStore.setVoiceComplete(savedSessionId);
                    } else {
                      diagnosticStore.skipVoice();
                    }
                    router.push('/assessment');
                  }}
                >
                  {t.diagnostic.continueAssessment}
                  {isRTL ? <ArrowLeft className="w-4 h-4 mr-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              ) : (
                <>
                  <Button onClick={handleNewSession} size="lg">
                    <RefreshCw className="w-4 h-4 me-2" />
                    New Session
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/dashboard')} size="lg">
                    Back to Dashboard
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Call Interface */
          <div className="flex flex-col items-center justify-center space-y-8">
            {/* Call Visual */}
            <div className={cn(
              'relative w-48 h-48 rounded-full flex items-center justify-center',
              callStatus === 'active'
                ? 'bg-blue-100 dark:bg-blue-900/30 animate-pulse'
                : callStatus === 'connecting' || callStatus === 'ending' || callStatus === 'analyzing'
                ? 'bg-amber-100 dark:bg-amber-900/30 animate-pulse'
                : 'bg-muted'
            )}>
              {/* Ripple effect for active call */}
              {callStatus === 'active' && (
                <>
                  <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping" />
                  <div className="absolute inset-4 rounded-full bg-blue-500/20 animate-ping" style={{ animationDelay: '0.5s' }} />
                </>
              )}

              <div className={cn(
                'w-32 h-32 rounded-full flex items-center justify-center relative',
                callStatus === 'connecting' || callStatus === 'ending' || callStatus === 'analyzing' ? 'bg-amber-500' :
                'bg-transparent'
              )}>
                {callStatus === 'connecting' || callStatus === 'ending' || callStatus === 'analyzing' ? (
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <SaudiAvatar size="lg" isActive={callStatus === 'active'} />
                    {callStatus === 'active' && (
                      <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-2 shadow-lg border-2 border-background">
                        <Mic className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center">
              <p className="text-2xl font-semibold text-foreground">
                {callStatus === 'idle' && 'Ready to Start'}
                {callStatus === 'connecting' && 'Connecting...'}
                {callStatus === 'active' && 'Session in Progress'}
                {callStatus === 'ending' && 'Ending Session...'}
                {callStatus === 'analyzing' && 'Analyzing Performance...'}
              </p>
              {callStatus === 'active' && (
                <p className="text-4xl font-mono text-blue-600 dark:text-blue-400 mt-2">
                  {formatDuration(callDuration)}
                </p>
              )}
            </div>

            {/* Speaking indicator */}
            {callStatus === 'active' && conversation.isSpeaking && (
              <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full">
                <p className="text-blue-700 dark:text-blue-400">AI Mentor is speaking...</p>
              </div>
            )}

            {/* Instructions */}
            {callStatus === 'idle' && (
              <Card className="p-6 max-w-md text-center">
                <h3 className="font-semibold mb-2 text-foreground">Session Instructions</h3>
                {aiContext ? (
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>Your AI Mentor will discuss <span className="font-medium text-foreground">{aiContext.courseTitle}</span> topics with you.</p>
                    <p className="text-xs">Topics: {aiContext.lessonTopics}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Your AI Mentor will guide you through professional skills topics.
                    Respond as a professional engineer and demonstrate your technical knowledge.
                  </p>
                )}
              </Card>
            )}

            {/* Call Controls */}
            <div className="flex gap-4">
              {callStatus === 'idle' && (
                <>
                  <Button
                    onClick={handleStartCall}
                    disabled={!isHydrated}
                    size="lg"
                    className="px-8"
                  >
                    {!isHydrated ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Phone className="w-6 h-6 me-2" />
                    )}
                    {isHydrated ? 'Start Session' : 'Loading...'}
                  </Button>
                  {isDiagnosticMode && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        diagnosticStore.skipVoice();
                        router.push('/assessment');
                      }}
                    >
                      <SkipForward className="w-4 h-4 me-2" />
                      {t.diagnostic.skipVoice}
                    </Button>
                  )}
                </>
              )}

              {callStatus === 'active' && (
                <Button
                  onClick={handleEndCall}
                  variant="destructive"
                  size="lg"
                  className="px-8"
                >
                  <PhoneOff className="w-6 h-6 me-2" />
                  End Session
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
