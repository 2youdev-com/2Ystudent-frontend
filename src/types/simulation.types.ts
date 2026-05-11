import type {
  SimulationScenarioType,
  MentorProfile,
  ClientPersona,
  Sentiment,
  KeyMoment,
  Recommendation,
} from './entities';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ConversationState = 'introduction' | 'assessment' | 'discussion' | 'deep_dive' | 'review' | 'ended';
export type SimulationOutcome =
  | 'mastery_demonstrated'
  | 'proficient'
  | 'developing'
  | 'needs_review'
  | 'needs_improvement'
  | 'incomplete';

// Input DTOs
export interface StartSimulationInput {
  scenarioType: SimulationScenarioType;
  difficultyLevel: DifficultyLevel;
  customPersonaConfig?: Partial<MentorProfile>;
  recordSession: boolean;
}

export interface SimulationMessageInput {
  sessionId: string;
  message: string;
  messageType: 'text' | 'voice_transcript';
}

export interface EndSimulationInput {
  sessionId: string;
  endReason: 'completed' | 'abandoned' | 'timeout' | 'error';
}

export interface AnalyzeSimulationInput {
  sessionId: string;
  includeDetailedTranscriptAnalysis: boolean;
  compareToHistory: boolean;
  generateRecommendations: boolean;
}

// Output DTOs
export interface StartSimulationOutput {
  sessionId: string;
  status: 'ready' | 'initializing';
  mentorProfile: MentorProfile;
  /** @deprecated Use mentorProfile */
  clientPersona?: ClientPersona;
  scenarioContext: string;
  initialMentorMessage: string;
  /** @deprecated Use initialMentorMessage */
  initialClientMessage?: string;
  estimatedDurationMinutes: number;
  tips: string[];
}

export interface SimulationMessageOutput {
  sessionId: string;
  mentorResponse: string;
  /** @deprecated Use mentorResponse */
  clientResponse?: string;
  sentiment: Sentiment;
  conversationState: ConversationState;
  hints: string[];
  turnNumber: number;
  elapsedTimeSeconds: number;
}

export interface EndSimulationOutput {
  sessionId: string;
  status: 'completed' | 'abandoned';
  totalDurationSeconds: number;
  turnCount: number;
  preliminaryScore: number;
  outcome: SimulationOutcome;
  nextSteps: string[];
}

export interface SkillScoreDetail {
  score: number;
  benchmark: number;
  trend: 'improving' | 'stable' | 'declining';
  evidence: string[];
  tips: string[];
}

export interface SimulationAnalysisOutput {
  sessionId: string;
  studentId: string;
  generatedAt: Date;
  overallPerformance: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    level?: number; // 1-5 engineering level
    summary: string;
  };
  skillScores: {
    technicalCommunication: SkillScoreDetail;
    knowledgeDepth: SkillScoreDetail;
    problemSolving: SkillScoreDetail;
    safetyAwareness: SkillScoreDetail;
    practicalApplication: SkillScoreDetail;
    criticalThinking: SkillScoreDetail;
  };
  conversationAnalysis: {
    talkTimeRatio: number;
    averageResponseTime: number;
    questionAsked: number;
    technicalAccuracy: number;
    depthOfReasoning: number;
  };
  highlights: KeyMoment[];
  improvementAreas: KeyMoment[];
  missedOpportunities: KeyMoment[];
  recommendations: Recommendation[];
  suggestedPracticeScenarios: SimulationScenarioType[];
  historicalComparison?: {
    previousAverageScore: number;
    improvement: number;
    consistentStrengths: string[];
    persistentWeaknesses: string[];
  };
}
