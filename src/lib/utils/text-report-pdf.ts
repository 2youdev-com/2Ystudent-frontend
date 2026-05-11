import jsPDF from 'jspdf';

/**
 * Text Conversation Report PDF Generator
 *
 * Generates professional English-layout PDFs for engineering training reports.
 * Uses html2canvas for proper text rendering.
 */

export interface TextReportData {
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
  analysis: {
    overallScore: number;
    grade: string;
    summary: string;
    skillScores: {
      technicalCommunication: { score: number; tips: string[] };
      knowledgeDepth: { score: number; tips: string[] };
      problemSolving: { score: number; tips: string[] };
      safetyAwareness: { score: number; tips: string[] };
      practicalApplication: { score: number; tips: string[] };
      criticalThinking: { score: number; tips: string[] };
    };
    highlights: string[];
    improvementAreas: string[];
    conversationMetrics: {
      talkTimeRatio: number;
      questionsAsked: number;
      technicalAccuracy: number;
      depthOfReasoning: number;
    };
  };
}

// Safe number helper
function safeNum(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return Math.round(parsed);
    }
  }
  return defaultValue;
}

// Safe string helper
function safeStr(value: unknown, defaultValue = '—'): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return defaultValue;
}

// Safe array helper
function safeArray(value: unknown, defaultValue: string[] = ['Not specified']): string[] {
  if (Array.isArray(value) && value.length > 0) {
    return value.filter(item => typeof item === 'string' && item.trim().length > 0);
  }
  return defaultValue;
}

function getScoreColor(score: number): string {
  const safeScore = safeNum(score, 0);
  if (safeScore >= 70) return '#22c55e'; // green
  if (safeScore >= 50) return '#eab308'; // yellow
  return '#ef4444'; // red
}

