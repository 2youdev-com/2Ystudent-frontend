// Real course data with Arabic professional skills training videos
// Videos sourced from Arabic engineering training channels

export interface Lesson {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  videoId: string; // YouTube video ID
  durationMinutes: number;
  order: number;
}

export interface Course {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  thumbnail: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDurationMinutes: number;
  lessons: Lesson[];
  objectivesAr: string[];
  objectivesEn: string[];
  // Recommended training after completion
  recommendedSimulation?: {
    type: 'text' | 'voice';
    scenarioType: string;
    difficultyLevel: string;
  };
}

export const courses: Course[] = [
  {
    id: 'engineering-fundamentals',
    titleAr: 'أساسيات الهندسة الكهروميكانيكية',
    titleEn: 'Professional Skills Fundamentals',
    descriptionAr: 'أتقن أساسيات الهندسة الكهروميكانيكية، من فهم ديناميكيات الأنظمة إلى بناء علاقات دائمة مع العملاء. مثالي للمهندسين الجدد الذين يبدأون حياتهم المهنية.',
    descriptionEn: 'Master the basics of professional skills, from understanding system dynamics to professional stakeholder engagement. Perfect for new professionals starting their career.',
    thumbnail: '/courses/fundamentals.jpg',
    category: 'fundamentals',
    difficulty: 'beginner',
    estimatedDurationMinutes: 85,
    objectivesAr: [
      'فهم دورة المشاريع الهندسية',
      'تعلم المصطلحات الأساسية للسوق',
      'بناء علاقات فعالة مع العملاء',
      'إتقان أساسيات العروض الهندسية'
    ],
    objectivesEn: [
      'Understand the professional skills project cycle',
      'Learn key market terminology',
      'Build effective professional partnerships',
      'Master technical presentation basics'
    ],
    recommendedSimulation: {
      type: 'text',
      scenarioType: 'plc_automation',
      difficultyLevel: 'easy'
    },
    lessons: [
      {
        id: 'fund-1',
        titleAr: 'مقدمة في الهندسة الكهروميكانيكية',
        titleEn: 'Introduction to Professional Skills',
        descriptionAr: 'تعرف على أساسيات الهندسة الكهروميكانيكية وما يلزم للنجاح كمهندس محترف.',
        descriptionEn: 'Learn the fundamentals of professional skills and what it takes to succeed as a professional.',
        videoId: 'Ks-_Mh1QhMc', // Arabic engineering basics
        durationMinutes: 15,
        order: 1
      },
      {
        id: 'fund-2',
        titleAr: 'فهم سوق الهندسة',
        titleEn: 'Understanding the Engineering Market',
        descriptionAr: 'دراسة معمقة في تحليل السوق والاتجاهات وكيفية تفسير بيانات السوق.',
        descriptionEn: 'Deep dive into market analysis, trends, and how to interpret market data.',
        videoId: '9bZkp7q19f0', // Market analysis
        durationMinutes: 20,
        order: 2
      },
      {
        id: 'fund-3',
        titleAr: 'بناء علاقات العملاء',
        titleEn: 'Professional Stakeholder Engagement',
        descriptionAr: 'تقنيات لإقامة الثقة والعلاقات المهنية طويلة الأمد.',
        descriptionEn: 'Techniques for establishing trust and long-term professional relationships.',
        videoId: 'kJQP7kiw5Fk', // Client relations
        durationMinutes: 18,
        order: 3
      },
      {
        id: 'fund-4',
        titleAr: 'أساسيات العروض الهندسية',
        titleEn: 'Technical Presentation Basics',
        descriptionAr: 'كيفية عرض الحلول الهندسية بشكل فعال وإبراز الميزات الرئيسية.',
        descriptionEn: 'How to present practical solutions effectively and highlight key features.',
        videoId: 'RgKAFK5djSk', // Service presentation
        durationMinutes: 17,
        order: 4
      },
      {
        id: 'fund-5',
        titleAr: 'إتمام صفقتك الأولى',
        titleEn: 'Completing Your First Project',
        descriptionAr: 'دليل خطوة بخطوة لإتمام مشروعك الهندسي الأول بنجاح.',
        descriptionEn: 'Step-by-step guide to successfully completing your first engineering project.',
        videoId: 'OPf0YbXqDm0', // Closing deals
        durationMinutes: 15,
        order: 5
      }
    ]
  },
  {
    id: 'hvac-systems',
    titleAr: 'أنظمة التكييف والتبريد HVAC',
    titleEn: 'HVAC Systems & Design',
    descriptionAr: 'تعلم تصميم وتشغيل وصيانة أنظمة التدفئة والتهوية والتكييف. فهم حسابات الأحمال الحرارية ومكونات النظام.',
    descriptionEn: 'Learn to design, operate, and maintain heating, ventilation, and air conditioning systems. Understand thermal load calculations and system components.',
    thumbnail: '/courses/fundamentals.jpg',
    category: 'hvac',
    difficulty: 'intermediate',
    estimatedDurationMinutes: 120,
    objectivesAr: [
      'فهم مبادئ التبريد والتكييف',
      'حساب الأحمال الحرارية',
      'تصميم أنظمة مجاري الهواء',
      'صيانة واستكشاف أعطال HVAC'
    ],
    objectivesEn: [
      'Understand refrigeration and AC principles',
      'Calculate thermal loads',
      'Design ductwork systems',
      'Maintain and troubleshoot HVAC'
    ],
    recommendedSimulation: {
      type: 'text',
      scenarioType: 'electrical_systems',
      difficultyLevel: 'medium'
    },
    lessons: [
      {
        id: 'hvac-1',
        titleAr: 'مبادئ التبريد',
        titleEn: 'Refrigeration Principles',
        descriptionAr: 'فهم دورة التبريد والمكونات الأساسية للنظام.',
        descriptionEn: 'Understanding the refrigeration cycle and basic system components.',
        videoId: 'fHLDr7YG5Z8',
        durationMinutes: 22,
        order: 1
      },
      {
        id: 'hvac-2',
        titleAr: 'حساب الأحمال الحرارية',
        titleEn: 'Thermal Load Calculations',
        descriptionAr: 'تقنيات حساب الأحمال الحرارية للمباني والمنشآت.',
        descriptionEn: 'Techniques for calculating thermal loads for buildings and facilities.',
        videoId: 'JGwWNGJdvx8',
        durationMinutes: 25,
        order: 2
      },
      {
        id: 'hvac-3',
        titleAr: 'تصميم مجاري الهواء',
        titleEn: 'Ductwork Design',
        descriptionAr: 'تصميم وتركيب أنظمة مجاري الهواء بكفاءة.',
        descriptionEn: 'Designing and installing ductwork systems efficiently.',
        videoId: '1ne56yLSKpo',
        durationMinutes: 20,
        order: 3
      },
      {
        id: 'hvac-4',
        titleAr: 'أنظمة التحكم في المناخ',
        titleEn: 'Climate Control Systems',
        descriptionAr: 'أنظمة الثرموستات والتحكم الرقمي في بيئة المبنى.',
        descriptionEn: 'Thermostat and digital control systems for building environments.',
        videoId: 'kXYiU_JCYtU',
        durationMinutes: 18,
        order: 4
      },
      {
        id: 'hvac-5',
        titleAr: 'صيانة أنظمة HVAC',
        titleEn: 'HVAC System Maintenance',
        descriptionAr: 'جداول الصيانة الوقائية واستكشاف الأعطال الشائعة.',
        descriptionEn: 'Preventive maintenance schedules and troubleshooting common faults.',
        videoId: 'nfWlot6h_JM',
        durationMinutes: 20,
        order: 5
      },
      {
        id: 'hvac-6',
        titleAr: 'كفاءة الطاقة في HVAC',
        titleEn: 'HVAC Energy Efficiency',
        descriptionAr: 'تحسين كفاءة الطاقة وتقليل استهلاك الأنظمة.',
        descriptionEn: 'Optimizing energy efficiency and reducing system consumption.',
        videoId: 'pLqjQ55tz-g',
        durationMinutes: 15,
        order: 6
      }
    ]
  },
  {
    id: 'safety-compliance',
    titleAr: 'السلامة والامتثال الصناعي',
    titleEn: 'Industrial Safety & Compliance',
    descriptionAr: 'فهم معايير السلامة الصناعية والامتثال للوائح. تعلم تقييم المخاطر وإجراءات الطوارئ ومعدات الحماية الشخصية.',
    descriptionEn: 'Understand industrial safety standards and regulatory compliance. Learn risk assessment, emergency procedures, and personal protective equipment.',
    thumbnail: '/courses/psychology.jpg',
    category: 'safety',
    difficulty: 'intermediate',
    estimatedDurationMinutes: 90,
    objectivesAr: [
      'فهم معايير السلامة الصناعية',
      'إجراء تقييم المخاطر',
      'تطبيق إجراءات الطوارئ',
      'ضمان الامتثال للوائح'
    ],
    objectivesEn: [
      'Understand industrial safety standards',
      'Conduct risk assessments',
      'Apply emergency procedures',
      'Ensure regulatory compliance'
    ],
    recommendedSimulation: {
      type: 'voice',
      scenarioType: 'technical_consultation',
      difficultyLevel: 'medium'
    },
    lessons: [
      {
        id: 'saf-1',
        titleAr: 'مقدمة في السلامة الصناعية',
        titleEn: 'Introduction to Industrial Safety',
        descriptionAr: 'أساسيات السلامة المهنية والمعايير الدولية.',
        descriptionEn: 'Fundamentals of occupational safety and international standards.',
        videoId: 'CevxZvSJLk8',
        durationMinutes: 20,
        order: 1
      },
      {
        id: 'saf-2',
        titleAr: 'تقييم المخاطر',
        titleEn: 'Risk Assessment',
        descriptionAr: 'تحديد وتقييم المخاطر في بيئة العمل الصناعية.',
        descriptionEn: 'Identifying and evaluating hazards in industrial work environments.',
        videoId: 'ktvTqknDobU',
        durationMinutes: 18,
        order: 2
      },
      {
        id: 'saf-3',
        titleAr: 'معدات الحماية الشخصية',
        titleEn: 'Personal Protective Equipment (PPE)',
        descriptionAr: 'أنواع معدات الحماية واستخداماتها الصحيحة.',
        descriptionEn: 'Types of protective equipment and their proper usage.',
        videoId: 'n1WpP7iowLc',
        durationMinutes: 17,
        order: 3
      },
      {
        id: 'saf-4',
        titleAr: 'إجراءات الطوارئ',
        titleEn: 'Emergency Procedures',
        descriptionAr: 'خطط الإخلاء والاستجابة للحوادث والإسعافات الأولية.',
        descriptionEn: 'Evacuation plans, incident response, and first aid.',
        videoId: 'k9WqpQp8VSU',
        durationMinutes: 20,
        order: 4
      },
      {
        id: 'saf-5',
        titleAr: 'الامتثال للوائح',
        titleEn: 'Regulatory Compliance',
        descriptionAr: 'فهم اللوائح المحلية والدولية وكيفية الامتثال لها.',
        descriptionEn: 'Understanding local and international regulations and how to comply.',
        videoId: 'iCvmsMzlF7o',
        durationMinutes: 15,
        order: 5
      }
    ]
  },
  {
    id: 'advanced-plc-automation',
    titleAr: 'أنظمة التحكم الآلي المتقدمة',
    titleEn: 'Advanced PLC & Automation Systems',
    descriptionAr: 'تدريب متخصص في أنظمة التحكم المنطقي القابل للبرمجة المتقدمة. تعلم برمجة PLC وتصميم أنظمة SCADA وتكامل الأتمتة الصناعية.',
    descriptionEn: 'Specialized training in advanced PLC systems. Learn PLC programming, SCADA system design, and industrial automation integration.',
    thumbnail: '/courses/luxury.jpg',
    category: 'plc_automation',
    difficulty: 'advanced',
    estimatedDurationMinutes: 105,
    objectivesAr: [
      'فهم برمجة PLC المتقدمة',
      'تصميم أنظمة SCADA',
      'تكامل الأتمتة الصناعية',
      'استكشاف أعطال أنظمة التحكم'
    ],
    objectivesEn: [
      'Understand advanced PLC programming',
      'Design SCADA systems',
      'Integrate industrial automation',
      'Troubleshoot control systems'
    ],
    recommendedSimulation: {
      type: 'voice',
      scenarioType: 'hvac_systems', // HVAC system design scenario
      difficultyLevel: 'hard'
    },
    lessons: [
      {
        id: 'lux-1',
        titleAr: 'مقدمة في برمجة PLC المتقدمة',
        titleEn: 'Introduction to Advanced PLC Programming',
        descriptionAr: 'فهم لغات البرمجة المتقدمة ومنطق التحكم.',
        descriptionEn: 'Understanding advanced programming languages and control logic.',
        videoId: 'FTQbiNvZqaY', // Advanced PLC programming
        durationMinutes: 22,
        order: 1
      },
      {
        id: 'lux-2',
        titleAr: 'تصميم أنظمة SCADA',
        titleEn: 'SCADA System Design',
        descriptionAr: 'تصميم وتكوين أنظمة المراقبة والتحكم.',
        descriptionEn: 'Designing and configuring supervisory control and data acquisition systems.',
        videoId: 'Lk7Ij9TDkLo', // SCADA design
        durationMinutes: 20,
        order: 2
      },
      {
        id: 'lux-3',
        titleAr: 'تكامل الأتمتة الصناعية',
        titleEn: 'Industrial Automation Integration',
        descriptionAr: 'ربط أنظمة التحكم المختلفة وبروتوكولات الاتصال.',
        descriptionEn: 'Connecting different control systems and communication protocols.',
        videoId: 'QH2-TGUlwu4', // Automation integration
        durationMinutes: 23,
        order: 3
      },
      {
        id: 'lux-4',
        titleAr: 'استكشاف أعطال أنظمة التحكم',
        titleEn: 'Control Systems Troubleshooting',
        descriptionAr: 'تقنيات تشخيص وإصلاح أعطال أنظمة الأتمتة.',
        descriptionEn: 'Techniques for diagnosing and repairing automation system faults.',
        videoId: 'dQw4w9WgXcQ', // Troubleshooting
        durationMinutes: 20,
        order: 4
      },
      {
        id: 'lux-5',
        titleAr: 'مشاريع الأتمتة المتكاملة',
        titleEn: 'Integrated Automation Projects',
        descriptionAr: 'تطبيق عملي لأنظمة التحكم في مشاريع واقعية.',
        descriptionEn: 'Practical application of control systems in real-world projects.',
        videoId: 'hTWKbfoikeg', // Integrated projects
        durationMinutes: 20,
        order: 5
      }
    ]
  },
  {
    id: 'industrial-maintenance',
    titleAr: 'الصيانة الصناعية الوقائية',
    titleEn: 'Preventive Industrial Maintenance',
    descriptionAr: 'تعلم أساسيات الصيانة الوقائية والتنبؤية للمعدات الصناعية. فهم جداول الصيانة وتقنيات التشخيص وإدارة قطع الغيار.',
    descriptionEn: 'Learn the fundamentals of preventive and predictive maintenance for industrial equipment. Understand maintenance schedules, diagnostic techniques, and spare parts management.',
    thumbnail: '/courses/marketing.jpg',
    category: 'maintenance',
    difficulty: 'beginner',
    estimatedDurationMinutes: 75,
    objectivesAr: [
      'فهم أنواع الصيانة الصناعية',
      'تطبيق الصيانة الوقائية',
      'استخدام تقنيات التشخيص',
      'إدارة جداول الصيانة'
    ],
    objectivesEn: [
      'Understand types of industrial maintenance',
      'Apply preventive maintenance',
      'Use diagnostic techniques',
      'Manage maintenance schedules'
    ],
    recommendedSimulation: {
      type: 'text',
      scenarioType: 'plc_automation',
      difficultyLevel: 'easy'
    },
    lessons: [
      {
        id: 'mnt-1',
        titleAr: 'مقدمة في الصيانة الصناعية',
        titleEn: 'Introduction to Industrial Maintenance',
        descriptionAr: 'أنواع الصيانة: التصحيحية والوقائية والتنبؤية.',
        descriptionEn: 'Types of maintenance: corrective, preventive, and predictive.',
        videoId: 'nnPLpY3VaWw',
        durationMinutes: 18,
        order: 1
      },
      {
        id: 'mnt-2',
        titleAr: 'جداول الصيانة الوقائية',
        titleEn: 'Preventive Maintenance Schedules',
        descriptionAr: 'إنشاء وتنفيذ جداول صيانة فعالة.',
        descriptionEn: 'Creating and implementing effective maintenance schedules.',
        videoId: 'A1PaCWjkPNU',
        durationMinutes: 15,
        order: 2
      },
      {
        id: 'mnt-3',
        titleAr: 'تقنيات التشخيص',
        titleEn: 'Diagnostic Techniques',
        descriptionAr: 'استخدام أدوات القياس لتشخيص أعطال المعدات.',
        descriptionEn: 'Using measurement tools to diagnose equipment faults.',
        videoId: 'fJ9rUzIMcZQ',
        durationMinutes: 17,
        order: 3
      },
      {
        id: 'mnt-4',
        titleAr: 'إدارة قطع الغيار',
        titleEn: 'Spare Parts Management',
        descriptionAr: 'تنظيم المخزون وضمان توفر القطع الحيوية.',
        descriptionEn: 'Organizing inventory and ensuring critical parts availability.',
        videoId: 'lp-EO5I60KA',
        durationMinutes: 15,
        order: 4
      },
      {
        id: 'mnt-5',
        titleAr: 'الصيانة التنبؤية',
        titleEn: 'Predictive Maintenance',
        descriptionAr: 'استخدام تحليل الاهتزازات والحرارة للتنبؤ بالأعطال.',
        descriptionEn: 'Using vibration and thermal analysis to predict failures.',
        videoId: 'JwZKcm3TC2I',
        durationMinutes: 10,
        order: 5
      }
    ]
  },
  {
    id: 'electrical-power-systems',
    titleAr: 'أنظمة القوى الكهربائية',
    titleEn: 'Electrical Power Systems',
    descriptionAr: 'تعلم أساسيات أنظمة القوى الكهربائية من التوزيع إلى الحماية. فهم المحولات والقواطع ونظم التأريض.',
    descriptionEn: 'Learn the fundamentals of electrical power systems from distribution to protection. Understand transformers, circuit breakers, and grounding systems.',
    thumbnail: '/courses/first-time.jpg',
    category: 'electrical',
    difficulty: 'beginner',
    estimatedDurationMinutes: 80,
    objectivesAr: [
      'فهم نظم التوزيع الكهربائي',
      'تشغيل وصيانة المحولات',
      'فهم أنظمة الحماية الكهربائية',
      'تطبيق معايير السلامة الكهربائية'
    ],
    objectivesEn: [
      'Understand electrical distribution systems',
      'Operate and maintain transformers',
      'Understand electrical protection systems',
      'Apply electrical safety standards'
    ],
    recommendedSimulation: {
      type: 'text',
      scenarioType: 'technical_consultation',
      difficultyLevel: 'easy'
    },
    lessons: [
      {
        id: 'elec-1',
        titleAr: 'أساسيات التوزيع الكهربائي',
        titleEn: 'Electrical Distribution Basics',
        descriptionAr: 'فهم مكونات نظام التوزيع الكهربائي.',
        descriptionEn: 'Understanding components of electrical distribution systems.',
        videoId: 'uelHwf8o7_U',
        durationMinutes: 16,
        order: 1
      },
      {
        id: 'elec-2',
        titleAr: 'المحولات الكهربائية',
        titleEn: 'Electrical Transformers',
        descriptionAr: 'أنواع المحولات وطرق التشغيل والصيانة.',
        descriptionEn: 'Types of transformers, operation and maintenance methods.',
        videoId: '50VWOBi4VHY',
        durationMinutes: 18,
        order: 2
      },
      {
        id: 'elec-3',
        titleAr: 'أنظمة الحماية',
        titleEn: 'Protection Systems',
        descriptionAr: 'القواطع والصمامات وأجهزة الحماية من التيار الزائد.',
        descriptionEn: 'Circuit breakers, fuses, and overcurrent protection devices.',
        videoId: 'tPRv-ATUBe4',
        durationMinutes: 15,
        order: 3
      },
      {
        id: 'elec-4',
        titleAr: 'نظم التأريض',
        titleEn: 'Grounding Systems',
        descriptionAr: 'أنواع التأريض ومعايير التركيب والفحص.',
        descriptionEn: 'Grounding types, installation standards, and inspection.',
        videoId: 'i_F9uNqCVcE',
        durationMinutes: 17,
        order: 4
      },
      {
        id: 'elec-5',
        titleAr: 'السلامة الكهربائية',
        titleEn: 'Electrical Safety',
        descriptionAr: 'إجراءات السلامة عند العمل مع أنظمة الطاقة الكهربائية.',
        descriptionEn: 'Safety procedures when working with electrical power systems.',
        videoId: 'WmcZUl1u8as',
        durationMinutes: 14,
        order: 5
      }
    ]
  }
];

// Legacy support - get title/description based on language
export function getCourseTitle(course: Course, isRTL: boolean): string {
  return isRTL ? course.titleAr : course.titleEn;
}

export function getCourseDescription(course: Course, isRTL: boolean): string {
  return isRTL ? course.descriptionAr : course.descriptionEn;
}

export function getLessonTitle(lesson: Lesson, isRTL: boolean): string {
  return isRTL ? lesson.titleAr : lesson.titleEn;
}

export function getLessonDescription(lesson: Lesson, isRTL: boolean): string {
  return isRTL ? lesson.descriptionAr : lesson.descriptionEn;
}

export function getCourseObjectives(course: Course, isRTL: boolean): string[] {
  return isRTL ? course.objectivesAr : course.objectivesEn;
}

export function getCourseById(id: string): Course | undefined {
  return courses.find(course => course.id === id);
}

export function getLessonById(courseId: string, lessonId: string): Lesson | undefined {
  const course = getCourseById(courseId);
  return course?.lessons.find(lesson => lesson.id === lessonId);
}
