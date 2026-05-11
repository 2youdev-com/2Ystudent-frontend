'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSimulation } from '@/hooks/useSimulation';
import { SimulationChat } from '@/components/simulation/SimulationChat';
import { LiveClientCall } from '@/components/simulation/LiveClientCall';
import { ResultsSummary } from '@/components/simulation/ResultsSummary';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDiagnosticStore } from '@/stores/diagnostic.store';
import { cn } from '@/lib/utils';
import type { SimulationScenarioType, DifficultyLevel } from '@/types';
import { MessageSquare, Play, ArrowLeft, ArrowRight, Phone, X, Loader2, Brain, Sparkles, ClipboardCheck, BookOpen } from 'lucide-react';

// Dynamic topic from API
interface TopicCourse {
  id: string;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  objectivesEn?: string;
  objectivesAr?: string;
  category?: string;
  difficulty?: string;
  thumbnailUrl?: string;
  lectures?: { id: string; titleEn: string; titleAr?: string; descriptionEn?: string; descriptionAr?: string }[];
}

interface SimulationTopicData {
  id: string;
  title: string;
  description: string | null;
  scenarioType: string;
  systemPrompt: string | null;
  courseId: string | null;
  course: TopicCourse | null;
  isActive: boolean;
  sortOrder: number;
}

type SimulationMode = 'chat' | 'voice' | null;

// Type for session data passed to ResultsSummary
interface SessionData {
  sessionId: string;
  studentId: string;
  studentName?: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  scenarioType: string;
  difficultyLevel: string;
  mentorProfile: {
    name: string;
    personality: string;
    background: string;
    specialty: string;
  };
  conversationTurns: Array<{
    speaker: 'student' | 'client';
    message: string;
    timestamp: Date;
  }>;
}

