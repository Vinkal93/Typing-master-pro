import { Batch, InstituteStudent, AttendanceRecord } from '@/types/institute';
import { ExamAttemptRecord } from '@/types/exam';
import { storageService } from '../storage/storageService';

export interface BatchComparisonRow {
  batchId: string;
  batchName: string;
  shift: string;
  studentCount: number;
  averageWpm: number;
  averageAccuracy: number;
  passPercentage: number;
}

export class InstituteReportService {
  /**
   * Computes aggregate batch comparison metrics.
   */
  public static async getBatchComparisons(): Promise<BatchComparisonRow[]> {
    const adapter = await storageService.getAdapter();
    const batches = await adapter.getBatches();
    const students = await adapter.getInstituteStudents();
    const examResults = await adapter.getExamResults();

    return batches.map((batch) => {
      const batchStudents = students.filter((s) => s.batchId === batch.id && s.status === 'active');
      const studentIdSet = new Set(batchStudents.map((s) => s.id));

      const batchExams = examResults.filter((r) => studentIdSet.has(r.profileId));

      let totalSpeed = 0;
      let totalAcc = 0;
      let passedCount = 0;

      for (const e of batchExams) {
        totalSpeed += e.scoring.netWpm;
        totalAcc += e.scoring.accuracy;
        if (e.passed) passedCount++;
      }

      const count = batchExams.length;
      return {
        batchId: batch.id,
        batchName: batch.name,
        shift: batch.shift.toUpperCase(),
        studentCount: batchStudents.length,
        averageWpm: count > 0 ? Math.round((totalSpeed / count) * 10) / 10 : 0,
        averageAccuracy: count > 0 ? Math.round((totalAcc / count) * 10) / 10 : 0,
        passPercentage: count > 0 ? Math.round((passedCount / count) * 100) : 0,
      };
    });
  }

  /**
   * Generates a printable HTML Student Progress Dossier / Institute Report Card.
   */
  public static generateStudentDossierHtml(
    student: InstituteStudent,
    batchName: string,
    exams: ExamAttemptRecord[],
    attendanceStats: { present: number; total: number; percentage: number },
    instituteName = 'TYPING MASTER PRO — CENTRAL COMPUTER INSTITUTE'
  ): string {
    let bestWpm = 0;
    let avgWpm = 0;
    let avgAcc = 0;
    let passedTests = 0;

    if (exams.length > 0) {
      let speedSum = 0;
      let accSum = 0;
      for (const e of exams) {
        if (e.scoring.netWpm > bestWpm) bestWpm = e.scoring.netWpm;
        speedSum += e.scoring.netWpm;
        accSum += e.scoring.accuracy;
        if (e.passed) passedTests++;
      }
      avgWpm = Math.round((speedSum / exams.length) * 10) / 10;
      avgAcc = Math.round((accSum / exams.length) * 10) / 10;
    }

    const testRows = exams
      .slice(0, 10)
      .map(
        (e) => `
        <tr>
          <td>${new Date(e.completedAt).toLocaleDateString('en-IN')}</td>
          <td>${e.presetTitle || e.passageTitle}</td>
          <td>${e.language.toUpperCase()} (${e.layout})</td>
          <td><strong>${e.scoring.netWpm} WPM</strong></td>
          <td>${e.scoring.accuracy}%</td>
          <td style="color: ${e.passed ? '#059669' : '#dc2626'}; font-weight: bold;">
            ${e.passed ? 'QUALIFIED' : 'DISQUALIFIED'}
          </td>
        </tr>`
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>Student Academic Report - ${student.name}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
    }
    .report-card {
      border: 2px solid #cbd5e1;
      border-radius: 8px;
      padding: 24px;
    }
    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
    .inst-name { font-size: 20px; font-weight: 800; color: #1e293b; }
    .doc-type { font-size: 13px; font-weight: 600; color: #64748b; margin-top: 4px; }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 20px 0;
      background: #f8fafc;
      padding: 16px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      font-size: 13px;
    }
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 20px 0;
    }
    .kpi-box {
      border: 1px solid #e2e8f0;
      background: #ffffff;
      padding: 12px;
      border-radius: 6px;
      text-align: center;
    }
    .kpi-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
    .kpi-val { font-size: 22px; font-weight: 800; color: #0284c7; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    th { background: #f1f5f9; color: #334155; font-weight: 700; }
    .footer {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="report-card">
    <div class="header">
      <div class="inst-name">${instituteName}</div>
      <div class="doc-type">OFFICIAL STUDENT PROGRESS & TYPING PERFORMANCE DOSSIER</div>
    </div>

    <div class="meta-grid">
      <div><strong>Student Name:</strong> ${student.name}</div>
      <div><strong>Institute Roll No:</strong> ${student.rollNo}</div>
      <div><strong>Assigned Batch:</strong> ${batchName}</div>
      <div><strong>Enrollment Date:</strong> ${student.joinDate}</div>
      <div><strong>Attendance Record:</strong> ${attendanceStats.present} / ${attendanceStats.total} Sessions (${attendanceStats.percentage}%)</div>
      <div><strong>Course Program:</strong> ${student.courseId}</div>
    </div>

    <div class="kpi-row">
      <div class="kpi-box">
        <div class="kpi-label">Peak Speed</div>
        <div class="kpi-val">${bestWpm} <span style="font-size: 12px;">WPM</span></div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Average Speed</div>
        <div class="kpi-val">${avgWpm} <span style="font-size: 12px;">WPM</span></div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Average Accuracy</div>
        <div class="kpi-val">${avgAcc}%</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Tests Passed</div>
        <div class="kpi-val">${passedTests} / ${exams.length}</div>
      </div>
    </div>

    <h4 style="margin: 16px 0 8px 0; font-size: 14px;">Recent Examination History</h4>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Examination Title</th>
          <th>Language & Layout</th>
          <th>Net Speed</th>
          <th>Accuracy</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        ${testRows || '<tr><td colspan="6" style="text-align: center; color: #94a3b8;">No examination records logged yet.</td></tr>'}
      </tbody>
    </table>

    <div class="footer">
      <div>Instructor / Verifier Signature</div>
      <div>Institute Seal & Stamp</div>
    </div>
  </div>
</body>
</html>`;
  }

  public static exportBatchComparisonToCsv(comparisons: BatchComparisonRow[]): string {
    const BOM = '\uFEFF';
    const headers = ['Batch Name', 'Shift', 'Active Students', 'Average WPM', 'Average Accuracy (%)', 'Pass Rate (%)'];
    const rows = comparisons.map((c) => [
      `"${c.batchName}"`,
      `"${c.shift}"`,
      `"${c.studentCount}"`,
      `"${c.averageWpm}"`,
      `"${c.averageAccuracy}"`,
      `"${c.passPercentage}"`,
    ]);

    return BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }
}
