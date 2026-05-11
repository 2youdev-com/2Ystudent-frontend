'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Language System for the Platform
 *
 * Provides:
 * - Global language state (Arabic/English)
 * - Complete translations for all UI text
 * - Language-specific configurations for STT, TTS, LLM
 * - RTL/LTR direction management
 */

export type Language = 'ar' | 'en';

interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  dir: 'rtl' | 'ltr';
  sttLocale: string;
  ttsVoice: string;
  ttsModel: string;
}

export const LANGUAGE_CONFIGS: Record<Language, LanguageConfig> = {
  ar: {
    code: 'ar',
    name: 'Arabic (Saudi)',
    nativeName: 'العربية',
    dir: 'rtl',
    sttLocale: 'ar-SA',
    ttsVoice: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_AR || 'mlvXFS1MP5qndOFkWz1M',
    ttsModel: 'eleven_multilingual_v2',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    sttLocale: 'en-US',
    ttsVoice: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_EN || 'mlvXFS1MP5qndOFkWz1M',
    ttsModel: 'eleven_turbo_v2_5',
  },
};

// Complete Translations Interface
interface Translations {
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    back: string;
    next: string;
    save: string;
    close: string;
    search: string;
    filter: string;
    all: string;
    none: string;
    view: string;
    edit: string;
    delete: string;
    create: string;
    submit: string;
    reset: string;
    continue: string;
    start: string;
    stop: string;
    pause: string;
    resume: string;
    retry: string;
    skip: string;
    finish: string;
    complete: string;
    incomplete: string;
    active: string;
    inactive: string;
    enabled: string;
    disabled: string;
    yes: string;
    no: string;
    or: string;
    and: string;
    minutes: string;
    hours: string;
    days: string;
    weeks: string;
    today: string;
    yesterday: string;
    noResults: string;
    showMore: string;
    showLess: string;
  };

  // Auth
  auth: {
    signIn: string;
    signUp: string;
    signOut: string;
    signingIn: string;
    login: string;
    register: string;
    forgotPassword: string;
    resetPassword: string;
    email: string;
    emailAddress: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    fullName: string;
    rememberMe: string;
    welcomeBack: string;
    continueJourney: string;
    createAccount: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    newToPlatform: string;
    termsAgree: string;
    termsOfService: string;
    privacyPolicy: string;
    loginSuccess: string;
    loginFailed: string;
    registerSuccess: string;
    invalidCredentials: string;
    passwordMismatch: string;
    passwordRequirements: string;
    emailRequired: string;
    passwordRequired: string;
    heroTitle: string;
    heroDescription: string;
    studentsCount: string;
    successRate: string;
    poweredBy: string;
    // Register page
    startJourney: string;
    joinThousands: string;
    createYourAccount: string;
    startTrainingJourney: string;
    creatingAccount: string;
    firstNamePlaceholder: string;
    lastNamePlaceholder: string;
    passwordStrong: string;
    confirmPasswordPlaceholder: string;
    freeTrialNoCreditCard: string;
    byCreatingAccount: string;
    // Benefits
    benefitAIPractice: string;
    benefitFeedback: string;
    benefitAnalytics: string;
    benefitOwnPace: string;
  };

  // Navigation
  nav: {
    dashboard: string;
    dashboardDesc: string;
    courses: string;
    coursesDesc: string;
    simulations: string;
    simulationsDesc: string;
    voicePractice: string;
    voicePracticeDesc: string;
    realtimeCall: string;
    realtimeCallDesc: string;
    aiTeacher: string;
    aiTeacherDesc: string;
    reports: string;
    reportsDesc: string;
    admin: string;
    settings: string;
    profile: string;
    help: string;
    home: string;
  };

  // Landing Page
  landing: {
    brandName: string;

    // Navigation
    nav: {
      features: string;
      howItWorks: string;
      testimonials: string;
      pricing: string;
      signIn: string;
      getStarted: string;
    };

    // Hero
    hero: {
      badge: string;
      titlePart1: string;
      titleHighlight: string;
      description: string;
      startFreeTrial: string;
      watchDemo: string;
      noCreditCard: string;
      freeTrial: string;
      cancelAnytime: string;
    };

    // Stats
    stats: {
      activeStudents: string;
      successRate: string;
      sessionsCompleted: string;
      userRating: string;
    };

    // Features
    features: {
      title: string;
      subtitle: string;
      aiSimulations: { title: string; description: string };
      voiceCalls: { title: string; description: string };
      analytics: { title: string; description: string };
      courses: { title: string; description: string };
      certifications: { title: string; description: string };
      bilingual: { title: string; description: string };
    };

    // How It Works
    howItWorks: {
      title: string;
      subtitle: string;
      step1: { title: string; description: string };
      step2: { title: string; description: string };
      step3: { title: string; description: string };
    };

    // Testimonials
    testimonials: {
      title: string;
      subtitle: string;
      items: Array<{
        quote: string;
        name: string;
        role: string;
        initials: string;
      }>;
    };

    // Pricing
    pricing: {
      title: string;
      subtitle: string;
      perMonth: string;
      mostPopular: string;
      getStarted: string;
      startTrial: string;
      contactSales: string;
      free: {
        name: string;
        description: string;
        price: string;
        features: string[];
      };
      pro: {
        name: string;
        description: string;
        price: string;
        features: string[];
      };
      enterprise: {
        name: string;
        description: string;
        price: string;
        features: string[];
      };
    };

    // CTA
    cta: {
      title: string;
      description: string;
      button: string;
    };

    // Footer
    footer: {
      description: string;
      product: string;
      company: string;
      legal: string;
      courses: string;
      simulations: string;
      about: string;
      blog: string;
      careers: string;
      contact: string;
      privacy: string;
      terms: string;
      cookies: string;
      allRightsReserved: string;
    };
  };

  // Diagnostic
  diagnostic: {
    assessmentNeeded: string;
    assessmentNeededDesc: string;
    runAssessment: string;
    skillProfile: string;
    overallScore: string;
    refresh: string;
    assessmentGateway: string;
    assessmentGatewayDesc: string;
    startAssessment: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    continueAssessment: string;
    skipVoice: string;
    generating: string;
    reportReady: string;
    continueToDashboard: string;
    recommendedForYou: string;
    basedOnAssessment: string;
    stepOf: string;
    evaluatorGenerating: string;
    assignedTeacher: string;
    detailedAnalysis: string;
    improvementPlan: string;
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
    overallNarrative: string;
    yourTeacher: string;
    weak: string;
    developing: string;
    competent: string;
    strong: string;
    excellent: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    subtitle: string;
    welcome: string;
    continueJourney: string;
    overallProgress: string;
    averageScore: string;
    currentStreak: string;
    timeInvested: string;
    thisWeek: string;
    acrossAssessments: string;
    keepItGoing: string;
    minutesTotal: string;
    days: string;
    continueLearning: string;
    pickUpWhereYouLeft: string;
    negotiationFundamentals: string;
    module3: string;
    complete: string;
    continueCourse: string;
    practiceSimulations: string;
    sharpenSkills: string;
    recommendedScenario: string;
    priceNegotiation: string;
    basedOnPerformance: string;
    startSimulation: string;
    voicePractice: string;
    practiceWithAI: string;
    realtimeConversation: string;
    voiceCallDescription: string;
    newFeature: string;
    startVoiceCall: string;
    yourProgress: string;
    viewDetailedAnalytics: string;
    simulations: string;
    courses: string;
    voiceCalls: string;
    avgScore: string;
    viewReports: string;
  };

  // Courses
  courses: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    allLevels: string;
    coursesAvailable: string;
    hours: string;
    minutes: string;
    categories: {
      fundamentals: string;
      hvac: string;
      electrical: string;
      plcAutomation: string;
      maintenance: string;
      safety: string;
    };
    difficulty: {
      beginner: string;
      intermediate: string;
      advanced: string;
    };
    noCourses: string;
    adjustFilters: string;
    startLearning: string;
    continueLearning: string;
    completed: string;
    inProgress: string;
    notStarted: string;
    lessons: string;
    duration: string;
    enrolled: string;
    progress: string;
    certificate: string;
    courseDetails: string;
    whatYouLearn: string;
    requirements: string;
    description: string;
    instructor: string;
    reviews: string;
    relatedCourses: string;
  };

  // Simulations
  simulations: {
    title: string;
    subtitle: string;
    chooseScenario: string;
    chooseMode: string;
    selectModeDescription: string;
    chatMode: string;
    voiceMode: string;
    chatModeDescription: string;
    voiceModeDescription: string;
    voiceCallInArabic: string;
    backToScenarios: string;
    scenarios: {
      propertyShowing: string;
      priceNegotiation: string;
      objectionHandling: string;
      firstContact: string;
      closingDeal: string;
      difficultClient: string;
      // New engineering keys
      hvacSystems: string;
      electricalSystems: string;
      safetyCompliance: string;
      plcAutomation: string;
      industrialMaintenance: string;
      advancedTroubleshooting: string;
      motorControls: string;
      bmsSystems: string;
    };
    scenarioDescriptions: {
      propertyShowing: string;
      priceNegotiation: string;
      objectionHandling: string;
      firstContact: string;
      closingDeal: string;
      difficultClient: string;
      // New engineering keys
      hvacSystems: string;
      electricalSystems: string;
      safetyCompliance: string;
      plcAutomation: string;
      industrialMaintenance: string;
      advancedTroubleshooting: string;
      motorControls: string;
      bmsSystems: string;
    };
    difficulty: {
      easy: string;
      medium: string;
      hard: string;
    };
    difficultyLevel: string;
    startSimulation: string;
    configureSession: string;
    selected: string;
    starting: string;
    endSimulation: string;
    simulationComplete: string;
    yourScore: string;
    feedback: string;
    strengths: string;
    improvements: string;
    tryAgain: string;
    nextScenario: string;
    viewDetailedReport: string;
    timeElapsed: string;
    messagesExchanged: string;
    clientSentiment: string;
    positive: string;
    neutral: string;
    negative: string;
  };

  // Voice Call
  voiceCall: {
    title: string;
    subtitle: string;
    startCall: string;
    endCall: string;
    connecting: string;
    listening: string;
    speaking: string;
    thinking: string;
    tapToSpeak: string;
    tapToInterrupt: string;
    callEnded: string;
    duration: string;
    messages: string;
    summary: string;
    performance: string;
    tryAgain: string;
    micPermissionError: string;
    didntHear: string;
    pleaseRepeat: string;
    stillThere: string;
    callInProgress: string;
    preparing: string;
    ready: string;
    // New fields for realtime-call
    evaluation: string;
    overallScore: string;
    communication: string;
    knowledge: string;
    professionalism: string;
    engagement: string;
    strengths: string;
    areasToImprove: string;
    userSpeaking: string;
  };

  // Scenarios
  scenarios: {
    selectScenario: string;
    selectDescription: string;
    propertyShowing: string;
    propertyShowingDesc: string;
    priceNegotiation: string;
    priceNegotiationDesc: string;
    firstContact: string;
    firstContactDesc: string;
    objectionHandling: string;
    objectionHandlingDesc: string;
    closingDeal: string;
    closingDealDesc: string;
  };

  // Reports
  reports: {
    title: string;
    subtitle: string;
    totalSessions: string;
    averageScore: string;
    improvement: string;
    topSkill: string;
    skillPerformance: string;
    scoreProgression: string;
    sessionHistory: string;
    allSessions: string;
    recommendations: string;
    focusAreas: string;
    suggestedCourses: string;
    exportReport: string;
    dateRange: string;
    lastWeek: string;
    lastMonth: string;
    last3Months: string;
    allTime: string;
    noData: string;
    excellentProgress: string;
    goodProgress: string;
    needsImprovement: string;
    performanceOverview: string;
    skillBreakdown: string;
    trendAnalysis: string;
    // Additional reports translations
    failedToLoad: string;
    exportFailed: string;
    noDataToExport: string;
    minutes: string;
    priority: {
      high: string;
      medium: string;
      low: string;
    };
    refresh: string;
    exportCSV: string;
    exportPDF: string;
    completedSimulations: string;
    acrossAllScenarios: string;
    pointsSinceStart: string;
    keepPracticing: string;
    yourStrongestArea: string;
    performanceAcrossAreas: string;
    benchmark: string;
    completeSimulations: string;
    performanceOverTime: string;
    monthsTracked: string;
    totalSessionsLabel: string;
    completeMoreSimulations: string;
    skillRadar: string;
    visualComparison: string;
    allCompletedSessions: string;
    filterByScenario: string;
    allScenarios: string;
    previous: string;
    page: string;
    of: string;
    next: string;
    noSessions: string;
    personalizedRecommendations: string;
    aiSuggestions: string;
    completeMoreForRecommendations: string;
    viewCourse: string;
    greatJob: string;
    keepPracticingMessage: string;
  };

  // Admin
  admin: {
    title: string;
    subtitle: string;
    totalUsers: string;
    teamAverage: string;
    totalSessionsAdmin: string;
    avgSessionsPerUser: string;
    performanceLeaders: string;
    topPerformers: string;
    needsAttention: string;
    recentActivity: string;
    userManagement: string;
    addUser: string;
    editUser: string;
    deleteUser: string;
    viewDetails: string;
    employeeList: string;
    searchEmployees: string;
    activeUsers: string;
    inactiveUsers: string;
    lastActive: string;
    sessionsCount: string;
    averageScoreAdmin: string;
    monthlyTrends: string;
    teamPerformance: string;
  };

  // Client Personas
  personas: {
    saudiClient: string;
    skepticalBuyer: string;
    firstTimeBuyer: string;
    investor: string;
    familyBuyer: string;
  };

  // Notifications
  notifications: {
    title: string;
    markAllRead: string;
    noNotifications: string;
    newCourseAvailable: string;
    achievementUnlocked: string;
    weeklyReport: string;
    reminderToPractice: string;
  };

  // Settings
  settings: {
    title: string;
    language: string;
    theme: string;
    lightMode: string;
    darkMode: string;
    systemMode: string;
    systemDefault: string;
    notifications: string;
    emailNotifications: string;
    pushNotifications: string;
    soundEffects: string;
    autoPlayAudio: string;
    account: string;
    changePassword: string;
    deleteAccount: string;
    privacy: string;
    dataExport: string;
  };

  // Quiz System
  quiz: {
    title: string;
    quizzes: string;
    quizzesDesc: string;
    availableQuizzes: string;
    myAttempts: string;
    takeQuiz: string;
    startQuiz: string;
    submitQuiz: string;
    retakeQuiz: string;
    viewResults: string;
    questions: string;
    question: string;
    of: string;
    timeLimit: string;
    noTimeLimit: string;
    passingScore: string;
    difficulty: string;
    easy: string;
    medium: string;
    hard: string;
    score: string;
    passed: string;
    failed: string;
    correct: string;
    incorrect: string;
    unanswered: string;
    explanation: string;
    timeSpent: string;
    attempts: string;
    maxAttempts: string;
    unlimited: string;
    noQuizzesAvailable: string;
    noAttemptsYet: string;
    quizCompleted: string;
    congratulations: string;
    tryAgain: string;
    reviewAnswers: string;
    nextQuestion: string;
    previousQuestion: string;
    confirmSubmit: string;
    confirmSubmitDesc: string;
    manageQuizzes: string;
    createQuiz: string;
    editQuiz: string;
    deleteQuiz: string;
    publishQuiz: string;
    unpublishQuiz: string;
    published: string;
    draft: string;
    quizTitle: string;
    quizDescription: string;
    addQuestion: string;
    removeQuestion: string;
    addOption: string;
    removeOption: string;
    markCorrect: string;
    questionText: string;
    optionText: string;
    generateWithAI: string;
    generating: string;
    topic: string;
    numberOfQuestions: string;
    viewAttempts: string;
    studentAttempts: string;
    noAttempts: string;
    questionCount: string;
    attemptCount: string;
    manual: string;
    aiGenerated: string;
    createdAt: string;
    confirmDelete: string;
    confirmDeleteDesc: string;
  };

  // Flashcard System
  flashcard: {
    title: string;
    flashcards: string;
    description: string;
    decks: string;
    cards: string;
    front: string;
    back: string;
    hint: string;
    deck: string;
    card: string;
    createDeck: string;
    editDeck: string;
    deleteDeck: string;
    publishDeck: string;
    unpublishDeck: string;
    addCard: string;
    editCard: string;
    deleteCard: string;
    manageDecks: string;
    availableDecks: string;
    study: string;
    startStudy: string;
    flipCard: string;
    showAnswer: string;
    rateRecall: string;
    nextCard: string;
    sessionComplete: string;
    cardsReviewed: string;
    dueToday: string;
    mastered: string;
    studying: string;
    newCards: string;
    progress: string;
    totalCards: string;
    studiedCards: string;
    masteredCards: string;
    noDecks: string;
    noDueCards: string;
    category: string;
    generateWithAI: string;
    aiGenerated: string;
    manual: string;
    topic: string;
    numberOfCards: string;
    generate: string;
    quality0: string;
    quality1: string;
    quality2: string;
    quality3: string;
    quality4: string;
    quality5: string;
    confirmDelete: string;
    confirmDeleteDesc: string;
  };

  // AI Brain
  brain: {
    title: string;
    subtitle: string;
    uploadDocument: string;
    documents: string;
    noDocuments: string;
    uploadFile: string;
    dragOrClick: string;
    acceptedFormats: string;
    processing: string;
    ready: string;
    failed: string;
    deleteDocument: string;
    confirmDeleteDoc: string;
    fileSize: string;
    chunks: string;
    uploadedOn: string;
    systemDefault: string;
    retryProcessing: string;
    searchDocuments: string;
  };

  // Errors
  errors: {
    somethingWentWrong: string;
    pageNotFound: string;
    unauthorized: string;
    forbidden: string;
    serverError: string;
    networkError: string;
    tryAgainLater: string;
    contactSupport: string;
    sessionExpired: string;
    invalidInput: string;
  };

  // Success Messages
  success: {
    saved: string;
    updated: string;
    deleted: string;
    created: string;
    sent: string;
    copied: string;
    downloaded: string;
    uploaded: string;
  };

  // Teacher Personas
  teacher: {
    selectTeacher: string;
    assignedTeacher: string;
    growthMentor: string;
    primary: string;
    mentor: string;
    switchTeacher: string;
    chatWith: string;
    openFullChat: string;
    alwaysAvailable: string;
  };

  // Floating Bot
  floatingBot: {
    quickChat: string;
    askAnything: string;
    greeting: string;
    send: string;
    thinking: string;
    pageContext: {
      dashboard: string;
      courses: string;
      simulations: string;
      reports: string;
      general: string;
    };
  };
}