function getGrade(score: number): string {
  const safeScore = safeNum(score, 0);
  if (safeScore >= 90) return 'A';
  if (safeScore >= 80) return 'B';
  if (safeScore >= 70) return 'C';
  if (safeScore >= 60) return 'D';
  return 'F';
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

// English scenario type labels
const scenarioLabels: Record<string, string> = {
  property_showing: 'HVAC Systems & Troubleshooting',
  price_negotiation: 'Electrical Systems & Circuits',
  objection_handling: 'Safety Procedures & Compliance',
  closing: 'Industrial Maintenance',
  cold_call: 'PLC Programming & Automation',
  follow_up: 'Advanced Troubleshooting',
  hvac_systems: 'HVAC Systems & Troubleshooting',
  electrical_systems: 'Electrical Systems & Circuits',
  safety_compliance: 'Safety Procedures & Compliance',
  plc_automation: 'PLC Programming & Automation',
  industrial_maintenance: 'Industrial Maintenance',
  advanced_troubleshooting: 'Advanced Troubleshooting',
};

// English difficulty labels
const difficultyLabels: Record<string, string> = {
  easy: 'Beginner',
  medium: 'Intermediate',
  hard: 'Advanced',
};

// English personality/mentor style labels
const personalityLabels: Record<string, string> = {
  friendly: 'Supportive',
  skeptical: 'Challenging',
  demanding: 'Methodical',
  indecisive: 'Socratic',
  analytical: 'Analytical',
  supportive: 'Supportive',
  challenging: 'Challenging',
  methodical: 'Methodical',
  socratic: 'Socratic',
};

// English skill labels
const skillLabels: Record<string, string> = {
  technicalCommunication: 'Technical Communication',
  knowledgeDepth: 'Knowledge Depth',
  problemSolving: 'Problem Solving',
  safetyAwareness: 'Safety Awareness',
  practicalApplication: 'Practical Application',
  criticalThinking: 'Critical Thinking',
  communication: 'Technical Communication',
  negotiation: 'Knowledge Depth',
  objectionHandling: 'Problem Solving',
  relationshipBuilding: 'Safety Awareness',
  productKnowledge: 'Practical Application',
  closingTechnique: 'Critical Thinking',
};

export async function generateTextReportPDF(report: TextReportData): Promise<void> {
  // Validate and sanitize all report data
  const safeReport = {
    sessionId: safeStr(report.sessionId, 'unknown'),
    studentId: safeStr(report.studentId, 'unknown'),
    studentName: report.studentName ? safeStr(report.studentName) : undefined,
    startTime: report.startTime,
    endTime: report.endTime,
    durationSeconds: safeNum(report.durationSeconds, 0),
    scenarioType: report.scenarioType,
    difficultyLevel: report.difficultyLevel,
    mentorProfile: {
      name: safeStr(report.mentorProfile?.name, 'Mentor'),
      personality: safeStr(report.mentorProfile?.personality, 'neutral'),
      background: safeStr(report.mentorProfile?.background, 'Not specified'),
      specialty: safeStr(report.mentorProfile?.specialty, 'Not specified'),
    },
    conversationTurns: report.conversationTurns || [],
    analysis: {
      overallScore: safeNum(report.analysis?.overallScore, 0),
      grade: safeStr(report.analysis?.grade, 'N/A'),
      summary: safeStr(report.analysis?.summary, 'This session has not been analyzed'),
      skillScores: {
        technicalCommunication: { score: safeNum(report.analysis?.skillScores?.technicalCommunication?.score, 0), tips: safeArray(report.analysis?.skillScores?.technicalCommunication?.tips) },
        knowledgeDepth: { score: safeNum(report.analysis?.skillScores?.knowledgeDepth?.score, 0), tips: safeArray(report.analysis?.skillScores?.knowledgeDepth?.tips) },
        problemSolving: { score: safeNum(report.analysis?.skillScores?.problemSolving?.score, 0), tips: safeArray(report.analysis?.skillScores?.problemSolving?.tips) },
        safetyAwareness: { score: safeNum(report.analysis?.skillScores?.safetyAwareness?.score, 0), tips: safeArray(report.analysis?.skillScores?.safetyAwareness?.tips) },
        practicalApplication: { score: safeNum(report.analysis?.skillScores?.practicalApplication?.score, 0), tips: safeArray(report.analysis?.skillScores?.practicalApplication?.tips) },
        criticalThinking: { score: safeNum(report.analysis?.skillScores?.criticalThinking?.score, 0), tips: safeArray(report.analysis?.skillScores?.criticalThinking?.tips) },
      },
      highlights: safeArray(report.analysis?.highlights, ['No strengths identified']),
      improvementAreas: safeArray(report.analysis?.improvementAreas, ['No areas for improvement identified']),
      conversationMetrics: {
        talkTimeRatio: safeNum(report.analysis?.conversationMetrics?.talkTimeRatio, 0.5),
        questionsAsked: safeNum(report.analysis?.conversationMetrics?.questionsAsked, 0),
        technicalAccuracy: safeNum(report.analysis?.conversationMetrics?.technicalAccuracy, 0),
        depthOfReasoning: safeNum(report.analysis?.conversationMetrics?.depthOfReasoning, 0),
      },
    },
  };

  const durationMins = Math.round(safeReport.durationSeconds / 60);
  const scoreColor = getScoreColor(safeReport.analysis.overallScore);
  const grade = getGrade(safeReport.analysis.overallScore);

  // Create HTML content for the report
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="ltr" lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', 'Segoe UI', Tahoma, sans-serif;
          direction: ltr;
          background: white;
          color: #1e293b;
          line-height: 1.6;
        }

        .page {
          width: 210mm;
          min-height: 297mm;
          padding: 12mm;
          background: white;
        }

        .header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 15px;
        }

        .header h1 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .header p {
          color: #94a3b8;
          font-size: 12px;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }

        .meta-item {
          background: #f8fafc;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
        }

        .meta-label {
          font-size: 10px;
          color: #64748b;
          margin-bottom: 3px;
        }

        .meta-value {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
        }

        .score-section {
          background: #f8fafc;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .score-label {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        .score-display {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .grade {
          font-size: 32px;
          font-weight: 700;
          color: ${scoreColor};
        }

        .score-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${scoreColor};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .client-info {
          background: #f1f5f9;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 15px;
        }

        .client-name {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .client-details {
          font-size: 11px;
          color: #64748b;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 15px;
        }

        .skill-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px;
        }

        .skill-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .skill-label {
          font-size: 11px;
          color: #64748b;
        }

        .skill-score {
          font-size: 12px;
          font-weight: 600;
        }

        .progress-bar {
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 3px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 15px;
        }

        .metric-item {
          background: #f8fafc;
          border-radius: 6px;
          padding: 10px;
          text-align: center;
        }

        .metric-value {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }

        .metric-label {
          font-size: 10px;
          color: #64748b;
        }

        .feedback-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }

        .feedback-section {
          border-radius: 8px;
          padding: 12px;
        }

        .strengths {
          background: #dcfce7;
          border: 1px solid #86efac;
        }

        .strengths .section-title {
          color: #16a34a;
        }

        .strengths li {
          color: #15803d;
        }

        .weaknesses {
          background: #fee2e2;
          border: 1px solid #fca5a5;
        }

        .weaknesses .section-title {
          color: #dc2626;
        }

        .weaknesses li {
          color: #b91c1c;
        }

        .feedback-list {
          list-style: none;
          padding: 0;
        }

        .feedback-list li {
          padding: 3px 0;
          font-size: 11px;
          display: flex;
          align-items: flex-start;
          gap: 6px;
        }

        .feedback-list li::before {
          content: "•";
          font-weight: bold;
        }

        .summary-section {
          background: #f8fafc;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 15px;
        }

        .summary-text {
          font-size: 12px;
          color: #475569;
          line-height: 1.7;
        }

        .conversation-section {
          background: #fafafa;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 15px;
          max-height: 300px;
          overflow-y: auto;
        }

        .turn {
          margin-bottom: 8px;
          padding: 8px;
          border-radius: 6px;
        }

        .turn-student {
          background: #3b82f6;
          color: white;
          margin-left: 20%;
        }

        .turn-client {
          background: #e5e7eb;
          color: #1e293b;
          margin-right: 20%;
        }

        .turn-speaker {
          font-size: 10px;
          font-weight: 600;
          margin-bottom: 3px;
          opacity: 0.8;
        }

        .turn-message {
          font-size: 11px;
          line-height: 1.5;
        }

        .footer {
          text-align: center;
          color: #94a3b8;
          font-size: 10px;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <h1>Learning Report</h1>
          <p>AI-Assisted Technical Knowledge Assessment</p>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <div class="meta-label">Date</div>
            <div class="meta-value">${formatDate(safeReport.startTime)}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Duration</div>
            <div class="meta-value">${durationMins} min</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Topic</div>
            <div class="meta-value">${scenarioLabels[safeReport.scenarioType] || safeReport.scenarioType}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Level</div>
            <div class="meta-value">${difficultyLabels[safeReport.difficultyLevel] || safeReport.difficultyLevel}</div>
          </div>
        </div>

        <div class="client-info">
          <div class="client-name">${safeReport.mentorProfile.name}</div>
          <div class="client-details">
            Style: ${personalityLabels[safeReport.mentorProfile.personality] || safeReport.mentorProfile.personality} |
            Specialty: ${safeReport.mentorProfile.specialty}
          </div>
        </div>

        <div class="score-section">
          <div class="score-label">Overall Score</div>
          <div class="score-display">
            <div class="grade">${grade}</div>
            <div class="score-circle">${safeReport.analysis.overallScore}%</div>
          </div>
        </div>

        <div class="section-title">Competency Analysis</div>
        <div class="skills-grid">
          ${Object.entries(safeReport.analysis.skillScores).map(([key, value]) => `
            <div class="skill-item">
              <div class="skill-header">
                <span class="skill-label">${skillLabels[key] || key}</span>
                <span class="skill-score" style="color: ${getScoreColor(value.score)}">${value.score}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${value.score}%; background: ${getScoreColor(value.score)}"></div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="section-title">Session Metrics</div>
        <div class="metrics-grid">
          <div class="metric-item">
            <div class="metric-value">${Math.round(safeReport.analysis.conversationMetrics.talkTimeRatio * 100)}%</div>
            <div class="metric-label">Talk Time</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${safeReport.analysis.conversationMetrics.questionsAsked}</div>
            <div class="metric-label">Questions Asked</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${safeReport.analysis.conversationMetrics.technicalAccuracy}</div>
            <div class="metric-label">Technical Accuracy</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${safeReport.analysis.conversationMetrics.depthOfReasoning}</div>
            <div class="metric-label">Depth of Reasoning</div>
          </div>
        </div>

        <div class="feedback-grid">
          <div class="feedback-section strengths">
            <div class="section-title">Strengths</div>
            <ul class="feedback-list">
              ${safeReport.analysis.highlights.slice(0, 4).map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
          <div class="feedback-section weaknesses">
            <div class="section-title">Areas for Improvement</div>
            <ul class="feedback-list">
              ${safeReport.analysis.improvementAreas.slice(0, 4).map(w => `<li>${w}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="summary-section">
          <div class="section-title">Performance Summary</div>
          <p class="summary-text">${safeReport.analysis.summary}</p>
        </div>

        ${safeReport.conversationTurns.length > 0 ? `
        <div class="section-title">Session Transcript (${safeReport.conversationTurns.length} messages)</div>
        <div class="conversation-section">
          ${safeReport.conversationTurns.slice(0, 10).map(turn => `
            <div class="turn turn-${turn.speaker === 'student' ? 'student' : 'client'}">
              <div class="turn-speaker">${turn.speaker === 'student' ? 'Student' : 'Mentor'}</div>
              <div class="turn-message">${turn.message}</div>
            </div>
          `).join('')}
          ${safeReport.conversationTurns.length > 10 ? `
            <div style="text-align: center; color: #64748b; font-size: 10px; padding: 8px;">
              ... and ${safeReport.conversationTurns.length - 10} more messages
            </div>
          ` : ''}
        </div>
        ` : ''}

        <div class="footer">
          Report generated by 2YStudy Learning Platform | ${new Date().toLocaleDateString('en-GB')}
        </div>
      </div>
    </body>
    </html>
  `;

  // Create a hidden container for rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  // Wait for fonts to load
  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    // Import html2canvas dynamically
    const html2canvas = (await import('html2canvas')).default;

    const pageElement = container.querySelector('.page') as HTMLElement;
    if (!pageElement) throw new Error('Page element not found');

    // Render to canvas
    const canvas = await html2canvas(pageElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate dimensions maintaining aspect ratio
    const canvasAspect = canvas.width / canvas.height;
    const pdfAspect = pdfWidth / pdfHeight;

    let imgWidth = pdfWidth;
    let imgHeight = pdfWidth / canvasAspect;

    if (imgHeight > pdfHeight) {
      imgHeight = pdfHeight;
      imgWidth = pdfHeight * canvasAspect;
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

    // Save PDF
    const filename = `text-report-${safeReport.sessionId.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  } finally {
    // Cleanup
    document.body.removeChild(container);
  }
}

export default generateTextReportPDF;
