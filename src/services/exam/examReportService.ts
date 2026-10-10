import { ExamAttemptRecord } from '@/types/exam';

export class ExamReportService {
  /**
   * Generates standard RFC 4180 CSV with UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility.
   */
  public static exportResultsToCsv(results: ExamAttemptRecord[]): string {
    const BOM = '\uFEFF';
    const headers = [
      'Record ID',
      'Student Name',
      'Roll Number',
      'Test Title',
      'Language',
      'Layout',
      'Mode',
      'Test Date',
      'Target Duration (Min)',
      'Actual Duration (Sec)',
      'Gross WPM',
      'Net WPM',
      'CPM',
      'Accuracy (%)',
      'Total Words Typed',
      'Correct Chars',
      'Incorrect Chars',
      'Omissions',
      'Insertions',
      'Substitutions',
      'Backspaces Used',
      'Scoring Policy',
      'Result Status',
    ];

    const escapeCsv = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = results.map((r) => [
      escapeCsv(r.id),
      escapeCsv(r.studentName),
      escapeCsv(r.studentRollNo || 'N/A'),
      escapeCsv(r.presetTitle || r.passageTitle),
      escapeCsv(r.language),
      escapeCsv(r.layout),
      escapeCsv(r.mode === 'strict_exam' ? 'Strict Examination' : 'Practice'),
      escapeCsv(new Date(r.completedAt).toLocaleString('en-IN')),
      escapeCsv(Math.round(r.targetDurationSeconds / 60)),
      escapeCsv(Math.round(r.actualDurationSeconds)),
      escapeCsv(r.scoring.grossWpm),
      escapeCsv(r.scoring.netWpm),
      escapeCsv(r.scoring.cpm),
      escapeCsv(r.scoring.accuracy),
      escapeCsv(r.scoring.totalWordsTyped),
      escapeCsv(r.scoring.correctChars),
      escapeCsv(r.scoring.incorrectChars),
      escapeCsv(r.scoring.omissions),
      escapeCsv(r.scoring.insertions),
      escapeCsv(r.scoring.substitutions),
      escapeCsv(r.scoring.backspaceCount),
      escapeCsv(r.scoringPolicy),
      escapeCsv(r.passed ? 'PASSED / QUALIFIED' : 'FAILED / DISQUALIFIED'),
    ]);

    const csvContent = [headers.map(escapeCsv).join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    return BOM + csvContent;
  }

  /**
   * Browser-safe file download trigger.
   */
  public static downloadCsvFile(csvContent: string, fileName = 'Typing_Master_Pro_Exam_Report.csv'): void {
    if (typeof window === 'undefined') return;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generates a self-contained printable HTML certificate and grade report.
   */
  public static generatePrintableHtml(
    record: ExamAttemptRecord,
    instituteName = 'TYPING MASTER PRO — COMPUTER EDUCATION INSTITUTE'
  ): string {
    const dateFormatted = new Date(record.completedAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isPassed = record.passed;
    const badgeColor = isPassed ? '#059669' : '#dc2626';
    const statusText = isPassed ? 'QUALIFIED / उत्तीर्ण' : 'NOT QUALIFIED / अनुत्तीर्ण';

    return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>Typing Examination Report - ${record.studentName}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 24px;
    }
    .cert-container {
      border: 3px double #cbd5e1;
      border-radius: 12px;
      padding: 32px;
      position: relative;
    }
    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
    .inst-title { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px; }
    .doc-subtitle { font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-top: 4px; }
    .student-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 24px 0;
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .field { font-size: 13px; color: #475569; }
    .field-val { font-size: 15px; font-weight: 700; color: #0f172a; }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 24px 0;
    }
    .kpi-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .kpi-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
    .kpi-val { font-size: 26px; font-weight: 800; color: #0f172a; margin-top: 4px; font-family: monospace; }
    .status-stamp {
      display: inline-block;
      padding: 8px 24px;
      border-radius: 9999px;
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
      background-color: ${badgeColor};
      margin: 12px 0;
      letter-spacing: 0.5px;
    }
    .breakdown-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 13px;
    }
    .breakdown-table th, .breakdown-table td {
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      text-align: left;
    }
    .breakdown-table th { background: #f1f5f9; font-weight: 700; color: #334155; }
    .footer-signs {
      margin-top: 48px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 32px;
    }
    .sign-block { text-align: center; width: 200px; border-top: 1px solid #94a3b8; padding-top: 8px; font-size: 12px; font-weight: 600; color: #475569; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="cert-container">
    <div class="header">
      <div class="inst-title">${instituteName}</div>
      <div class="doc-subtitle">OFFICIAL TYPING SPEED & ACCURACY EXAMINATION SCORECARD</div>
      <div style="margin-top: 12px;">
        <span class="status-stamp">${statusText}</span>
      </div>
    </div>

    <div class="student-grid">
      <div>
        <div class="field">Candidate Name:</div>
        <div class="field-val">${record.studentName}</div>
      </div>
      <div>
        <div class="field">Institute Roll No:</div>
        <div class="field-val">${record.studentRollNo || 'TMP-' + record.profileId.slice(0, 6).toUpperCase()}</div>
      </div>
      <div>
        <div class="field">Examination Profile:</div>
        <div class="field-val">${record.presetTitle}</div>
      </div>
      <div>
        <div class="field">Date & Time of Examination:</div>
        <div class="field-val">${dateFormatted}</div>
      </div>
      <div>
        <div class="field">Language & Keyboard Layout:</div>
        <div class="field-val">${record.language} — ${record.layout}</div>
      </div>
      <div>
        <div class="field">Examination Duration:</div>
        <div class="field-val">${Math.round(record.targetDurationSeconds / 60)} Minutes (${Math.round(record.actualDurationSeconds)}s recorded)</div>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Net Speed (WPM)</div>
        <div class="kpi-val" style="color: ${badgeColor};">${record.scoring.netWpm}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Gross Speed (WPM)</div>
        <div class="kpi-val">${record.scoring.grossWpm}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Accuracy Rate</div>
        <div class="kpi-val">${record.scoring.accuracy}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Total Errors</div>
        <div class="kpi-val" style="color: ${record.scoring.incorrectChars > 0 ? '#e11d48' : '#059669'};">
          ${record.scoring.substitutions + record.scoring.insertions + record.scoring.omissions}
        </div>
      </div>
    </div>

    <table class="breakdown-table">
      <thead>
        <tr>
          <th>Evaluation Metric</th>
          <th>Candidate Result</th>
          <th>Evaluation Standard & Remarks</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Characters Typed / Keystrokes</td>
          <td>${record.scoring.totalCharsTyped} characters (${record.scoring.cpm} CPM)</td>
          <td>Standard 5 keystrokes equivalent to 1 unit word</td>
        </tr>
        <tr>
          <td>Error Breakdown</td>
          <td>Substitutions: ${record.scoring.substitutions} | Omissions: ${record.scoring.omissions} | Insertions: ${record.scoring.insertions}</td>
          <td>Sequence aligned dynamic comparison</td>
        </tr>
        <tr>
          <td>Backspace Usage</td>
          <td>${record.scoring.backspaceCount} backspaces pressed</td>
          <td>Policy: ${record.backspacePolicy}</td>
        </tr>
        <tr>
          <td>Evaluation Formula</td>
          <td colspan="2" style="font-family: monospace; font-size: 11px;">${record.scoring.formulaExplanation}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer-signs">
      <div class="sign-block">
        Candidate's Signature
      </div>
      <div style="font-size: 10px; color: #94a3b8; text-align: center;">
        Verification ID: ${record.id}<br>
        Digitally generated by Typing Master Pro Desktop Engine
      </div>
      <div class="sign-block">
        Certified Institute Examiner
      </div>
    </div>
  </div>
</body>
</html>`;
  }
}