const TRANSLATIONS: Record<Language, Translations> = {
  ar: {
    common: {
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      success: 'تم بنجاح',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      back: 'رجوع',
      next: 'التالي',
      save: 'حفظ',
      close: 'إغلاق',
      search: 'بحث',
      filter: 'تصفية',
      all: 'الكل',
      none: 'لا شيء',
      view: 'عرض',
      edit: 'تعديل',
      delete: 'حذف',
      create: 'إنشاء',
      submit: 'إرسال',
      reset: 'إعادة تعيين',
      continue: 'متابعة',
      start: 'بدء',
      stop: 'إيقاف',
      pause: 'إيقاف مؤقت',
      resume: 'استئناف',
      retry: 'إعادة المحاولة',
      skip: 'تخطي',
      finish: 'إنهاء',
      complete: 'مكتمل',
      incomplete: 'غير مكتمل',
      active: 'نشط',
      inactive: 'غير نشط',
      enabled: 'مفعّل',
      disabled: 'معطّل',
      yes: 'نعم',
      no: 'لا',
      or: 'أو',
      and: 'و',
      minutes: 'دقائق',
      hours: 'ساعات',
      days: 'أيام',
      weeks: 'أسابيع',
      today: 'اليوم',
      yesterday: 'أمس',
      noResults: 'لا توجد نتائج',
      showMore: 'عرض المزيد',
      showLess: 'عرض أقل',
    },

    auth: {
      signIn: 'تسجيل الدخول',
      signUp: 'إنشاء حساب',
      signOut: 'تسجيل الخروج',
      signingIn: 'جاري تسجيل الدخول...',
      login: 'دخول',
      register: 'تسجيل',
      forgotPassword: 'نسيت كلمة المرور؟',
      resetPassword: 'إعادة تعيين كلمة المرور',
      email: 'البريد الإلكتروني',
      emailAddress: 'عنوان البريد الإلكتروني',
      emailPlaceholder: 'أدخل بريدك الإلكتروني',
      password: 'كلمة المرور',
      passwordPlaceholder: 'أدخل كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      fullName: 'الاسم الكامل',
      rememberMe: 'تذكرني',
      welcomeBack: 'مرحباً بعودتك',
      continueJourney: 'سجّل دخولك لمواصلة رحلتك التدريبية',
      createAccount: 'إنشاء حساب جديد',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      dontHaveAccount: 'ليس لديك حساب؟',
      newToPlatform: 'جديد في 2YStudy؟',
      termsAgree: 'بتسجيل الدخول، أنت توافق على',
      termsOfService: 'شروط الخدمة',
      privacyPolicy: 'سياسة الخصوصية',
      loginSuccess: 'تم تسجيل الدخول بنجاح',
      loginFailed: 'فشل تسجيل الدخول',
      registerSuccess: 'تم إنشاء الحساب بنجاح',
      invalidCredentials: 'بيانات الدخول غير صحيحة',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      passwordRequirements: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
      emailRequired: 'البريد الإلكتروني مطلوب',
      passwordRequired: 'كلمة المرور مطلوبة',
      heroTitle: 'أتقن الهندسة الكهروميكانيكية مع التدريب المدعوم بالذكاء الاصطناعي',
      heroDescription: 'تعلّم أنظمة التكييف، برمجة PLC، الأنظمة الكهربائية، والصيانة الصناعية من خلال جلسات تفاعلية مع الذكاء الاصطناعي.',
      studentsCount: '+10,000 طالب',
      successRate: 'نسبة نجاح 95%',
      poweredBy: 'مدعوم بتقنية الذكاء الاصطناعي المتقدمة',
      // Register page
      startJourney: 'ابدأ رحلتك نحو التميز في الهندسة الكهروميكانيكية',
      joinThousands: 'انضم لآلاف المهندسين المحترفين الذين حولوا مسيرتهم المهنية.',
      createYourAccount: 'أنشئ حسابك',
      startTrainingJourney: 'ابدأ رحلتك التدريبية في الهندسة الكهروميكانيكية اليوم',
      creatingAccount: 'جاري إنشاء الحساب...',
      firstNamePlaceholder: 'أحمد',
      lastNamePlaceholder: 'محمد',
      passwordStrong: 'أنشئ كلمة مرور قوية',
      confirmPasswordPlaceholder: 'أكد كلمة المرور',
      freeTrialNoCreditCard: 'تجربة مجانية لمدة 14 يومًا - لا تحتاج لبطاقة ائتمان',
      byCreatingAccount: 'بإنشاء حساب، أنت توافق على',
      // Benefits
      benefitAIPractice: 'جلسات تعليمية تفاعلية مع الذكاء الاصطناعي',
      benefitFeedback: 'ملاحظات شخصية وتدريب مخصص',
      benefitAnalytics: 'تتبع تقدمك بتحليلات مفصلة',
      benefitOwnPace: 'تعلم بسرعتك الخاصة',
    },

    nav: {
      dashboard: 'لوحة التحكم',
      dashboardDesc: 'نظرة عامة على تقدمك',
      courses: 'الدورات التدريبية',
      coursesDesc: 'تعلم من خبراء الصناعة',
      simulations: 'الجلسات المباشرة',
      simulationsDesc: 'ناقش مواضيع هندسية مع معلمك الذكي',
      voicePractice: 'الجلسات الصوتية',
      voicePracticeDesc: 'تعلّم من خلال المناقشات الصوتية',
      realtimeCall: 'مكالمة فورية',
      realtimeCallDesc: 'محادثة صوتية متقدمة',
      aiTeacher: 'المعلم الذكي',
      aiTeacherDesc: 'مرشدك الشخصي للتعلم',
      reports: 'التقارير',
      reportsDesc: 'تتبع أداءك وتقدمك',
      admin: 'الإدارة',
      settings: 'الإعدادات',
      profile: 'الملف الشخصي',
      help: 'المساعدة',
      home: 'الرئيسية',
    },

    landing: {
      brandName: '2YStudy',

      nav: {
        features: 'المميزات',
        howItWorks: 'كيف يعمل',
        testimonials: 'آراء العملاء',
        pricing: 'الأسعار',
        signIn: 'تسجيل الدخول',
        getStarted: 'ابدأ الآن',
      },

      hero: {
        badge: 'مدعوم بالذكاء الاصطناعي',
        titlePart1: 'أتقن الهندسة الكهروميكانيكية مع',
        titleHighlight: 'تدريب الذكاء الاصطناعي',
        description: 'تعلّم استكشاف أعطال أنظمة التكييف، برمجة PLC، الأنظمة الكهربائية، والصيانة الصناعية من خلال جلسات صوتية تفاعلية مع معلمك الذكي',
        startFreeTrial: 'ابدأ التجربة المجانية',
        watchDemo: 'شاهد العرض',
        noCreditCard: 'بدون بطاقة ائتمان',
        freeTrial: 'تجربة مجانية 14 يوم',
        cancelAnytime: 'إلغاء في أي وقت',
      },

      stats: {
        activeStudents: 'طالب نشط',
        successRate: 'نسبة النجاح',
        sessionsCompleted: 'جلسة مكتملة',
        userRating: 'تقييم المستخدمين',
      },

      features: {
        title: 'كل ما تحتاجه للتميز في الهندسة الكهروميكانيكية',
        subtitle: 'منصة متكاملة للتدريب والتطوير المهني بأحدث تقنيات الذكاء الاصطناعي',
        aiSimulations: {
          title: 'جلسات تعليمية تفاعلية',
          description: 'ناقش مواضيع هندسية حقيقية مع معلمك الذكي واحصل على شروحات مفصلة وتطبيقات عملية',
        },
        voiceCalls: {
          title: 'جلسات صوتية مباشرة',
          description: 'تعلّم من خلال محادثات صوتية تفاعلية مع خبير هندسي ذكي يشرح ويجيب على أسئلتك',
        },
        analytics: {
          title: 'تحليلات أداء متقدمة',
          description: 'تتبع تقدمك بتقارير مفصلة وتوصيات مخصصة لتحسين نقاط الضعف',
        },
        courses: {
          title: 'دورات احترافية',
          description: 'تعلّم من خبراء الصناعة بمحتوى حصري ومحدّث باستمرار',
        },
        certifications: {
          title: 'شهادات معتمدة',
          description: 'احصل على شهادات معترف بها في مجال الهندسة الكهروميكانيكية',
        },
        bilingual: {
          title: 'السلامة والامتثال',
          description: 'تعلّم معايير السلامة المهنية وإجراءات OSHA والامتثال الصناعي',
        },
      },

      howItWorks: {
        title: 'كيف تعمل المنصة',
        subtitle: 'ثلاث خطوات بسيطة لبدء رحلة التدريب والتطوير المهني',
        step1: {
          title: 'أنشئ حسابك',
          description: 'سجّل مجاناً في دقائق وحدد أهدافك التدريبية ومستواك الحالي',
        },
        step2: {
          title: 'تعلّم وتدرّب',
          description: 'شاهد الدورات التدريبية وتفاعل مع جلسات تعليمية مع معلمك الذكي',
        },
        step3: {
          title: 'تابع وتطور',
          description: 'راقب تقدمك من خلال التقارير واحصل على توصيات للتحسين المستمر',
        },
      },

      testimonials: {
        title: 'ماذا يقول المهندسون',
        subtitle: 'آلاف المهندسين يثقون بمنصتنا لتطوير مهاراتهم في الهندسة الكهروميكانيكية',
        items: [
          {
            quote: 'المنصة غيّرت طريقة تدريب فريقي تماماً. الجلسات التفاعلية واقعية جداً والتحليلات تساعدنا على التحسن المستمر.',
            name: 'أحمد الراشد',
            role: 'مدير صيانة - شركة الهندسة المتقدمة',
            initials: 'أر',
          },
          {
            quote: 'أفضل استثمار لتطوير مهاراتي. المناقشات الصوتية مع المعلم الذكي ساعدتني في فهم أنظمة التكييف بشكل أعمق.',
            name: 'سارة المنصور',
            role: 'فنية أنظمة تكييف أولى',
            initials: 'سم',
          },
          {
            quote: 'المنصة مثالية للمهندسين الذين يريدون تطوير مهاراتهم العملية. المحتوى التعليمي ممتاز وشامل.',
            name: 'خالد العتيبي',
            role: 'مدير عمليات المنشآت',
            initials: 'خع',
          },
        ],
      },

      pricing: {
        title: 'خطط أسعار مرنة',
        subtitle: 'اختر الخطة المناسبة لاحتياجاتك وابدأ رحلة التطوير المهني',
        perMonth: 'شهرياً',
        mostPopular: 'الأكثر شعبية',
        getStarted: 'ابدأ مجاناً',
        startTrial: 'ابدأ التجربة',
        contactSales: 'تواصل معنا',
        free: {
          name: 'مجاني',
          description: 'مثالي للتجربة والبدء',
          price: '0 ر.س',
          features: [
            '3 جلسات تعليمية شهرياً',
            'دورتان تدريبيتان',
            'تقارير أساسية',
            'دعم عبر البريد',
          ],
        },
        pro: {
          name: 'احترافي',
          description: 'للمحترفين الجادين',
          price: '199 ر.س',
          features: [
            'جلسات تعليمية غير محدودة',
            'جميع الدورات التدريبية',
            'جلسات صوتية غير محدودة',
            'تحليلات متقدمة',
            'شهادات معتمدة',
            'دعم أولوية',
          ],
        },
        enterprise: {
          name: 'الشركات',
          description: 'للفرق والمؤسسات',
          price: 'تواصل معنا',
          features: [
            'كل مميزات الخطة الاحترافية',
            'لوحة تحكم إدارية',
            'تقارير أداء الفريق',
            'تخصيص المواضيع التعليمية',
            'مدير حساب مخصص',
            'تدريب مخصص للفريق',
          ],
        },
      },

      cta: {
        title: 'جاهز لتطوير مهاراتك؟',
        description: 'انضم لآلاف المحترفين الذين يستخدمون منصتنا لتحقيق نتائج أفضل في الهندسة الكهروميكانيكية',
        button: 'ابدأ التجربة المجانية الآن',
      },

      footer: {
        description: 'منصة تدريب متكاملة لمحترفي الهندسة الكهروميكانيكية باستخدام أحدث تقنيات الذكاء الاصطناعي',
        product: 'المنتج',
        company: 'الشركة',
        legal: 'القانونية',
        courses: 'الدورات',
        simulations: 'الجلسات التعليمية',
        about: 'من نحن',
        blog: 'المدونة',
        careers: 'الوظائف',
        contact: 'تواصل معنا',
        privacy: 'سياسة الخصوصية',
        terms: 'شروط الاستخدام',
        cookies: 'سياسة ملفات تعريف الارتباط',
        allRightsReserved: 'جميع الحقوق محفوظة',
      },
    },

    diagnostic: {
      assessmentNeeded: 'تقييم المهارات مطلوب',
      assessmentNeededDesc: 'قم بتحليل أدائك لتحصل على توصيات تعليمية مخصصة',
      runAssessment: 'تحليل مستواي',
      skillProfile: 'ملف المهارات',
      overallScore: 'النتيجة الإجمالية',
      refresh: 'تحديث',
      assessmentGateway: 'التقييم اليومي للمهارات',
      assessmentGatewayDesc: 'أكمل تقييماً سريعاً لتخصيص تدريبك',
      startAssessment: 'ابدأ التقييم',
      step1Title: 'المناقشة النصية',
      step1Desc: 'مناقشة تعليمية مع معلمك الذكي',
      step2Title: 'المكالمة الصوتية',
      step2Desc: 'تدريب على مكالمة هاتفية فورية',
      continueAssessment: 'متابعة التقييم',
      skipVoice: 'تخطي التدريب الصوتي',
      generating: 'جاري إنشاء تقرير مهاراتك...',
      reportReady: 'تقرير مهاراتك جاهز!',
      continueToDashboard: 'متابعة للوحة التحكم',
      recommendedForYou: 'مُوصى به لك',
      basedOnAssessment: 'بناءً على تقييم مهاراتك',
      stepOf: 'الخطوة',
      evaluatorGenerating: 'جاري إنشاء التقييم التفصيلي...',
      assignedTeacher: 'المعلم المخصص لك',
      detailedAnalysis: 'تحليل المهارات التفصيلي',
      improvementPlan: 'خطة التطوير',
      shortTerm: 'قصير المدى (1-2 أسبوع)',
      mediumTerm: 'متوسط المدى (1-2 شهر)',
      longTerm: 'طويل المدى (3+ أشهر)',
      overallNarrative: 'التقييم العام',
      yourTeacher: 'معلمك',
      weak: 'ضعيف',
      developing: 'قيد التطوير',
      competent: 'مؤهل',
      strong: 'قوي',
      excellent: 'ممتاز',
    },

    dashboard: {
      title: 'لوحة التحكم',
      subtitle: 'نظرة عامة على تقدمك التدريبي',
      welcome: 'مرحباً بعودتك!',
      continueJourney: 'واصل رحلتك التدريبية اليوم',
      overallProgress: 'التقدم الإجمالي',
      averageScore: 'متوسط الدرجات',
      currentStreak: 'سلسلة الأيام',
      timeInvested: 'الوقت المستثمر',
      thisWeek: 'هذا الأسبوع',
      acrossAssessments: 'في جميع التقييمات',
      keepItGoing: 'استمر بالعمل الرائع!',
      minutesTotal: 'دقيقة إجمالاً',
      days: 'يوم',
      continueLearning: 'أكمل التعلم',
      pickUpWhereYouLeft: 'تابع من حيث توقفت في آخر دورة',
      negotiationFundamentals: 'أساسيات الهندسة',
      module3: 'الوحدة 3 - التواصل الفني',
      complete: 'مكتمل',
      continueCourse: 'متابعة الدورة',
      practiceSimulations: 'الجلسات التعليمية',
      sharpenSkills: 'طوّر مهاراتك مع جلسات هندسية تفاعلية',
      recommendedScenario: 'الموضوع الموصى به',
      priceNegotiation: 'الأنظمة الكهربائية والدوائر - مستوى متوسط',
      basedOnPerformance: 'بناءً على أدائك الأخير',
      startSimulation: 'ابدأ الجلسة',
      voicePractice: 'الجلسات الصوتية',
      practiceWithAI: 'تعلّم من خلال مناقشات صوتية مع معلمك الذكي',
      realtimeConversation: 'جلسة صوتية مباشرة',
      voiceCallDescription: 'ناقش مواضيع هندسية مع معلمك الذكي بالصوت',
      newFeature: 'ميزة جديدة',
      startVoiceCall: 'ابدأ المكالمة',
      yourProgress: 'تقدمك',
      viewDetailedAnalytics: 'راقب إحصائياتك ونتائجك التفصيلية',
      simulations: 'جلسة',
      courses: 'دورة',
      voiceCalls: 'جلسة صوتية',
      avgScore: 'متوسط النتيجة',
      viewReports: 'عرض التقارير',
    },

    courses: {
      title: 'الدورات التدريبية',
      subtitle: 'طوّر مهاراتك مع دورات متخصصة من الخبراء',
      searchPlaceholder: 'ابحث عن دورة...',
      allCategories: 'جميع التصنيفات',
      allLevels: 'جميع المستويات',
      coursesAvailable: 'دورة متاحة',
      hours: 'ساعة',
      minutes: 'دقيقة',
      categories: {
        fundamentals: 'أساسيات الهندسة',
        hvac: 'أنظمة التكييف',
        electrical: 'الأنظمة الكهربائية',
        plcAutomation: 'التحكم الآلي',
        maintenance: 'الصيانة الصناعية',
        safety: 'السلامة والامتثال',
      },
      difficulty: {
        beginner: 'مبتدئ',
        intermediate: 'متوسط',
        advanced: 'متقدم',
      },
      noCourses: 'لا توجد دورات',
      adjustFilters: 'جرّب تعديل معايير البحث',
      startLearning: 'ابدأ التعلم',
      continueLearning: 'أكمل التعلم',
      completed: 'مكتمل',
      inProgress: 'قيد التقدم',
      notStarted: 'لم يبدأ',
      lessons: 'درس',
      duration: 'المدة',
      enrolled: 'مسجل',
      progress: 'التقدم',
      certificate: 'شهادة',
      courseDetails: 'تفاصيل الدورة',
      whatYouLearn: 'ماذا ستتعلم',
      requirements: 'المتطلبات',
      description: 'الوصف',
      instructor: 'المشرف',
      reviews: 'التقييمات',
      relatedCourses: 'دورات ذات صلة',
    },

    simulations: {
      title: 'الجلسات المباشرة',
      subtitle: 'انضم لجلسات تعليمية تفاعلية مع معلمك الهندسي الذكي',
      chooseScenario: 'اختر الموضوع',
      chooseMode: 'اختر نوع الجلسة',
      selectModeDescription: 'اختر طريقة التفاعل مع معلمك الذكي',
      chatMode: 'مناقشة نصية',
      voiceMode: 'جلسة صوتية مباشرة',
      chatModeDescription: 'ناقش مواضيع هندسية مع معلمك الذكي عبر النص',
      voiceModeDescription: 'محادثة صوتية حقيقية مع معلمك الذكي',
      voiceCallInArabic: 'باللغة العربية',
      backToScenarios: 'العودة للمواضيع',
      scenarios: {
        propertyShowing: 'أنظمة التكييف والتبريد',
        priceNegotiation: 'الأنظمة الكهربائية والدوائر',
        objectionHandling: 'إجراءات السلامة والامتثال',
        firstContact: 'أساسيات برمجة PLC',
        closingDeal: 'تخطيط الصيانة الصناعية',
        difficultClient: 'استكشاف الأعطال المتقدم',
        // New engineering keys
        hvacSystems: 'أنظمة التكييف والتبريد',
        electricalSystems: 'الأنظمة الكهربائية والدوائر',
        safetyCompliance: 'إجراءات السلامة والامتثال',
        plcAutomation: 'برمجة PLC والأتمتة',
        industrialMaintenance: 'تخطيط الصيانة الصناعية',
        advancedTroubleshooting: 'استكشاف الأعطال المتقدم',
        motorControls: 'التحكم بالمحركات وأنظمة VFD',
        bmsSystems: 'أنظمة إدارة المباني',
      },
      scenarioDescriptions: {
        propertyShowing: 'تعلّم مكونات أنظمة التكييف، دورات التبريد، وتقنيات استكشاف الأعطال الشائعة',
        priceNegotiation: 'ناقش تصميم الدوائر الكهربائية، توزيع الطاقة، وطرق تشخيص الأعطال',
        objectionHandling: 'راجع معايير السلامة، إجراءات القفل والتعليق، وبروتوكولات الأمان',
        firstContact: 'استكشف برمجة PLC بالسلم المنطقي، تكوين المدخلات/المخرجات، وأساسيات الأتمتة',
        closingDeal: 'خطط لجداول الصيانة الوقائية، دورة حياة المعدات، واستراتيجيات الموثوقية',
        difficultClient: 'عالج أعطال الأنظمة المتعددة المعقدة وتقنيات تحليل السبب الجذري',
        // New engineering keys
        hvacSystems: 'تعلّم مكونات أنظمة التكييف، دورات التبريد، وتقنيات استكشاف الأعطال الشائعة',
        electricalSystems: 'ناقش تصميم الدوائر الكهربائية، توزيع الطاقة، وطرق تشخيص الأعطال',
        safetyCompliance: 'راجع معايير السلامة، إجراءات القفل والتعليق، وبروتوكولات الأمان',
        plcAutomation: 'استكشف برمجة PLC بالسلم المنطقي، تكوين المدخلات/المخرجات، وأساسيات الأتمتة',
        industrialMaintenance: 'خطط لجداول الصيانة الوقائية، دورة حياة المعدات، واستراتيجيات الموثوقية',
        advancedTroubleshooting: 'عالج أعطال الأنظمة المتعددة المعقدة وتقنيات تحليل السبب الجذري',
        motorControls: 'تعلّم التحكم بالمحركات الكهربائية، محولات التردد، وأنظمة الحماية',
        bmsSystems: 'استكشف أنظمة إدارة المباني الذكية، التحكم بالبيئة، وتكامل الأنظمة',
      },
      difficulty: {
        easy: 'مبتدئ',
        medium: 'متوسط',
        hard: 'متقدم',
      },
      difficultyLevel: 'مستوى المهارة',
      startSimulation: 'ابدأ الجلسة',
      configureSession: 'اضبط إعدادات جلسة التعلّم',
      selected: 'تم الاختيار',
      starting: 'جاري البدء...',
      endSimulation: 'إنهاء الجلسة',
      simulationComplete: 'انتهت الجلسة!',
      yourScore: 'نتيجتك',
      feedback: 'التغذية الراجعة',
      strengths: 'نقاط القوة',
      improvements: 'نقاط للتحسين',
      tryAgain: 'حاول مرة أخرى',
      nextScenario: 'الموضوع التالي',
      viewDetailedReport: 'عرض التقرير المفصل',
      timeElapsed: 'الوقت المنقضي',
      messagesExchanged: 'الرسائل المتبادلة',
      clientSentiment: 'تقييم المعلم',
      positive: 'ممتاز',
      neutral: 'جيد',
      negative: 'يحتاج تحسين',
    },

    voiceCall: {
      title: 'الجلسات الصوتية',
      subtitle: 'تعلّم من خلال المناقشات الصوتية مع معلمك الهندسي الذكي',
      startCall: 'ابدأ المكالمة',
      endCall: 'إنهاء المكالمة',
      connecting: 'جاري الاتصال...',
      listening: 'يستمع...',
      speaking: 'يتكلم',
      thinking: 'يفكر...',
      tapToSpeak: 'اضغط للتحدث',
      tapToInterrupt: 'اضغط للمقاطعة',
      callEnded: 'انتهت المكالمة!',
      duration: 'المدة',
      messages: 'رسالة',
      summary: 'ملخص المحادثة',
      performance: 'قياسات الأداء',
      tryAgain: 'تدرّب مرة أخرى',
      micPermissionError: 'يرجى السماح بالوصول للميكروفون',
      didntHear: 'لم أسمعك',
      pleaseRepeat: 'ممكن تعيد؟',
      stillThere: 'هل أنت معي؟',
      callInProgress: 'المكالمة جارية',
      preparing: 'جاري التجهيز...',
      ready: 'جاهز',
      // New fields for realtime-call
      evaluation: 'التقييم',
      overallScore: 'الدرجة الإجمالية',
      communication: 'التواصل',
      knowledge: 'المعرفة',
      professionalism: 'الاحترافية',
      engagement: 'التفاعل',
      strengths: 'نقاط القوة',
      areasToImprove: 'نقاط التحسين',
      userSpeaking: 'يتحدث...',
    },

    scenarios: {
      selectScenario: 'اختر الموضوع',
      selectDescription: 'اختر الموضوع الهندسي الذي تريد مناقشته مع معلمك الذكي',
      propertyShowing: 'أنظمة التكييف والتبريد',
      propertyShowingDesc: 'ناقش مكونات أنظمة التكييف، دورات التبريد، وتقنيات استكشاف الأعطال',
      priceNegotiation: 'الأنظمة الكهربائية والدوائر',
      priceNegotiationDesc: 'استكشف تصميم الدوائر الكهربائية، توزيع الطاقة، وتشخيص الأعطال',
      firstContact: 'أساسيات برمجة PLC',
      firstContactDesc: 'تعلّم برمجة PLC بالسلم المنطقي، تكوين المدخلات/المخرجات، وأساسيات الأتمتة',
      objectionHandling: 'إجراءات السلامة والامتثال',
      objectionHandlingDesc: 'راجع معايير السلامة، إجراءات القفل والتعليق، وبروتوكولات الأمان المهني',
      closingDeal: 'تخطيط الصيانة الصناعية',
      closingDealDesc: 'خطط لجداول الصيانة الوقائية واستراتيجيات موثوقية المعدات',
    },

    reports: {
      title: 'تقارير الأداء',
      subtitle: 'تتبع تقدمك وحدد مجالات التحسين',
      totalSessions: 'إجمالي الجلسات',
      averageScore: 'متوسط الدرجات',
      improvement: 'نسبة التحسن',
      topSkill: 'أقوى مهارة',
      skillPerformance: 'أداء المهارات',
      scoreProgression: 'تطور الدرجات',
      sessionHistory: 'سجل الجلسات',
      allSessions: 'جميع الجلسات المكتملة',
      recommendations: 'توصيات مخصصة',
      focusAreas: 'مجالات التركيز',
      suggestedCourses: 'دورات مقترحة',
      exportReport: 'تصدير التقرير',
      dateRange: 'الفترة الزمنية',
      lastWeek: 'الأسبوع الماضي',
      lastMonth: 'الشهر الماضي',
      last3Months: 'آخر 3 أشهر',
      allTime: 'كل الوقت',
      noData: 'لا توجد بيانات كافية',
      excellentProgress: 'تقدم ممتاز!',
      goodProgress: 'تقدم جيد',
      needsImprovement: 'يحتاج تحسين',
      performanceOverview: 'نظرة عامة على الأداء',
      skillBreakdown: 'تفصيل المهارات',
      trendAnalysis: 'تحليل الاتجاهات',
      failedToLoad: 'فشل تحميل التقارير',
      exportFailed: 'فشل التصدير',
      noDataToExport: 'لا توجد بيانات للتصدير',
      minutes: 'دقيقة',
      priority: {
        high: 'عالية',
        medium: 'متوسطة',
        low: 'منخفضة',
      },
      refresh: 'تحديث',
      exportCSV: 'تصدير CSV',
      exportPDF: 'تصدير PDF',
      completedSimulations: 'محاكاة مكتملة',
      acrossAllScenarios: 'عبر جميع السيناريوهات',
      pointsSinceStart: 'نقطة منذ البداية',
      keepPracticing: 'استمر بالتدرب!',
      yourStrongestArea: 'أقوى مجالاتك',
      performanceAcrossAreas: 'أداؤك عبر مختلف المجالات',
      benchmark: 'المعيار',
      completeSimulations: 'أكمل بعض المحاكاة لرؤية بياناتك',
      performanceOverTime: 'الأداء مع مرور الوقت',
      monthsTracked: 'شهر متتبع',
      totalSessionsLabel: 'جلسة',
      completeMoreSimulations: 'أكمل المزيد من المحاكاة لرؤية اتجاهاتك',
      skillRadar: 'رادار المهارات',
      visualComparison: 'مقارنة بصرية لمهاراتك',
      allCompletedSessions: 'جميع الجلسات المكتملة',
      filterByScenario: 'تصفية حسب السيناريو',
      allScenarios: 'جميع السيناريوهات',
      previous: 'السابق',
      page: 'صفحة',
      of: 'من',
      next: 'التالي',
      noSessions: 'لا توجد جلسات بعد',
      personalizedRecommendations: 'توصيات مخصصة لك',
      aiSuggestions: 'اقتراحات الذكاء الاصطناعي بناءً على أدائك',
      completeMoreForRecommendations: 'أكمل المزيد من المحاكاة للحصول على توصيات',
      viewCourse: 'عرض الدورة',
      greatJob: 'أداء رائع!',
      keepPracticingMessage: 'استمر بالتدريب للحفاظ على مستواك العالي',
    },

    admin: {
      title: 'لوحة الإدارة',
      subtitle: 'نظرة عامة على أداء الفريق والنشاط',
      totalUsers: 'إجمالي المستخدمين',
      teamAverage: 'متوسط الفريق',
      totalSessionsAdmin: 'إجمالي الجلسات',
      avgSessionsPerUser: 'الجلسات لكل مستخدم',
      performanceLeaders: 'قادة الأداء',
      topPerformers: 'الأفضل أداءً',
      needsAttention: 'يحتاج متابعة',
      recentActivity: 'النشاط الأخير',
      userManagement: 'إدارة المستخدمين',
      addUser: 'إضافة مستخدم',
      editUser: 'تعديل مستخدم',
      deleteUser: 'حذف مستخدم',
      viewDetails: 'عرض التفاصيل',
      employeeList: 'قائمة الموظفين',
      searchEmployees: 'بحث عن موظف...',
      activeUsers: 'المستخدمون النشطون',
      inactiveUsers: 'غير نشط',
      lastActive: 'آخر نشاط',
      sessionsCount: 'عدد الجلسات',
      averageScoreAdmin: 'متوسط الدرجات',
      monthlyTrends: 'الاتجاهات الشهرية',
      teamPerformance: 'أداء الفريق',
    },

    personas: {
      saudiClient: 'معلم مهندس أول',
      skepticalBuyer: 'خبير سلامة وامتثال',
      firstTimeBuyer: 'معلم متخصص في التكييف',
      investor: 'معلم إدارة المنشآت',
      familyBuyer: 'خبير أنظمة صناعية',
    },

    notifications: {
      title: 'الإشعارات',
      markAllRead: 'تحديد الكل كمقروء',
      noNotifications: 'لا توجد إشعارات',
      newCourseAvailable: 'دورة جديدة متاحة',
      achievementUnlocked: 'تم فتح إنجاز جديد',
      weeklyReport: 'تقريرك الأسبوعي جاهز',
      reminderToPractice: 'حان وقت التدريب!',
    },

    settings: {
      title: 'الإعدادات',
      language: 'اللغة',
      theme: 'المظهر',
      lightMode: 'فاتح',
      darkMode: 'داكن',
      systemMode: 'تلقائي',
      systemDefault: 'تلقائي',
      notifications: 'الإشعارات',
      emailNotifications: 'إشعارات البريد',
      pushNotifications: 'الإشعارات الفورية',
      soundEffects: 'المؤثرات الصوتية',
      autoPlayAudio: 'تشغيل الصوت تلقائياً',
      account: 'الحساب',
      changePassword: 'تغيير كلمة المرور',
      deleteAccount: 'حذف الحساب',
      privacy: 'الخصوصية',
      dataExport: 'تصدير البيانات',
    },

    quiz: {
      title: 'الاختبارات',
      quizzes: 'الاختبارات',
      quizzesDesc: 'اختبر معرفتك',
      availableQuizzes: 'الاختبارات المتاحة',
      myAttempts: 'محاولاتي',
      takeQuiz: 'ابدأ الاختبار',
      startQuiz: 'ابدأ الاختبار',
      submitQuiz: 'إرسال الاختبار',
      retakeQuiz: 'إعادة الاختبار',
      viewResults: 'عرض النتائج',
      questions: 'الأسئلة',
      question: 'سؤال',
      of: 'من',
      timeLimit: 'الوقت المحدد',
      noTimeLimit: 'بدون وقت محدد',
      passingScore: 'درجة النجاح',
      difficulty: 'المستوى',
      easy: 'سهل',
      medium: 'متوسط',
      hard: 'صعب',
      score: 'الدرجة',
      passed: 'ناجح',
      failed: 'راسب',
      correct: 'صحيح',
      incorrect: 'خطأ',
      unanswered: 'لم يتم الإجابة',
      explanation: 'الشرح',
      timeSpent: 'الوقت المستغرق',
      attempts: 'المحاولات',
      maxAttempts: 'الحد الأقصى للمحاولات',
      unlimited: 'غير محدود',
      noQuizzesAvailable: 'لا توجد اختبارات متاحة حالياً',
      noAttemptsYet: 'لم تقم بأي محاولات بعد',
      quizCompleted: 'تم إكمال الاختبار',
      congratulations: 'تهانينا!',
      tryAgain: 'حاول مرة أخرى',
      reviewAnswers: 'مراجعة الإجابات',
      nextQuestion: 'السؤال التالي',
      previousQuestion: 'السؤال السابق',
      confirmSubmit: 'تأكيد الإرسال',
      confirmSubmitDesc: 'هل أنت متأكد من إرسال إجاباتك؟ لا يمكن التراجع بعد الإرسال.',
      manageQuizzes: 'إدارة الاختبارات',
      createQuiz: 'إنشاء اختبار',
      editQuiz: 'تعديل الاختبار',
      deleteQuiz: 'حذف الاختبار',
      publishQuiz: 'نشر الاختبار',
      unpublishQuiz: 'إلغاء النشر',
      published: 'منشور',
      draft: 'مسودة',
      quizTitle: 'عنوان الاختبار',
      quizDescription: 'وصف الاختبار',
      addQuestion: 'إضافة سؤال',
      removeQuestion: 'حذف السؤال',
      addOption: 'إضافة خيار',
      removeOption: 'حذف الخيار',
      markCorrect: 'تحديد كإجابة صحيحة',
      questionText: 'نص السؤال',
      optionText: 'نص الخيار',
      generateWithAI: 'إنشاء بالذكاء الاصطناعي',
      generating: 'جاري الإنشاء...',
      topic: 'الموضوع',
      numberOfQuestions: 'عدد الأسئلة',
      viewAttempts: 'عرض المحاولات',
      studentAttempts: 'محاولات الطلاب',
      noAttempts: 'لا توجد محاولات',
      questionCount: 'عدد الأسئلة',
      attemptCount: 'عدد المحاولات',
      manual: 'يدوي',
      aiGenerated: 'ذكاء اصطناعي',
      createdAt: 'تاريخ الإنشاء',
      confirmDelete: 'تأكيد الحذف',
      confirmDeleteDesc: 'هل أنت متأكد من حذف هذا الاختبار؟ لا يمكن التراجع.',
    },

    flashcard: {
      title: 'البطاقات التعليمية',
      flashcards: 'البطاقات التعليمية',
      description: 'تعلم بالبطاقات التعليمية مع التكرار المتباعد',
      decks: 'مجموعات البطاقات',
      cards: 'البطاقات',
      front: 'الأمام',
      back: 'الخلف',
      hint: 'تلميح',
      deck: 'مجموعة',
      card: 'بطاقة',
      createDeck: 'إنشاء مجموعة',
      editDeck: 'تعديل المجموعة',
      deleteDeck: 'حذف المجموعة',
      publishDeck: 'نشر المجموعة',
      unpublishDeck: 'إلغاء النشر',
      addCard: 'إضافة بطاقة',
      editCard: 'تعديل البطاقة',
      deleteCard: 'حذف البطاقة',
      manageDecks: 'إدارة المجموعات',
      availableDecks: 'المجموعات المتاحة',
      study: 'دراسة',
      startStudy: 'ابدأ الدراسة',
      flipCard: 'اقلب البطاقة',
      showAnswer: 'أظهر الإجابة',
      rateRecall: 'قيّم تذكرك',
      nextCard: 'البطاقة التالية',
      sessionComplete: 'انتهت الجلسة',
      cardsReviewed: 'بطاقات تمت مراجعتها',
      dueToday: 'مستحقة اليوم',
      mastered: 'متقنة',
      studying: 'قيد الدراسة',
      newCards: 'بطاقات جديدة',
      progress: 'التقدم',
      totalCards: 'إجمالي البطاقات',
      studiedCards: 'بطاقات تمت دراستها',
      masteredCards: 'بطاقات متقنة',
      noDecks: 'لا توجد مجموعات بطاقات',
      noDueCards: 'لا توجد بطاقات مستحقة للمراجعة',
      category: 'الفئة',
      generateWithAI: 'إنشاء بالذكاء الاصطناعي',
      aiGenerated: 'ذكاء اصطناعي',
      manual: 'يدوي',
      topic: 'الموضوع',
      numberOfCards: 'عدد البطاقات',
      generate: 'إنشاء',
      quality0: 'لا أعرف',
      quality1: 'خطأ، تعرفت عليه',
      quality2: 'خطأ، سهل التذكر',
      quality3: 'صحيح، صعب',
      quality4: 'صحيح، تردد',
      quality5: 'مثالي',
      confirmDelete: 'تأكيد الحذف',
      confirmDeleteDesc: 'هل أنت متأكد من حذف هذه المجموعة؟ لا يمكن التراجع.',
    },

    brain: {
      title: 'العقل الذكي',
      subtitle: 'قاعدة المعرفة لتدريب الذكاء الاصطناعي',
      uploadDocument: 'رفع مستند',
      documents: 'المستندات',
      noDocuments: 'لا توجد مستندات مرفوعة بعد',
      uploadFile: 'رفع ملف',
      dragOrClick: 'اسحب ملفاً هنا أو انقر للاختيار',
      acceptedFormats: 'PDF, DOCX, TXT — حد أقصى 25 ميجابايت',
      processing: 'قيد المعالجة',
      ready: 'جاهز',
      failed: 'فشلت المعالجة',
      deleteDocument: 'حذف المستند',
      confirmDeleteDoc: 'هل أنت متأكد من حذف هذا المستند؟ سيتم حذف جميع الأجزاء المفهرسة.',
      fileSize: 'حجم الملف',
      chunks: 'أجزاء',
      uploadedOn: 'تاريخ الرفع',
      systemDefault: 'افتراضي النظام',
      retryProcessing: 'إعادة المعالجة',
      searchDocuments: 'البحث في المستندات',
    },

    errors: {
      somethingWentWrong: 'حدث خطأ ما',
      pageNotFound: 'الصفحة غير موجودة',
      unauthorized: 'غير مصرح',
      forbidden: 'الوصول مرفوض',
      serverError: 'خطأ في الخادم',
      networkError: 'خطأ في الاتصال',
      tryAgainLater: 'حاول مرة أخرى لاحقاً',
      contactSupport: 'تواصل مع الدعم الفني',
      sessionExpired: 'انتهت الجلسة، سجّل الدخول مرة أخرى',
      invalidInput: 'إدخال غير صحيح',
    },

    success: {
      saved: 'تم الحفظ',
      updated: 'تم التحديث',
      deleted: 'تم الحذف',
      created: 'تم الإنشاء',
      sent: 'تم الإرسال',
      copied: 'تم النسخ',
      downloaded: 'تم التحميل',
      uploaded: 'تم الرفع',
    },

    teacher: {
      selectTeacher: 'اختر معلمك',
      assignedTeacher: 'معلمك المخصص',
      growthMentor: 'مرشد النمو',
      primary: 'أساسي',
      mentor: 'مرشد',
      switchTeacher: 'تغيير المعلم',
      chatWith: 'تحدث مع',
      openFullChat: 'فتح المحادثة الكاملة',
      alwaysAvailable: 'متاح دائماً',
    },

    floatingBot: {
      quickChat: 'محادثة سريعة',
      askAnything: 'اسألني أي شيء...',
      greeting: 'كيف أقدر أساعدك؟',
      send: 'إرسال',
      thinking: 'يفكر...',
      pageContext: {
        dashboard: 'أنت في لوحة التحكم — اسألني عن تقدمك!',
        courses: 'أنت في الدورات — اسألني عن أي درس!',
        simulations: 'أنت في المحاكاة — اسألني عن أي سيناريو!',
        reports: 'أنت في التقارير — اسألني عن أداءك!',
        general: 'اسألني أي شيء عن الهندسة الكهروميكانيكية!',
      },
    },
  },

  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      save: 'Save',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      none: 'None',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      create: 'Create',
      submit: 'Submit',
      reset: 'Reset',
      continue: 'Continue',
      start: 'Start',
      stop: 'Stop',
      pause: 'Pause',
      resume: 'Resume',
      retry: 'Retry',
      skip: 'Skip',
      finish: 'Finish',
      complete: 'Complete',
      incomplete: 'Incomplete',
      active: 'Active',
      inactive: 'Inactive',
      enabled: 'Enabled',
      disabled: 'Disabled',
      yes: 'Yes',
      no: 'No',
      or: 'or',
      and: 'and',
      minutes: 'minutes',
      hours: 'hours',
      days: 'days',
      weeks: 'weeks',
      today: 'Today',
      yesterday: 'Yesterday',
      noResults: 'No results found',
      showMore: 'Show more',
      showLess: 'Show less',
    },

    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
      signingIn: 'Signing in...',
      login: 'Login',
      register: 'Register',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      email: 'Email',
      emailAddress: 'Email address',
      emailPlaceholder: 'you@example.com',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      fullName: 'Full Name',
      rememberMe: 'Remember me',
      welcomeBack: 'Welcome back',
      continueJourney: 'Sign in to continue your learning journey',
      createAccount: 'Create an account',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      newToPlatform: 'New to 2YStudy?',
      termsAgree: 'By signing in, you agree to our',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      loginSuccess: 'Successfully signed in',
      loginFailed: 'Login failed',
      registerSuccess: 'Account created successfully',
      invalidCredentials: 'Invalid credentials',
      passwordMismatch: 'Passwords do not match',
      passwordRequirements: 'Password must be at least 8 characters',
      emailRequired: 'Email is required',
      passwordRequired: 'Password is required',
      heroTitle: '2YStudy - AI-Powered Student Learning',
      heroDescription: 'Practice technical consultations, handle client objections, and perfect your presentations with our intelligent simulation platform.',
      studentsCount: '10,000+ Students',
      successRate: '95% Success Rate',
      poweredBy: 'Powered by advanced AI technology',
      // Register page
      startJourney: 'Start Your Journey to Learning Excellence',
      joinThousands: 'Join thousands of professional skills professionals who have transformed their careers.',
      createYourAccount: 'Create your account',
      startTrainingJourney: 'Start your learning journey today',
      creatingAccount: 'Creating account...',
      firstNamePlaceholder: 'John',
      lastNamePlaceholder: 'Doe',
      passwordStrong: 'Create a strong password',
      confirmPasswordPlaceholder: 'Confirm your password',
      freeTrialNoCreditCard: '14-day free trial - No credit card required',
      byCreatingAccount: 'By creating an account, you agree to our',
      // Benefits
      benefitAIPractice: 'AI-powered practice simulations',
      benefitFeedback: 'Personalized feedback and coaching',
      benefitAnalytics: 'Track progress with detailed analytics',
      benefitOwnPace: 'Learn at your own pace',
    },

    nav: {
      dashboard: 'Dashboard',
      dashboardDesc: 'Overview of your progress',
      courses: 'Learning Courses',
      coursesDesc: 'Learn from industry experts',
      simulations: 'Live Sessions',
      simulationsDesc: 'Interactive learning discussions',
      voicePractice: 'Voice Sessions',
      voicePracticeDesc: 'Learn through voice discussions',
      realtimeCall: 'Real-Time Call',
      realtimeCallDesc: 'Advanced voice conversation',
      aiTeacher: 'AI Teacher',
      aiTeacherDesc: 'Your personal learning mentor',
      reports: 'Reports',
      reportsDesc: 'Track your performance',
      admin: 'Admin',
      settings: 'Settings',
      profile: 'Profile',
      help: 'Help',
      home: 'Home',
    },

    landing: {
      brandName: '2YStudy',

      nav: {
        features: 'Features',
        howItWorks: 'How It Works',
        testimonials: 'Testimonials',
        pricing: 'Pricing',
        signIn: 'Sign In',
        getStarted: 'Get Started',
      },

      hero: {
        badge: 'AI-Powered Learning Platform',
        titlePart1: 'Build Real-World Skills with',
        titleHighlight: 'AI-Powered Simulations',
        description: 'Train on HVAC troubleshooting, PLC programming, electrical systems, and industrial maintenance through AI-driven simulations — track your progress with detailed performance analytics',
        startFreeTrial: 'Start Free Trial',
        watchDemo: 'See How It Works',
        noCreditCard: 'No credit card required',
        freeTrial: '14-day free trial',
        cancelAnytime: 'Cancel anytime',
      },

      stats: {
        activeStudents: 'Engineers Trained',
        successRate: 'Completion Rate',
        sessionsCompleted: 'Simulations Completed',
        userRating: 'Avg. Rating',
      },

      features: {
        title: 'Everything You Need to Master Professional Skills',
        subtitle: 'From HVAC and electrical systems to PLC programming and safety compliance — one platform covers it all',
        aiSimulations: {
          title: 'Troubleshooting Simulations',
          description: 'Practice diagnosing and resolving real-world HVAC, electrical, and PLC system faults in safe, AI-powered simulation environments',
        },
        voiceCalls: {
          title: 'Voice-Based Scenarios',
          description: 'Develop technical communication skills through live voice sessions with your AI mentor on real-world topics',
        },
        analytics: {
          title: 'Performance Analytics',
          description: 'Track skill development across HVAC, electrical, PLC, and safety domains with AI-generated insights and personalized recommendations',
        },
        courses: {
          title: 'Expert-Led Courses',
          description: 'Learn from industry professionals with structured courses covering HVAC systems, electrical systems, PLC programming, and industrial maintenance',
        },
        certifications: {
          title: 'Certification Preparation',
          description: 'Prepare for industry certifications including EPA 608, NATE, CMRT, and vendor-specific PLC credentials from Siemens and Allen-Bradley',
        },
        bilingual: {
          title: 'Safety & Compliance',
          description: 'Master lockout/tagout (LOTO) procedures, OSHA compliance, hazardous materials handling, and workplace safety through scenario-based training',
        },
      },

      howItWorks: {
        title: 'How It Works',
        subtitle: 'Three steps to accelerate your learning goals and bridge the skills gap',
        step1: {
          title: 'Assess Your Skills',
          description: 'Take a quick diagnostic assessment to identify your strengths and skill gaps across HVAC, electrical, PLC, and maintenance disciplines',
        },
        step2: {
          title: 'Learn & Simulate',
          description: 'Follow personalized learning paths with expert-led video courses and hands-on AI troubleshooting simulations',
        },
        step3: {
          title: 'Certify & Advance',
          description: 'Earn verified competency reports, prepare for industry certifications, and advance your learning goals',
        },
      },

      testimonials: {
        title: 'Trusted by Learning Teams',
        subtitle: 'See how students and teams are using 2YStudy to upskill faster and reduce downtime',
        items: [
          {
            quote: 'The troubleshooting simulations are incredibly realistic. Our new hires are getting up to speed 40% faster since we started using 2YStudy.',
            name: 'Michael Richardson',
            role: 'Maintenance Manager - Saudi Industrial Co.',
            initials: 'MR',
          },
          {
            quote: 'Finally, a learning platform that understands professional skills. The PLC and HVAC courses are practical and directly applicable to our daily work.',
            name: 'Jessica Palmer',
            role: 'Senior HVAC Technician - Riyadh',
            initials: 'SM',
          },
          {
            quote: 'We reduced unscheduled downtime by 25% after training our team on 2YStudy. The AI simulations prepare engineers for real scenarios.',
            name: "Kevin O'Brien",
            role: 'Plant Operations Director',
            initials: 'KA',
          },
        ],
      },

      pricing: {
        title: 'Flexible Pricing Plans',
        subtitle: 'Choose the plan that fits your team size and start building competency today',
        perMonth: 'month',
        mostPopular: 'Most Popular',
        getStarted: 'Get Started Free',
        startTrial: 'Start Trial',
        contactSales: 'Contact Us',
        free: {
          name: 'Starter',
          description: 'Perfect for individual engineers',
          price: '$0',
          features: [
            '3 simulation sessions/month',
            '2 training courses',
            'Basic skill reports',
            'Email support',
          ],
        },
        pro: {
          name: 'Professional',
          description: 'For serious professionals',
          price: '$49',
          features: [
            'Unlimited simulations',
            'All training courses',
            'Voice-based scenarios',
            'Advanced performance analytics',
            'Certification prep modules',
            'Priority support',
          ],
        },
        enterprise: {
          name: 'Enterprise',
          description: 'For teams and organizations',
          price: 'Contact Us',
          features: [
            'All Pro features',
            'Admin dashboard & team management',
            'Team performance reports',
            'Custom simulation scenarios',
            'Dedicated account manager',
            'Onboarding & workforce development',
          ],
        },
      },

      cta: {
        title: 'Ready to Bridge the Skills Gap?',
        description: 'Join student teams using AI-powered simulations to train faster, reduce downtime, and build real-world competency',
        button: 'Start Your Free Trial Now',
      },

      footer: {
        description: 'AI-powered learning platform for students — HVAC, electrical systems, PLC programming, and industrial maintenance',
        product: 'Product',
        company: 'Company',
        legal: 'Legal',
        courses: 'Courses',
        simulations: 'Live Sessions',
        about: 'About Us',
        blog: 'Blog',
        careers: 'Careers',
        contact: 'Contact',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        cookies: 'Cookie Policy',
        allRightsReserved: 'All rights reserved',
      },
    },

    diagnostic: {
      assessmentNeeded: 'Skill Assessment Needed',
      assessmentNeededDesc: 'Analyze your performance to get personalized learning recommendations',
      runAssessment: 'Analyze My Level',
      skillProfile: 'Skill Profile',
      overallScore: 'Overall Score',
      refresh: 'Refresh',
      assessmentGateway: 'Daily Skill Assessment',
      assessmentGatewayDesc: 'Complete a quick assessment to personalize your learning',
      startAssessment: 'Start Assessment',
      step1Title: 'Voice Call',
      step1Desc: 'Practice a real-time phone call with your AI mentor',
      step2Title: 'Text Discussion',
      step2Desc: 'Discuss topics with your AI mentor via chat',
      continueAssessment: 'Continue Assessment',
      skipVoice: 'Skip Voice Learning',
      generating: 'Generating your skill report...',
      reportReady: 'Your Skill Report is Ready!',
      continueToDashboard: 'Continue to Dashboard',
      recommendedForYou: 'Recommended for You',
      basedOnAssessment: 'Based on your skill assessment',
      stepOf: 'Step',
      evaluatorGenerating: 'Generating detailed evaluation...',
      assignedTeacher: 'Your Assigned Teacher',
      detailedAnalysis: 'Detailed Skill Analysis',
      improvementPlan: 'Improvement Plan',
      shortTerm: 'Short-term (1-2 weeks)',
      mediumTerm: 'Medium-term (1-2 months)',
      longTerm: 'Long-term (3+ months)',
      overallNarrative: 'Overall Evaluation',
      yourTeacher: 'Your Teacher',
      weak: 'Weak',
      developing: 'Developing',
      competent: 'Competent',
      strong: 'Strong',
      excellent: 'Excellent',
    },

    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of your training progress',
      welcome: 'Welcome Back!',
      continueJourney: 'Continue your learning journey today',
      overallProgress: 'Overall Progress',
      averageScore: 'Average Score',
      currentStreak: 'Current Streak',
      timeInvested: 'Time Invested',
      thisWeek: 'this week',
      acrossAssessments: 'across all assessments',
      keepItGoing: 'Keep up the great work!',
      minutesTotal: 'minutes total',
      days: 'days',
      continueLearning: 'Continue Learning',
      pickUpWhereYouLeft: 'Pick up where you left off in your last course',
      negotiationFundamentals: 'Student Fundamentals',
      module3: 'Module 3 - Technical Communication',
      complete: 'complete',
      continueCourse: 'Continue Course',
      practiceSimulations: 'Live Learning Sessions',
      sharpenSkills: 'Discuss learning topics with your AI mentor',
      recommendedScenario: 'Recommended Topic',
      priceNegotiation: 'Electrical Systems & Circuits - Intermediate',
      basedOnPerformance: 'Based on your recent performance',
      startSimulation: 'Start Session',
      voicePractice: 'Voice Sessions',
      practiceWithAI: 'Learn through voice discussions with your AI mentor',
      realtimeConversation: 'Live Voice Session',
      voiceCallDescription: 'Discuss learning topics with your AI mentor via voice',
      newFeature: 'New Feature',
      startVoiceCall: 'Start Session',
      yourProgress: 'Your Progress',
      viewDetailedAnalytics: 'Track your stats and detailed results',
      simulations: 'Sessions',
      courses: 'Courses',
      voiceCalls: 'Voice Sessions',
      avgScore: 'Avg Score',
      viewReports: 'View Reports',
    },

    courses: {
      title: 'Learning Courses',
      subtitle: 'Build your skills with expert-led courses',
      searchPlaceholder: 'Search courses...',
      allCategories: 'All Categories',
      allLevels: 'All Levels',
      coursesAvailable: 'courses available',
      hours: 'h',
      minutes: 'm',
      categories: {
        fundamentals: 'Student Fundamentals',
        hvac: 'HVAC Systems',
        electrical: 'Electrical Systems',
        plcAutomation: 'PLC & Automation',
        maintenance: 'Industrial Maintenance',
        safety: 'Safety & Compliance',
      },
      difficulty: {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
      },
      noCourses: 'No courses found',
      adjustFilters: 'Try adjusting your search or filters',
      startLearning: 'Start Learning',
      continueLearning: 'Continue Learning',
      completed: 'Completed',
      inProgress: 'In Progress',
      notStarted: 'Not Started',
      lessons: 'lessons',
      duration: 'Duration',
      enrolled: 'Enrolled',
      progress: 'Progress',
      certificate: 'Certificate',
      courseDetails: 'Course Details',
      whatYouLearn: 'What You\'ll Learn',
      requirements: 'Requirements',
      description: 'Description',
      instructor: 'Instructor',
      reviews: 'Reviews',
      relatedCourses: 'Related Courses',
    },

    simulations: {
      title: 'Live Sessions',
      subtitle: 'Join interactive learning sessions with your AI mentor',
      chooseScenario: 'Choose Topic',
      chooseMode: 'Choose Session Mode',
      selectModeDescription: 'Select how you want to interact with your AI mentor',
      chatMode: 'Text Discussion',
      voiceMode: 'Live Voice Session',
      chatModeDescription: 'Discuss learning topics via text with your AI mentor',
      voiceModeDescription: 'Real-time voice conversation with your AI mentor',
      voiceCallInArabic: 'In Arabic',
      backToScenarios: 'Back to Topics',
      scenarios: {
        propertyShowing: 'HVAC Systems & Troubleshooting',
        priceNegotiation: 'Electrical Systems & Circuits',
        objectionHandling: 'Safety Procedures & Compliance',
        firstContact: 'PLC Programming Fundamentals',
        closingDeal: 'Industrial Maintenance Planning',
        difficultClient: 'Advanced Troubleshooting',
        // New engineering keys
        hvacSystems: 'HVAC Systems & Troubleshooting',
        electricalSystems: 'Electrical Systems & Circuits',
        safetyCompliance: 'Safety Procedures & Compliance',
        plcAutomation: 'PLC Programming & Automation',
        industrialMaintenance: 'Industrial Maintenance Planning',
        advancedTroubleshooting: 'Advanced Troubleshooting',
        motorControls: 'Motor Controls & VFD Systems',
        bmsSystems: 'Building Management Systems',
      },
      scenarioDescriptions: {
        propertyShowing: 'Learn HVAC system components, refrigeration cycles, and common troubleshooting techniques',
        priceNegotiation: 'Discuss electrical circuit design, power distribution, and fault diagnosis methods',
        objectionHandling: 'Review OSHA standards, lockout/tagout procedures, and workplace safety protocols',
        firstContact: 'Explore PLC ladder logic, I/O configuration, and basic automation programming',
        closingDeal: 'Plan preventive maintenance schedules, equipment lifecycle, and reliability strategies',
        difficultClient: 'Tackle complex multi-system failures and root cause analysis techniques',
        // New engineering keys
        hvacSystems: 'Learn HVAC system components, refrigeration cycles, and common troubleshooting techniques',
        electricalSystems: 'Discuss electrical circuit design, power distribution, and fault diagnosis methods',
        safetyCompliance: 'Review OSHA standards, lockout/tagout procedures, and workplace safety protocols',
        plcAutomation: 'Explore PLC ladder logic, I/O configuration, and basic automation programming',
        industrialMaintenance: 'Plan preventive maintenance schedules, equipment lifecycle, and reliability strategies',
        advancedTroubleshooting: 'Tackle complex multi-system failures and root cause analysis techniques',
        motorControls: 'Learn motor control circuits, variable frequency drives, and protection systems',
        bmsSystems: 'Explore building management systems, environmental controls, and system integration',
      },
      difficulty: {
        easy: 'Beginner',
        medium: 'Intermediate',
        hard: 'Advanced',
      },
      difficultyLevel: 'Skill Level',
      startSimulation: 'Start Session',
      configureSession: 'Configure your learning session settings',
      selected: 'Selected',
      starting: 'Starting...',
      endSimulation: 'End Session',
      simulationComplete: 'Session Complete!',
      yourScore: 'Your Score',
      feedback: 'Feedback',
      strengths: 'Strengths',
      improvements: 'Areas for Improvement',
      tryAgain: 'Try Again',
      nextScenario: 'Next Topic',
      viewDetailedReport: 'View Detailed Report',
      timeElapsed: 'Time Elapsed',
      messagesExchanged: 'Messages Exchanged',
      clientSentiment: 'Mentor Assessment',
      positive: 'Excellent',
      neutral: 'Good',
      negative: 'Needs Work',
    },

    voiceCall: {
      title: 'Voice Sessions',
      subtitle: 'Learn through voice discussions with your AI mentor',
      startCall: 'Start Call',
      endCall: 'End Call',
      connecting: 'Connecting...',
      listening: 'Listening...',
      speaking: 'Speaking',
      thinking: 'Thinking...',
      tapToSpeak: 'Tap to speak',
      tapToInterrupt: 'Tap to interrupt',
      callEnded: 'Call Ended!',
      duration: 'Duration',
      messages: 'messages',
      summary: 'Conversation Summary',
      performance: 'Performance Metrics',
      tryAgain: 'Practice Again',
      micPermissionError: 'Please allow microphone access',
      didntHear: "Didn't hear you",
      pleaseRepeat: 'Could you repeat that?',
      stillThere: 'Are you still there?',
      callInProgress: 'Call in progress',
      preparing: 'Preparing...',
      ready: 'Ready',
      // New fields for realtime-call
      evaluation: 'Evaluation',
      overallScore: 'Overall Score',
      communication: 'Communication',
      knowledge: 'Knowledge',
      professionalism: 'Professionalism',
      engagement: 'Engagement',
      strengths: 'Strengths',
      areasToImprove: 'Areas to Improve',
      userSpeaking: 'Speaking...',
    },

    scenarios: {
      selectScenario: 'Select Topic',
      selectDescription: 'Choose the learning topic you want to discuss with your AI mentor',
      propertyShowing: 'HVAC Systems & Troubleshooting',
      propertyShowingDesc: 'Discuss HVAC components, refrigeration cycles, and troubleshooting techniques',
      priceNegotiation: 'Electrical Systems & Circuits',
      priceNegotiationDesc: 'Explore electrical circuit design, power distribution, and fault diagnosis',
      firstContact: 'PLC Programming Fundamentals',
      firstContactDesc: 'Learn PLC ladder logic, I/O configuration, and automation programming basics',
      objectionHandling: 'Safety Procedures & Compliance',
      objectionHandlingDesc: 'Review OSHA standards, lockout/tagout procedures, and safety protocols',
      closingDeal: 'Industrial Maintenance Planning',
      closingDealDesc: 'Plan preventive maintenance schedules and equipment reliability strategies',
    },

    reports: {
      title: 'Performance Reports',
      subtitle: 'Track your progress and identify areas for improvement',
      totalSessions: 'Total Sessions',
      averageScore: 'Average Score',
      improvement: 'Improvement',
      topSkill: 'Top Skill',
      skillPerformance: 'Skill Performance',
      scoreProgression: 'Score Progression',
      sessionHistory: 'Session History',
      allSessions: 'All completed sessions',
      recommendations: 'Personalized Recommendations',
      focusAreas: 'Focus Areas',
      suggestedCourses: 'Suggested Courses',
      exportReport: 'Export Report',
      dateRange: 'Date Range',
      lastWeek: 'Last Week',
      lastMonth: 'Last Month',
      last3Months: 'Last 3 Months',
      allTime: 'All Time',
      noData: 'Not enough data',
      excellentProgress: 'Excellent progress!',
      goodProgress: 'Good progress',
      needsImprovement: 'Needs improvement',
      performanceOverview: 'Performance Overview',
      skillBreakdown: 'Skill Breakdown',
      trendAnalysis: 'Trend Analysis',
      failedToLoad: 'Failed to load reports',
      exportFailed: 'Export failed',
      noDataToExport: 'No data to export',
      minutes: 'minutes',
      priority: {
        high: 'High',
        medium: 'Medium',
        low: 'Low',
      },
      refresh: 'Refresh',
      exportCSV: 'Export CSV',
      exportPDF: 'Export PDF',
      completedSimulations: 'completed simulations',
      acrossAllScenarios: 'across all scenarios',
      pointsSinceStart: 'points since start',
      keepPracticing: 'Keep practicing!',
      yourStrongestArea: 'Your strongest area',
      performanceAcrossAreas: 'Your performance across different areas',
      benchmark: 'Benchmark',
      completeSimulations: 'Complete some simulations to see your data',
      performanceOverTime: 'Performance Over Time',
      monthsTracked: 'months tracked',
      totalSessionsLabel: 'sessions',
      completeMoreSimulations: 'Complete more simulations to see your trends',
      skillRadar: 'Skill Radar',
      visualComparison: 'Visual comparison of your skills',
      allCompletedSessions: 'All completed sessions',
      filterByScenario: 'Filter by scenario',
      allScenarios: 'All scenarios',
      previous: 'Previous',
      page: 'Page',
      of: 'of',
      next: 'Next',
      noSessions: 'No sessions yet',
      personalizedRecommendations: 'Personalized Recommendations',
      aiSuggestions: 'AI suggestions based on your performance',
      completeMoreForRecommendations: 'Complete more simulations to get recommendations',
      viewCourse: 'View Course',
      greatJob: 'Great job!',
      keepPracticingMessage: 'Keep practicing to maintain your high level',
    },

    admin: {
      title: 'Admin Dashboard',
      subtitle: 'Overview of team performance and activity',
      totalUsers: 'Total Users',
      teamAverage: 'Team Average',
      totalSessionsAdmin: 'Total Sessions',
      avgSessionsPerUser: 'Avg Sessions/User',
      performanceLeaders: 'Performance Leaders',
      topPerformers: 'Top Performers',
      needsAttention: 'Needs Attention',
      recentActivity: 'Recent Activity',
      userManagement: 'User Management',
      addUser: 'Add User',
      editUser: 'Edit User',
      deleteUser: 'Delete User',
      viewDetails: 'View Details',
      employeeList: 'Employee List',
      searchEmployees: 'Search employees...',
      activeUsers: 'Active Users',
      inactiveUsers: 'Inactive',
      lastActive: 'Last Active',
      sessionsCount: 'Sessions',
      averageScoreAdmin: 'Avg Score',
      monthlyTrends: 'Monthly Trends',
      teamPerformance: 'Team Performance',
    },

    personas: {
      saudiClient: 'Senior Engineer Mentor',
      skepticalBuyer: 'Safety Compliance Expert',
      firstTimeBuyer: 'HVAC Specialist Mentor',
      investor: 'Facility Manager Mentor',
      familyBuyer: 'Industrial Systems Expert',
    },

    notifications: {
      title: 'Notifications',
      markAllRead: 'Mark all as read',
      noNotifications: 'No notifications',
      newCourseAvailable: 'New course available',
      achievementUnlocked: 'Achievement unlocked',
      weeklyReport: 'Your weekly report is ready',
      reminderToPractice: 'Time to practice!',
    },

    settings: {
      title: 'Settings',
      language: 'Language',
      theme: 'Theme',
      lightMode: 'Light',
      darkMode: 'Dark',
      systemMode: 'System',
      systemDefault: 'System',
      notifications: 'Notifications',
      emailNotifications: 'Email Notifications',
      pushNotifications: 'Push Notifications',
      soundEffects: 'Sound Effects',
      autoPlayAudio: 'Auto-play Audio',
      account: 'Account',
      changePassword: 'Change Password',
      deleteAccount: 'Delete Account',
      privacy: 'Privacy',
      dataExport: 'Export Data',
    },

    quiz: {
      title: 'Quizzes',
      quizzes: 'Quizzes',
      quizzesDesc: 'Test your knowledge',
      availableQuizzes: 'Available Quizzes',
      myAttempts: 'My Attempts',
      takeQuiz: 'Take Quiz',
      startQuiz: 'Start Quiz',
      submitQuiz: 'Submit Quiz',
      retakeQuiz: 'Retake Quiz',
      viewResults: 'View Results',
      questions: 'Questions',
      question: 'Question',
      of: 'of',
      timeLimit: 'Time Limit',
      noTimeLimit: 'No Time Limit',
      passingScore: 'Passing Score',
      difficulty: 'Difficulty',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      score: 'Score',
      passed: 'Passed',
      failed: 'Failed',
      correct: 'Correct',
      incorrect: 'Incorrect',
      unanswered: 'Unanswered',
      explanation: 'Explanation',
      timeSpent: 'Time Spent',
      attempts: 'Attempts',
      maxAttempts: 'Max Attempts',
      unlimited: 'Unlimited',
      noQuizzesAvailable: 'No quizzes available at the moment',
      noAttemptsYet: 'You have not attempted any quizzes yet',
      quizCompleted: 'Quiz Completed',
      congratulations: 'Congratulations!',
      tryAgain: 'Try Again',
      reviewAnswers: 'Review Answers',
      nextQuestion: 'Next Question',
      previousQuestion: 'Previous Question',
      confirmSubmit: 'Confirm Submission',
      confirmSubmitDesc: 'Are you sure you want to submit your answers? This action cannot be undone.',
      manageQuizzes: 'Manage Quizzes',
      createQuiz: 'Create Quiz',
      editQuiz: 'Edit Quiz',
      deleteQuiz: 'Delete Quiz',
      publishQuiz: 'Publish Quiz',
      unpublishQuiz: 'Unpublish Quiz',
      published: 'Published',
      draft: 'Draft',
      quizTitle: 'Quiz Title',
      quizDescription: 'Quiz Description',
      addQuestion: 'Add Question',
      removeQuestion: 'Remove Question',
      addOption: 'Add Option',
      removeOption: 'Remove Option',
      markCorrect: 'Mark as Correct',
      questionText: 'Question Text',
      optionText: 'Option Text',
      generateWithAI: 'Generate with AI',
      generating: 'Generating...',
      topic: 'Topic',
      numberOfQuestions: 'Number of Questions',
      viewAttempts: 'View Attempts',
      studentAttempts: 'Student Attempts',
      noAttempts: 'No attempts yet',
      questionCount: 'Questions',
      attemptCount: 'Attempts',
      manual: 'Manual',
      aiGenerated: 'AI Generated',
      createdAt: 'Created',
      confirmDelete: 'Confirm Delete',
      confirmDeleteDesc: 'Are you sure you want to delete this quiz? This action cannot be undone.',
    },

    flashcard: {
      title: 'Flashcards',
      flashcards: 'Flashcards',
      description: 'Learn with flashcards using spaced repetition',
      decks: 'Decks',
      cards: 'Cards',
      front: 'Front',
      back: 'Back',
      hint: 'Hint',
      deck: 'Deck',
      card: 'Card',
      createDeck: 'Create Deck',
      editDeck: 'Edit Deck',
      deleteDeck: 'Delete Deck',
      publishDeck: 'Publish Deck',
      unpublishDeck: 'Unpublish',
      addCard: 'Add Card',
      editCard: 'Edit Card',
      deleteCard: 'Delete Card',
      manageDecks: 'Manage Decks',
      availableDecks: 'Available Decks',
      study: 'Study',
      startStudy: 'Start Study',
      flipCard: 'Flip Card',
      showAnswer: 'Show Answer',
      rateRecall: 'Rate Your Recall',
      nextCard: 'Next Card',
      sessionComplete: 'Session Complete',
      cardsReviewed: 'Cards Reviewed',
      dueToday: 'Due Today',
      mastered: 'Mastered',
      studying: 'Studying',
      newCards: 'New Cards',
      progress: 'Progress',
      totalCards: 'Total Cards',
      studiedCards: 'Cards Studied',
      masteredCards: 'Cards Mastered',
      noDecks: 'No flashcard decks available',
      noDueCards: 'No cards due for review',
      category: 'Category',
      generateWithAI: 'Generate with AI',
      aiGenerated: 'AI Generated',
      manual: 'Manual',
      topic: 'Topic',
      numberOfCards: 'Number of Cards',
      generate: 'Generate',
      quality0: 'Blackout',
      quality1: 'Wrong, recognized',
      quality2: 'Wrong, easy recall',
      quality3: 'Correct, hard',
      quality4: 'Correct, hesitation',
      quality5: 'Perfect',
      confirmDelete: 'Confirm Delete',
      confirmDeleteDesc: 'Are you sure you want to delete this deck? This action cannot be undone.',
    },

    brain: {
      title: 'AI Brain',
      subtitle: 'Knowledge base for AI training',
      uploadDocument: 'Upload Document',
      documents: 'Documents',
      noDocuments: 'No documents uploaded yet',
      uploadFile: 'Upload File',
      dragOrClick: 'Drag a file here or click to browse',
      acceptedFormats: 'PDF, DOCX, TXT — Max 25MB',
      processing: 'Processing',
      ready: 'Ready',
      failed: 'Failed',
      deleteDocument: 'Delete Document',
      confirmDeleteDoc: 'Are you sure you want to delete this document? All indexed chunks will be removed.',
      fileSize: 'File Size',
      chunks: 'Chunks',
      uploadedOn: 'Uploaded',
      systemDefault: 'System Default',
      retryProcessing: 'Retry Processing',
      searchDocuments: 'Search documents',
    },

    errors: {
      somethingWentWrong: 'Something went wrong',
      pageNotFound: 'Page not found',
      unauthorized: 'Unauthorized',
      forbidden: 'Access denied',
      serverError: 'Server error',
      networkError: 'Network error',
      tryAgainLater: 'Please try again later',
      contactSupport: 'Contact support',
      sessionExpired: 'Session expired, please sign in again',
      invalidInput: 'Invalid input',
    },

    success: {
      saved: 'Saved successfully',
      updated: 'Updated successfully',
      deleted: 'Deleted successfully',
      created: 'Created successfully',
      sent: 'Sent successfully',
      copied: 'Copied to clipboard',
      downloaded: 'Downloaded successfully',
      uploaded: 'Uploaded successfully',
    },

    teacher: {
      selectTeacher: 'Choose Your Teacher',
      assignedTeacher: 'Your Assigned Teacher',
      growthMentor: 'Growth Mentor',
      primary: 'Primary',
      mentor: 'Mentor',
      switchTeacher: 'Switch Teacher',
      chatWith: 'Chat with',
      openFullChat: 'Open Full Chat',
      alwaysAvailable: 'Always Available',
    },

    floatingBot: {
      quickChat: 'Quick Chat',
      askAnything: 'Ask me anything...',
      greeting: 'How can I help?',
      send: 'Send',
      thinking: 'Thinking...',
      pageContext: {
        dashboard: "You're on the Dashboard — ask me about your progress!",
        courses: "You're on Courses — ask me about any lesson!",
        simulations: "You're on Simulations — ask me about any scenario!",
        reports: "You're on Reports — ask me about your performance!",
        general: 'Ask me anything about professional skills!',
      },
    },
  },
};

