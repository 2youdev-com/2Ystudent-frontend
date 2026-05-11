import { apiClient } from './client';
import type {
  StartSimulationInput,
  StartSimulationOutput,
  SimulationMessageInput,
  SimulationMessageOutput,
  EndSimulationInput,
  EndSimulationOutput,
  AnalyzeSimulationInput,
  SimulationAnalysisOutput,
  ConversationState,
  SkillScoreDetail,
} from '@/types/simulation.types';
import type { SimulationSession, SimulationScenarioType, LegacyScenarioType } from '@/types/entities';

// ─── Scenario Type Mapping (Frontend ↔ Backend) ─────────────────────────────
// The backend still expects legacy sales-oriented scenario types.
// We map our engineering types to legacy types on outgoing requests,
// and reverse-map on incoming responses.

const engineeringToLegacy: Record<SimulationScenarioType, LegacyScenarioType> = {
  hvac_systems: 'property_showing',
  electrical_systems: 'price_negotiation',
  safety_compliance: 'objection_handling',
  plc_automation: 'first_contact',
  industrial_maintenance: 'closing_deal',
  advanced_troubleshooting: 'difficult_client',
  motor_controls: 'relationship_building',
  bms_systems: 'first_contact', // shares legacy slot with plc_automation
};

const legacyToEngineering: Record<LegacyScenarioType, SimulationScenarioType> = {
  property_showing: 'hvac_systems',
  price_negotiation: 'electrical_systems',
  objection_handling: 'safety_compliance',
  first_contact: 'plc_automation',
  closing_deal: 'industrial_maintenance',
  difficult_client: 'advanced_troubleshooting',
  relationship_building: 'motor_controls',
};

// ─── Conversation State Mapping ─────────────────────────────────────────────
// Backend may return legacy sales conversation states.

const legacyStateToNew: Record<string, ConversationState> = {
  // Backend's actual conversation states
  opening: 'introduction',
  discovery: 'assessment',
  presenting: 'discussion',
  negotiating: 'deep_dive',
  closing: 'review',
  // Alternate legacy names
  greeting: 'introduction',
  presentation: 'discussion',
  objection: 'deep_dive',
  negotiation_state: 'review',
  close: 'ended',
  follow_up: 'ended',
  // New states pass through
  introduction: 'introduction',
  assessment: 'assessment',
  discussion: 'discussion',
  deep_dive: 'deep_dive',
  review: 'review',
  ended: 'ended',
};

// ─── Skill Score Key Mapping ────────────────────────────────────────────────
// Backend may return legacy sales skill keys.

const legacySkillToNew: Record<string, string> = {
  communication: 'technicalCommunication',
  negotiation: 'knowledgeDepth',
  objectionHandling: 'problemSolving',
  closing: 'safetyAwareness',
  rapport: 'practicalApplication',
  needsAnalysis: 'criticalThinking',
  // New keys pass through
  technicalCommunication: 'technicalCommunication',
  knowledgeDepth: 'knowledgeDepth',
  problemSolving: 'problemSolving',
  safetyAwareness: 'safetyAwareness',
  practicalApplication: 'practicalApplication',
  criticalThinking: 'criticalThinking',
};

// ─── Response Normalization Helpers ─────────────────────────────────────────

function normalizeConversationState(state: string): ConversationState {
  return legacyStateToNew[state] || (state as ConversationState);
}

function normalizeScenarioType(type: string): SimulationScenarioType {
  // If it's already a new type, pass through
  if (type in engineeringToLegacy) return type as SimulationScenarioType;
  // If it's a legacy type, map to new
  return (legacyToEngineering as Record<string, SimulationScenarioType>)[type] || (type as SimulationScenarioType);
}

function normalizeSkillScores(
  scores: Record<string, SkillScoreDetail> | undefined
): Record<string, SkillScoreDetail> | undefined {
  if (!scores) return scores;
  const normalized: Record<string, SkillScoreDetail> = {};
  for (const [key, value] of Object.entries(scores)) {
    const newKey = legacySkillToNew[key] || key;
    normalized[newKey] = value;
  }
  return normalized;
}

function normalizeConversationAnalysis(
  analysis: Record<string, number> | undefined
): Record<string, number> | undefined {
  if (!analysis) return analysis;

  // Map legacy sales-oriented analysis keys to engineering keys
  const keyMap: Record<string, string> = {
    objectionRate: 'technicalAccuracy',
    closingAttempts: 'depthOfReasoning',
    // New keys pass through
    talkTimeRatio: 'talkTimeRatio',
    averageResponseTime: 'averageResponseTime',
    questionAsked: 'questionAsked',
    technicalAccuracy: 'technicalAccuracy',
    depthOfReasoning: 'depthOfReasoning',
  };

  const normalized: Record<string, number> = {};
  for (const [key, value] of Object.entries(analysis)) {
    const newKey = keyMap[key] || key;
    normalized[newKey] = value;
  }
  return normalized;
}

// ─── Start Simulation Response Normalization ────────────────────────────────

function normalizeStartOutput(raw: Record<string, unknown>): StartSimulationOutput {
  return {
    sessionId: raw.sessionId as string,
    status: raw.status as 'ready' | 'initializing',
    // Backend sends clientPersona; frontend expects mentorProfile
    mentorProfile: (raw.mentorProfile || raw.clientPersona) as StartSimulationOutput['mentorProfile'],
    clientPersona: (raw.clientPersona || raw.mentorProfile) as StartSimulationOutput['clientPersona'],
    scenarioContext: raw.scenarioContext as string,
    // Backend sends initialClientMessage; frontend expects initialMentorMessage
    initialMentorMessage: (raw.initialMentorMessage || raw.initialClientMessage || '') as string,
    initialClientMessage: (raw.initialClientMessage || raw.initialMentorMessage) as string,
    estimatedDurationMinutes: raw.estimatedDurationMinutes as number,
    tips: (raw.tips || []) as string[],
  };
}

