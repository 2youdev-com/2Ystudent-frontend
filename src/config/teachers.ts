/**
 * Teacher Configuration
 *
 * Shared configuration for the AI teacher personas used across 2YStudy.
 * Each teacher specializes in different professional domains.
 * All avatars are custom professional Saudi-style illustrations.
 */

export type TeacherName = 'ahmed' | 'noura' | 'anas' | 'abdullah' | 'firas';

export type TeacherPersonality = 'professional' | 'friendly' | 'wise' | 'challenging';

export interface TeacherConfig {
  name: TeacherName;
  displayName: { ar: string; en: string };
  description: { ar: string; en: string };
  shortDescription: { ar: string; en: string };
  initial: { ar: string; en: string };
  avatarUrl: string; // Avatar image URL
  gradient: string;
  bgLight: string;
  textColor: string;
  iconName: 'GraduationCap' | 'Target' | 'Brain' | 'Star';
  isAlwaysAvailable: boolean;
  personality: TeacherPersonality;
}

// Base URL for avatars (relative path works on all environments)
const AVATAR_BASE_URL = '/avatars';

export const TEACHERS: Record<TeacherName, TeacherConfig> = {
  ahmed: {
    name: 'ahmed',
    displayName: { ar: 'Alex', en: 'Alex' },
    description: {
      ar: 'Student Fundamentals — Patient and encouraging, explains core concepts simply',
      en: 'Student Fundamentals — Patient and encouraging, explains core concepts simply',
    },
    shortDescription: {
      ar: 'Fundamentals',
      en: 'Fundamentals',
    },
    initial: { ar: 'A', en: 'A' },
    // Friendly fundamentals teacher
    avatarUrl: `${AVATAR_BASE_URL}/ahmed.png`,
    gradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-500/10',
    textColor: 'text-blue-600',
    iconName: 'GraduationCap',
    isAlwaysAvailable: false,
    personality: 'friendly',
  },
  noura: {
    name: 'noura',
    displayName: { ar: 'Emily', en: 'Emily' },
    description: {
      ar: 'Systems & Strategy — Sharp and challenging with real-world professional scenarios',
      en: 'Systems & Strategy — Sharp and challenging with real-world professional scenarios',
    },
    shortDescription: {
      ar: 'Systems Strategy',
      en: 'Systems Strategy',
    },
    initial: { ar: 'E', en: 'E' },
    // Systems strategist teacher
    avatarUrl: `${AVATAR_BASE_URL}/noura.png`,
    gradient: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-500/10',
    textColor: 'text-purple-600',
    iconName: 'Target',
    isAlwaysAvailable: false,
    personality: 'challenging',
  },
  anas: {
    name: 'anas',
    displayName: { ar: 'James', en: 'James' },
    description: {
      ar: 'Senior Technical Coach — Elite expert, expects professional-level professional answers',
      en: 'Senior Technical Coach — Elite expert, expects professional-level professional answers',
    },
    shortDescription: {
      ar: 'Technical Coach',
      en: 'Technical Coach',
    },
    initial: { ar: 'J', en: 'J' },
    // Senior technical coach
    avatarUrl: `${AVATAR_BASE_URL}/anas.png`,
    gradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-500/10',
    textColor: 'text-blue-600',
    iconName: 'Brain',
    isAlwaysAvailable: false,
    personality: 'professional',
  },
  abdullah: {
    name: 'abdullah',
    displayName: { ar: 'Robert', en: 'Robert' },
    description: {
      ar: 'Growth Mentor — Wise and reflective, analyzes your performance data',
      en: 'Growth Mentor — Wise and reflective, analyzes your performance data',
    },
    shortDescription: {
      ar: 'Growth Mentor',
      en: 'Growth Mentor',
    },
    initial: { ar: 'R', en: 'R' },
    // Wise growth mentor
    avatarUrl: `${AVATAR_BASE_URL}/abdullah.png`,
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-500/10',
    textColor: 'text-amber-600',
    iconName: 'Star',
    isAlwaysAvailable: true,
    personality: 'wise',
  },
  firas: {
    name: 'firas',
    displayName: { ar: 'Chris', en: 'Chris' },
    description: {
      ar: 'Practical Application Coach — Advanced expert in hands-on professional and troubleshooting',
      en: 'Practical Application Coach — Advanced expert in hands-on professional and troubleshooting',
    },
    shortDescription: {
      ar: 'Practical Coach',
      en: 'Practical Coach',
    },
    initial: { ar: 'C', en: 'C' },
    // Practical professional coach
    avatarUrl: `${AVATAR_BASE_URL}/firas.webp`,
    gradient: 'from-cyan-500 to-cyan-600',
    bgLight: 'bg-cyan-500/10',
    textColor: 'text-cyan-600',
    iconName: 'Target',
    isAlwaysAvailable: false,
    personality: 'professional',
  },
};

export const TEACHER_LIST: TeacherConfig[] = Object.values(TEACHERS);
export const VALID_TEACHER_NAMES: TeacherName[] = ['ahmed', 'noura', 'anas', 'abdullah', 'firas'];