interface LanguageContextType {
  language: Language;
  config: LanguageConfig;
  t: Translations;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // TEMPORARY: Force English only — Arabic is preserved but disabled
  // To re-enable Arabic, change default back to 'ar' and uncomment localStorage loading below
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  // Load saved language preference
  useEffect(() => {
    setMounted(true);
    // TEMPORARY: Force English — ignore saved preference
    // const saved = localStorage.getItem('language') as Language;
    // if (saved && (saved === 'ar' || saved === 'en')) {
    //   setLanguageState(saved);
    //   document.documentElement.dir = LANGUAGE_CONFIGS[saved].dir;
    //   document.documentElement.lang = saved;
    // }
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
    localStorage.setItem('language', 'en');
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);

    // Update document direction and language
    document.documentElement.dir = LANGUAGE_CONFIGS[lang].dir;
    document.documentElement.lang = lang;
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  }, [language, setLanguage]);

  const value: LanguageContextType = {
    language,
    config: LANGUAGE_CONFIGS[language],
    t: TRANSLATIONS[language],
    setLanguage,
    toggleLanguage,
    isRTL: LANGUAGE_CONFIGS[language].dir === 'rtl',
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Helper hook for direction-aware styling
export function useDir(): 'rtl' | 'ltr' {
  const { config } = useLanguage();
  return config.dir;
}

// Helper hook to check if RTL
export function useIsRTL(): boolean {
  const { isRTL } = useLanguage();
  return isRTL;
}
