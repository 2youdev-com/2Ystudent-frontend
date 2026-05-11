// Entity Types aligned with use-case-spec.md

export type StudentStatus = 'active' | 'inactive' | 'completed' | 'suspended';

/** @deprecated Use StudentStatus instead */
export type TraineeStatus = StudentStatus;

export interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  enrolledProgramIds: string[];
  currentLevelId: string | null;
  credentials: {
    passwordChangedAt: Date | null;
  };
  progress: {
    completedLectureIds: string[];
    completedAssessmentIds: string[];
    completedSimulationIds: string[];
  };
  metrics: {
    totalTimeOnPlatform: number;
    currentStreak: number;
    lastActiveAt: Date;
  };
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** @deprecated Use Student instead */
export type Trainee = Student;

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type CourseCategory = string;

export interface Course {
  id: string;
  programId: string;
  levelId: string;
  title: string;
  titleAr?: string | null;
  titleEn?: string | null;
  description: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  objectives: string[];
  lectures: Lecture[];
  prerequisites: string[];
  estimatedDurationMinutes: number;
  difficulty: CourseDifficulty;
  category: CourseCategory;
  isPublished: boolean;
  orderInLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lecture {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  durationMinutes: number;
  orderInCourse: number;
  triggerAssessmentOnComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  levels: Level[];
}

export interface Level {
  id: string;
  programId: string;
  title: string;
  orderInProgram: number;
}

export type SimulationScenarioType =
  | 'hvac_systems'
  | 'electrical_systems'
  | 'safety_compliance'
  | 'plc_automation'
  | 'industrial_maintenance'
  | 'advanced_troubleshooting'
  | 'motor_controls'
  | 'bms_systems';

/** @deprecated Legacy sales scenario type aliases — kept for backend compatibility */
export type LegacyScenarioType =
  | 'property_showing'
  | 'price_negotiation'
  | 'objection_handling'
  | 'first_contact'
  | 'closing_deal'
  | 'relationship_building'
  | 'difficult_client';

export type SimulationStatus = 'scheduled' | 'in_progress' | 'completed' | 'abandoned';
export type MentorPersonality = 'supportive' | 'challenging' | 'methodical' | 'socratic' | 'analytical';
/** @deprecated Use MentorPersonality instead */
export type ClientPersonality = MentorPersonality;
export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface MentorProfile {
  name: string;
  background: string;
  personality: MentorPersonality;
  specialty: string;
  experience: string[];
  teachingApproach: string[];
  focusAreas: string[];
}

/** @deprecated Use MentorProfile instead */
export type ClientPersona = MentorProfile;

export interface ConversationTurn {
  speaker: 'student' | 'client';
  message: string;
  timestamp: Date;
  sentiment: Sentiment | null;
  detectedIntent: string | null;
}

export interface KeyMoment {
  timestamp: Date;
  type: 'strength' | 'improvement_area' | 'missed_opportunity';
  description: string;
  recommendation: string | null;
}

export interface SimulationMetrics {
  overallScore: number;
  technicalCommunicationScore: number;
  knowledgeDepthScore: number;
  problemSolvingScore: number;
  safetyAwarenessScore: number;
  practicalApplicationScore: number;
  responseTimeAvgSeconds: number;
  keyMoments: KeyMoment[];
}

export interface SimulationSession {
  id: string;
  studentId: string;
  scenarioType: SimulationScenarioType;
  clientPersona: ClientPersona;
  status: SimulationStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  durationSeconds: number | null;
  transcript: ConversationTurn[];
  recordingUrl: string | null;
  metrics: SimulationMetrics | null;
  createdAt: Date;
}

export type ReportType = 'session' | 'level_summary' | 'program_completion';
export type ReportSourceType = 'ai_assessment' | 'simulation' | 'aggregated';

export interface ReportSummary {
  overallScore: number;
  percentileRank: number | null;
  trend: 'improving' | 'stable' | 'declining';
  timeSpentMinutes: number;
}

export interface SkillAssessment {
  skillName: string;
  category: 'knowledge' | 'technical_communication' | 'problem_solving' | 'safety' | 'practical';
  score: number;
  evidence: string[];
  benchmarkComparison: 'above' | 'at' | 'below';
}

export interface KnowledgeGap {
  topic: string;
  severity: 'critical' | 'moderate' | 'minor';
  description: string;
  relatedLectureIds: string[];
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'review_content' | 'practice_skill' | 'seek_support' | 'advance';
  title: string;
  description: string;
  actionableSteps: string[];
}

export interface CompetencyTrend {
  competencyName: string;
  scores: { date: Date; score: number }[];
  trend: 'improving' | 'stable' | 'declining';
}

export interface ProgressSummary {
  lecturesCompleted: number;
  lecturesTotal: number;
  assessmentsPassed: number;
  assessmentsTotal: number;
  simulationsCompleted: number;
  averageScore: number;
  competencyTrends: CompetencyTrend[];
}

export interface InteractionReport {
  id: string;
  studentId: string;
  reportType: ReportType;
  sourceType: ReportSourceType;
  sourceId: string;
  generatedAt: Date;
  summary: ReportSummary;
  strengths: SkillAssessment[];
  weaknesses: SkillAssessment[];
  knowledgeGaps: KnowledgeGap[];
  recommendations: Recommendation[];
  suggestedNextSteps: string[];
  progressSummary: ProgressSummary | null;
  createdAt: Date;
}
