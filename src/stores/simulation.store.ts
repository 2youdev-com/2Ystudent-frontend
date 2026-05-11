import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { MentorProfile, ConversationTurn, Sentiment } from '@/types/entities';
import type {
  ConversationState,
  SimulationOutcome,
  StartSimulationOutput,
  SimulationMessageOutput,
  EndSimulationOutput,
  SimulationAnalysisOutput,
} from '@/types/simulation.types';

type SimulationStatus = 'idle' | 'initializing' | 'ready' | 'in_progress' | 'ending' | 'analyzing' | 'completed' | 'error';

interface SimulationState {
  sessionId: string | null;
  status: SimulationStatus;
  mentorProfile: MentorProfile | null;
  /** @deprecated Use mentorProfile */
  clientPersona: MentorProfile | null;
  scenarioContext: string | null;
  conversationState: ConversationState | null;
  messages: ConversationTurn[];
  currentSentiment: Sentiment;
  turnNumber: number;
  elapsedTimeSeconds: number;
  hints: string[];
  outcome: SimulationOutcome | null;
  preliminaryScore: number | null;
  analysis: SimulationAnalysisOutput | null;
  isTyping: boolean;
  isSending: boolean;
  error: string | null;

  initializeSession: (data: StartSimulationOutput) => void;
  addStudentMessage: (message: string) => void;
  handleMentorResponse: (response: SimulationMessageOutput) => void;
  /** @deprecated Use handleMentorResponse */
  handleClientResponse: (response: SimulationMessageOutput) => void;
  completeSimulation: (result: EndSimulationOutput) => void;
  setAnalyzing: () => void;
  setAnalysis: (analysis: SimulationAnalysisOutput) => void;
  setTyping: (isTyping: boolean) => void;
  setSending: (isSending: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  status: 'idle' as SimulationStatus,
  mentorProfile: null,
  clientPersona: null,
  scenarioContext: null,
  conversationState: null,
  messages: [],
  currentSentiment: 'neutral' as Sentiment,
  turnNumber: 0,
  elapsedTimeSeconds: 0,
  hints: [],
  outcome: null,
  preliminaryScore: null,
  analysis: null,
  isTyping: false,
  isSending: false,
  error: null,
};

export const useSimulationStore = create<SimulationState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      initializeSession: (data: StartSimulationOutput) => {
        const mentor = data.mentorProfile || data.clientPersona || null;
        const initialMessage = data.initialMentorMessage || data.initialClientMessage || '';
        set({
          sessionId: data.sessionId,
          status: data.status === 'ready' ? 'ready' : 'initializing',
          mentorProfile: mentor,
          clientPersona: mentor, // backward compat
          scenarioContext: data.scenarioContext,
          conversationState: 'introduction',
          messages: [
            {
              speaker: 'client', // 'client' role = mentor in conversation
              message: initialMessage,
              timestamp: new Date(),
              sentiment: 'neutral',
              detectedIntent: null,
            },
          ],
          hints: data.tips,
          error: null,
        });
      },

      addStudentMessage: (message: string) => {
        const newMessage: ConversationTurn = {
          speaker: 'student',
          message,
          timestamp: new Date(),
          sentiment: null,
          detectedIntent: null,
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
          status: 'in_progress',
        }));
      },

      handleMentorResponse: (response: SimulationMessageOutput) => {
        const mentorMessage: ConversationTurn = {
          speaker: 'client', // 'client' role = mentor in conversation
          message: response.mentorResponse || response.clientResponse || '',
          timestamp: new Date(),
          sentiment: response.sentiment,
          detectedIntent: null,
        };
        set((state) => ({
          messages: [...state.messages, mentorMessage],
          currentSentiment: response.sentiment,
          conversationState: response.conversationState,
          turnNumber: response.turnNumber,
          elapsedTimeSeconds: response.elapsedTimeSeconds,
          hints: response.hints,
          isTyping: false,
        }));
      },

      // Backward compat alias
      handleClientResponse: (response: SimulationMessageOutput) => {
        get().handleMentorResponse(response);
      },

      completeSimulation: (result: EndSimulationOutput) => {
        set({
          status: 'ending',
          outcome: result.outcome,
          preliminaryScore: result.preliminaryScore,
        });
      },

      setAnalyzing: () => {
        set({ status: 'analyzing' });
      },

      setAnalysis: (analysis: SimulationAnalysisOutput) => {
        set({ analysis, status: 'completed' });
      },

      setTyping: (isTyping: boolean) => set({ isTyping }),
      setSending: (isSending: boolean) => set({ isSending }),
      setError: (error: string | null) => set({ error, status: error ? 'error' : get().status }),
      reset: () => set(initialState),
    }),
    { name: 'simulation-store' }
  )
);