// ─── Message Response Normalization ─────────────────────────────────────────

function normalizeMessageOutput(raw: Record<string, unknown>): SimulationMessageOutput {
  return {
    sessionId: raw.sessionId as string,
    // Backend sends clientResponse; frontend expects mentorResponse
    mentorResponse: (raw.mentorResponse || raw.clientResponse || '') as string,
    clientResponse: (raw.clientResponse || raw.mentorResponse) as string,
    sentiment: raw.sentiment as SimulationMessageOutput['sentiment'],
    conversationState: normalizeConversationState(raw.conversationState as string),
    hints: (raw.hints || []) as string[],
    turnNumber: raw.turnNumber as number,
    elapsedTimeSeconds: raw.elapsedTimeSeconds as number,
  };
}

// ─── Analysis Response Normalization ────────────────────────────────────────

function normalizeAnalysisOutput(raw: Record<string, unknown>): SimulationAnalysisOutput {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = raw as any;

  // Normalize skill score keys
  if (result.skillScores) {
    result.skillScores = normalizeSkillScores(result.skillScores);
  }

  // Ensure all 6 required skill score keys exist with defaults
  const defaultSkillScore: SkillScoreDetail = {
    score: 0,
    benchmark: 75,
    trend: 'stable' as const,
    evidence: [],
    tips: [],
  };
  const requiredSkills = [
    'technicalCommunication',
    'knowledgeDepth',
    'problemSolving',
    'safetyAwareness',
    'practicalApplication',
    'criticalThinking',
  ];
  if (!result.skillScores) {
    result.skillScores = {};
  }
  for (const skill of requiredSkills) {
    if (!result.skillScores[skill]) {
      result.skillScores[skill] = { ...defaultSkillScore };
    } else if (typeof result.skillScores[skill].score !== 'number') {
      // If score key exists but is malformed, fill in defaults
      result.skillScores[skill] = {
        ...defaultSkillScore,
        ...result.skillScores[skill],
        score: Number(result.skillScores[skill].score) || 0,
      };
    }
  }

  // Normalize conversation analysis keys
  if (result.conversationAnalysis) {
    result.conversationAnalysis = normalizeConversationAnalysis(result.conversationAnalysis);
  }

  // Ensure conversationAnalysis has all required keys with defaults
  if (!result.conversationAnalysis) {
    result.conversationAnalysis = {};
  }
  result.conversationAnalysis = {
    talkTimeRatio: 0,
    averageResponseTime: 0,
    questionAsked: 0,
    technicalAccuracy: 0,
    depthOfReasoning: 0,
    ...result.conversationAnalysis,
  };

  // Ensure overallPerformance has all required keys
  if (!result.overallPerformance) {
    result.overallPerformance = {
      score: 0,
      grade: 'F',
      summary: 'Analysis incomplete',
    };
  }

  return result as SimulationAnalysisOutput;
}

// ─── Session Normalization ──────────────────────────────────────────────────

function normalizeSession(raw: Record<string, unknown>): SimulationSession {
  const session = raw as unknown as SimulationSession;
  // Normalize the scenario type from legacy to engineering
  if (session.scenarioType) {
    session.scenarioType = normalizeScenarioType(session.scenarioType);
  }
  return session;
}

// ─── API Layer ──────────────────────────────────────────────────────────────

export const simulationApi = {
  start: async (input: StartSimulationInput): Promise<StartSimulationOutput> => {
    // Map engineering scenario type to legacy backend type
    const backendInput = {
      ...input,
      scenarioType: engineeringToLegacy[input.scenarioType] || input.scenarioType,
    };
    const raw = await apiClient.post<Record<string, unknown>>('/simulations/start', backendInput);
    return normalizeStartOutput(raw);
  },

  sendMessage: async (input: SimulationMessageInput): Promise<SimulationMessageOutput> => {
    const { sessionId, ...data } = input;
    const raw = await apiClient.post<Record<string, unknown>>(`/simulations/${sessionId}/message`, data);
    return normalizeMessageOutput(raw);
  },

  end: async (input: EndSimulationInput): Promise<EndSimulationOutput> => {
    const { sessionId, ...data } = input;
    return apiClient.post<EndSimulationOutput>(`/simulations/${sessionId}/end`, data);
  },

  getAnalysis: async (input: AnalyzeSimulationInput): Promise<SimulationAnalysisOutput> => {
    const { sessionId, ...params } = input;
    const raw = await apiClient.get<Record<string, unknown>>(`/simulations/${sessionId}/analysis`, {
      includeDetailedTranscriptAnalysis: String(params.includeDetailedTranscriptAnalysis),
      compareToHistory: String(params.compareToHistory),
      generateRecommendations: String(params.generateRecommendations),
    });
    return normalizeAnalysisOutput(raw);
  },

  getSession: async (sessionId: string): Promise<SimulationSession> => {
    const raw = await apiClient.get<Record<string, unknown>>(`/simulations/${sessionId}`);
    return normalizeSession(raw);
  },

  getHistory: async (limit = 10): Promise<SimulationSession[]> => {
    const rawList = await apiClient.get<Record<string, unknown>[]>('/simulations', { limit: String(limit) });
    return rawList.map(normalizeSession);
  },
};