export default function SimulationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const diagnosticStore = useDiagnosticStore();
  const isDiagnosticMode = searchParams.get('diagnostic') === 'true';
  const diagnosticAutoStarted = useRef(false);
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenarioType | null>(
    isDiagnosticMode ? 'safety_compliance' : null
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [simulationMode, setSimulationMode] = useState<SimulationMode>(null);

  // Dynamic topics from API
  const [dynamicTopics, setDynamicTopics] = useState<SimulationTopicData[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);

  const getAuthToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const directToken = localStorage.getItem('auth_token');
      if (directToken) return directToken;
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed?.state?.token || null;
      }
    } catch { return null; }
    return null;
  }, []);

  // Fetch topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const token = getAuthToken();
        if (!token) { setTopicsLoading(false); return; }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/simulation-topics/student`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setDynamicTopics(data.topics || []);
        }
      } catch (err) {
        console.error('Error fetching simulation topics:', err);
      } finally {
        setTopicsLoading(false);
      }
    };
    fetchTopics();
  }, [getAuthToken]);

  // Build scenarios from dynamic topics (fallback to localized if no topics)
  const scenarios: { type: SimulationScenarioType; title: string; description: string }[] = dynamicTopics.length > 0
    ? dynamicTopics.map((topic) => ({
        type: topic.scenarioType as SimulationScenarioType,
        title: topic.title,
        description: topic.description || '',
      }))
    : [
        { type: 'hvac_systems', title: t.simulations.scenarios.propertyShowing, description: t.simulations.scenarioDescriptions.propertyShowing },
        { type: 'electrical_systems', title: t.simulations.scenarios.priceNegotiation, description: t.simulations.scenarioDescriptions.priceNegotiation },
        { type: 'safety_compliance', title: t.simulations.scenarios.objectionHandling, description: t.simulations.scenarioDescriptions.objectionHandling },
        { type: 'plc_automation', title: t.simulations.scenarios.firstContact, description: t.simulations.scenarioDescriptions.firstContact },
        { type: 'industrial_maintenance', title: t.simulations.scenarios.closingDeal, description: t.simulations.scenarioDescriptions.closingDeal },
        { type: 'advanced_troubleshooting', title: t.simulations.scenarios.difficultClient, description: t.simulations.scenarioDescriptions.difficultClient },
      ];

  // Get selected topic data for passing to LiveClientCall
  const selectedTopicData = dynamicTopics.find((t) => t.scenarioType === selectedScenario);

  // Build course context string for the selected topic
  const buildCourseContext = (): string => {
    if (!selectedTopicData?.course) return '';
    const course = selectedTopicData.course;
    const parts: string[] = [];
    parts.push(`Course: ${course.titleEn}`);
    if (course.descriptionEn) parts.push(`Description: ${course.descriptionEn.substring(0, 200)}`);
    if (course.lectures && course.lectures.length > 0) {
      const lessonNames = course.lectures.slice(0, 5).map((l) => l.titleEn).join(', ');
      parts.push(`Lessons: ${lessonNames}`);
    }
    try {
      const objectives = JSON.parse(course.objectivesEn || '[]');
      if (Array.isArray(objectives) && objectives.length > 0) {
        parts.push(`Objectives: ${objectives.slice(0, 5).join(', ')}`);
      }
    } catch {}
    return parts.join('. ');
  };

  // Localized difficulties
  const difficulties: { level: DifficultyLevel; label: string; color: string }[] = [
    { level: 'easy', label: t.simulations.difficulty.easy, color: 'bg-success/10 text-success border-success/20' },
    { level: 'medium', label: t.simulations.difficulty.medium, color: 'bg-warning/10 text-warning border-warning/20' },
    { level: 'hard', label: t.simulations.difficulty.hard, color: 'bg-destructive/10 text-destructive border-destructive/20' },
  ];

  const {
    status,
    sessionId,
    analysis,
    clientPersona,
    mentorProfile,
    messages,
    elapsedTimeSeconds,
    startSimulation,
    sendMessage,
    endSimulation,
    reset,
  } = useSimulation();

  // Track session start time
  const sessionStartTimeRef = useRef<string>(new Date().toISOString());

  // Auto-start chat mode in diagnostic mode
  useEffect(() => {
    if (isDiagnosticMode && !diagnosticAutoStarted.current && status === 'idle') {
      diagnosticAutoStarted.current = true;
      setSimulationMode('chat');
      sessionStartTimeRef.current = new Date().toISOString();
      startSimulation({
        scenarioType: 'safety_compliance',
        difficultyLevel: 'medium',
        recordSession: false,
      });
    }
  }, [isDiagnosticMode, status, startSimulation]);

  const handleStartClick = () => {
    if (!selectedScenario) return;
    setShowModeSelector(true);
  };

  const handleModeSelect = async (mode: SimulationMode) => {
    setSimulationMode(mode);
    setShowModeSelector(false);

    if (mode === 'chat') {
      sessionStartTimeRef.current = new Date().toISOString();
      await startSimulation({
        scenarioType: selectedScenario!,
        difficultyLevel: selectedDifficulty,
        recordSession: false,
      });
    }
  };

  // Build session data for PDF export
  const buildSessionData = (): SessionData | undefined => {
    const persona = mentorProfile || clientPersona;
    if (!sessionId || !persona || !selectedScenario) return undefined;

    return {
      sessionId,
      studentId: 'current-user', // This would come from auth context in production
      studentName: undefined,
      startTime: sessionStartTimeRef.current,
      endTime: new Date().toISOString(),
      durationSeconds: elapsedTimeSeconds,
      scenarioType: selectedScenario,
      difficultyLevel: selectedDifficulty,
      mentorProfile: {
        name: persona.name,
        personality: persona.personality,
        background: persona.background,
        specialty: persona.specialty,
      },
      conversationTurns: messages.map(m => ({
        speaker: m.speaker,
        message: m.message,
        timestamp: m.timestamp,
      })),
    };
  };

  const handleViewFullReport = () => {
    router.push('/reports');
  };

  const handlePracticeAgain = () => {
    reset();
    setSelectedScenario(null);
    setSimulationMode(null);
  };

  const handleVoiceCallEnd = () => {
    reset();
    setSimulationMode(null);
  };

  const BackArrow = ArrowLeft;

  // Analyzing state - show loading indicator
  if (status === 'analyzing' || status === 'ending') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            {/* Animated AI Brain Icon */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-pulse">
                <Brain className="h-12 w-12 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-yellow-500 animate-bounce" />
              </div>
              <div className="absolute -bottom-1 -left-1">
                <div className="w-4 h-4 rounded-full bg-primary animate-ping" />
              </div>
            </div>

            {/* Loading Text */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                Analyzing Discussion...
              </h3>
              <p className="text-muted-foreground max-w-md">
                AI is analyzing your performance and preparing a comprehensive evaluation. Please wait a moment.
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                This may take a few seconds...
              </span>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">
                  Analyzing dialogue
                </span>
              </div>
              <div className="w-8 h-0.5 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/50 animate-pulse" />
                <span className="text-xs text-muted-foreground">
                  Preparing evaluation
                </span>
              </div>
              <div className="w-8 h-0.5 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="text-xs text-muted-foreground">
                  Final results
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'completed' && analysis) {
    // Diagnostic mode: store session ID and redirect back to assessment
    if (isDiagnosticMode && sessionId) {
      return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          {/* Diagnostic banner */}
          <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-primary">
                {t.diagnostic.stepOf} 1/2: {t.diagnostic.step1Title}
              </p>
              <p className="text-xs text-muted-foreground">
                Text discussion completed successfully!
              </p>
            </div>
          </div>
          <ResultsSummary
            analysis={analysis}
            onViewFullReport={() => {}}
            onPracticeAgain={() => {}}
            sessionData={buildSessionData()}
          />
          <div className="mt-6 flex justify-center">
            <Button
              className="btn-gradient h-12 px-8 text-lg"
              onClick={() => {
                diagnosticStore.setChatComplete(sessionId);
                router.push('/assessment');
              }}
            >
              {t.diagnostic.continueAssessment}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={handlePracticeAgain}>
            <BackArrow className="h-4 w-4 mr-2" />
            {t.simulations.backToScenarios}
          </Button>
        </div>
        <ResultsSummary
          analysis={analysis}
          onViewFullReport={handleViewFullReport}
          onPracticeAgain={handlePracticeAgain}
          sessionData={buildSessionData()}
        />
      </div>
    );
  }

  // Voice Call Mode - Uses the existing ElevenLabs real-time call system
  if (simulationMode === 'voice' && selectedScenario) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <LiveClientCall
          scenarioType={selectedScenario}
          difficultyLevel={selectedDifficulty}
          topicTitle={selectedTopicData?.title}
          topicSystemPrompt={selectedTopicData?.systemPrompt || undefined}
          courseContext={buildCourseContext() || undefined}
          onEnd={handleVoiceCallEnd}
          onBack={() => {
            setSimulationMode(null);
          }}
        />
      </div>
    );
  }

  // Text Discussion Mode - also show on 'error' status to allow retry
  if ((status === 'ready' || status === 'in_progress' || status === 'error') && simulationMode === 'chat') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {isDiagnosticMode && (
          <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm font-medium text-primary">
              {t.diagnostic.stepOf} 1/2: {t.diagnostic.step1Title}
            </p>
          </div>
        )}
        <SimulationChat
          onSendMessage={sendMessage}
          onEndSimulation={endSimulation}
          isDiagnosticMode={isDiagnosticMode}
        />
      </div>
    );
  }

  // Mode Selection Modal
  const ModeSelector = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <Card className="w-full max-w-md mx-4 animate-slide-up">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => setShowModeSelector(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-center text-foreground">{t.simulations.chooseMode}</CardTitle>
          <CardDescription className="text-center">
            {t.simulations.selectModeDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Mode */}
          <button
            onClick={() => handleModeSelect('chat')}
            className="w-full p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-lg text-foreground">{t.simulations.chatMode}</h3>
                <p className="text-sm text-muted-foreground">{t.simulations.chatModeDescription}</p>
              </div>
            </div>
          </button>

          {/* Voice Mode */}
          <button
            onClick={() => handleModeSelect('voice')}
            className="w-full p-6 rounded-xl border-2 border-border hover:border-success hover:bg-success/5 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                <Phone className="h-7 w-7 text-success" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-lg text-foreground">{t.simulations.voiceMode}</h3>
                <p className="text-sm text-muted-foreground">{t.simulations.voiceModeDescription}</p>
              </div>
            </div>
          </button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">{t.simulations.title}</h1>
        <p className="text-muted-foreground">
          {t.simulations.subtitle}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-foreground">{t.simulations.chooseScenario}</h2>
          {topicsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {scenarios.map((scenario) => {
                const topicData = dynamicTopics.find((t) => t.scenarioType === scenario.type);
                return (
                  <Card
                    key={scenario.type}
                    className={cn(
                      "cursor-pointer transition-all card-hover",
                      selectedScenario === scenario.type && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedScenario(scenario.type as SimulationScenarioType)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-foreground">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        {scenario.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{scenario.description}</p>
                      {topicData?.course && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-blue-400" />
                          <span className="text-xs text-blue-400">{topicData.course.titleEn}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-foreground">{t.simulations.startSimulation}</CardTitle>
              <CardDescription>
                {t.simulations.configureSession}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">{t.simulations.difficultyLevel}</label>
                <div className="flex gap-2 flex-wrap">
                  {difficulties.map((diff) => (
                    <Badge
                      key={diff.level}
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedDifficulty === diff.level ? diff.color : "hover:bg-muted"
                      )}
                      onClick={() => setSelectedDifficulty(diff.level)}
                    >
                      {diff.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedScenario && (
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm font-medium text-foreground">{t.simulations.selected}:</p>
                  <p className="text-sm text-muted-foreground">
                    {scenarios.find(s => s.type === selectedScenario)?.title} - {difficulties.find(d => d.level === selectedDifficulty)?.label}
                  </p>
                </div>
              )}

              <Button
                className="w-full btn-gradient"
                disabled={!selectedScenario || status === 'initializing'}
                onClick={handleStartClick}
              >
                <Play className="h-4 w-4 mr-2" />
                {status === 'initializing' ? t.simulations.starting : t.simulations.startSimulation}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mode Selection Modal */}
      {showModeSelector && <ModeSelector />}
    </div>
  );
}
