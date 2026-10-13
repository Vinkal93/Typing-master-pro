'use client';

import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Printer,
  Download,
  ArrowLeft,
  FileText,
  Info,
  Clock,
  Gauge,
  Sliders,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ExamAttemptRecord } from '@/types/exam';
import { ExamReportService } from '@/services/exam/examReportService';
import { PrintableReportModal } from './PrintableReportModal';

interface ExamResultViewProps {
  record: ExamAttemptRecord;
  onRetry: () => void;
  onNewTest: () => void;
  onBackToDashboard: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  record,
  onRetry,
  onNewTest,
  onBackToDashboard,
}) => {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const { scoring } = record;
  const isPassed = record.passed;

  const handleDownloadCsv = () => {
    const csv = ExamReportService.exportResultsToCsv([record]);
    ExamReportService.downloadCsvFile(
      csv,
      `Exam_Result_${record.studentName.replace(/\s+/g, '_')}_${record.id}.csv`
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBackToDashboard} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {record.presetTitle || record.passageTitle}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {record.language} • {record.layout}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              परीक्षा परिणाम एवं प्रदर्शन मूल्यांकन (Exam Evaluation)
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadCsv} className="gap-1.5 text-xs">
            <Download className="w-4 h-4" /> CSV
          </Button>
          <Button
            size="sm"
            onClick={() => setIsPrintModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-medium"
          >
            <Printer className="w-4 h-4" /> प्रमाणपत्र प्रिंट करें
          </Button>
        </div>
      </div>

      {/* Primary Pass / Fail Banner */}
      <div
        className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
          isPassed
            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
            : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
        }`}
      >
        <div className="flex items-start gap-4">
          {isPassed ? (
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertCircle className="w-7 h-7" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider">
                {isPassed ? 'योग्यता प्रमाणन' : 'पुनः प्रयास आवश्यक'}
              </span>
            </div>
            <h2 className="text-2xl font-black mt-0.5">
              {isPassed ? 'बधाई! आप परीक्षा में उत्तीर्ण हुए' : 'उत्तीर्णता मानक प्राप्त नहीं हुआ'}
            </h2>
            <p className="text-xs opacity-90 mt-1 max-w-xl leading-relaxed">
              {isPassed
                ? `आपने निर्धारित गति एवं शुद्धता मानकों को सफलतापूर्वक पूरा कर लिया है। आपकी शुद्ध गति ${scoring.netWpm} WPM एवं शुद्धता ${scoring.accuracy}% दर्ज की गई।`
                : `इस परीक्षा प्रोफाइल में सफल होने हेतु निर्धारित न्यूनतम गति एवं शुद्धता को प्राप्त करना अनिवार्य है। कृपया अपनी गलतियों का विश्लेषण कर पुनः प्रयास करें।`}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <Button variant="outline" onClick={onRetry} className="gap-2 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> पुनः परीक्षा दें
          </Button>
          <Button onClick={onNewTest} className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold">
            नवीन परीक्षा चुनें
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xs text-slate-500 uppercase font-semibold">शुद्ध गति (Net WPM)</span>
          <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {scoring.netWpm}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">शब्द प्रति मिनट</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xs text-slate-500 uppercase font-semibold">सकल गति (Gross WPM)</span>
          <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            {scoring.grossWpm}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">{scoring.cpm} CPM (स्ट्रोक्स/मिनट)</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xs text-slate-500 uppercase font-semibold">शुद्धता दर (Accuracy)</span>
          <div className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {scoring.accuracy}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {scoring.correctChars} / {scoring.totalCharsTyped} वर्ण सही
          </span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xs text-slate-500 uppercase font-semibold">कुल त्रुटियां (Errors)</span>
          <div className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {scoring.substitutions + scoring.insertions + scoring.omissions}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {scoring.backspaceCount} बैकस्पेस प्रयुक्त
          </span>
        </Card>
      </div>

      {/* Error Breakdown & Evaluation Formula */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Error Breakdown Card */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-500" />
            त्रुटि वर्गीकरण (Error Analysis)
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-600 dark:text-slate-300">गलत शब्द (Substitutions)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {scoring.substitutions}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-600 dark:text-slate-300">छूटे हुए शब्द (Omissions)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {scoring.omissions}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-600 dark:text-slate-300">अतिरिक्त शब्द (Insertions)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {scoring.insertions}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-600 dark:text-slate-300">समय उपभोग (Duration)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {Math.round(record.actualDurationSeconds)} सेकंड्स
              </span>
            </div>
          </div>
        </Card>

        {/* Formula Transparency Card */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-500" />
            मूल्यांकन नियम एवं सूत्र (Scoring Formula)
          </h3>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block mb-1">
              लागू नीति: {record.scoringPolicy.toUpperCase()}
            </span>
            <p className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed">
              {scoring.formulaExplanation}
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            यह सॉफ्टवेयर आधिकारिक परीक्षा बोर्डों (जैसे CPCT, SSC, उच्च न्यायालय) की स्थापित मूल्यांकन पद्धतियों के आधार पर वास्तविक नेट गति की गणना करता है।
          </p>
        </Card>
      </div>

      {/* Sequence Alignment Diff Visualizer */}
      <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              टंकित गद्यांश तुलना (Word Sequence Comparison)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              अपेक्षित एवं टंकित शब्दों का संरेखण (हरा: सही, लाल: अशुद्ध, नीला: अतिरिक्त, धूसर: छूटा हुआ)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> सही
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> गलत
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> अतिरिक्त
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> छूटा
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-devanagari text-lg leading-loose flex flex-wrap gap-2">
          {scoring.diffSequence.map((item, idx) => {
            if (item.type === 'correct') {
              return (
                <span key={idx} className="text-emerald-700 dark:text-emerald-400 font-medium">
                  {item.typed}
                </span>
              );
            } else if (item.type === 'substitution') {
              return (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 line-through"
                  title={`अपेक्षित: ${item.expected}`}
                >
                  {item.typed}
                  <span className="no-underline text-[11px] font-sans text-slate-500 block">
                    ({item.expected})
                  </span>
                </span>
              );
            } else if (item.type === 'insertion') {
              return (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  title="अतिरिक्त शब्द"
                >
                  +{item.typed}
                </span>
              );
            } else if (item.type === 'omission') {
              return (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-dashed border-slate-400 text-slate-500 dark:text-slate-400"
                  title="छूटा हुआ शब्द"
                >
                  [{item.expected}]
                </span>
              );
            } else if (item.type === 'unattempted') {
              return (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded text-slate-400 dark:text-slate-600 opacity-60"
                  title="अप्रयुक्त शब्द (Unattempted)"
                >
                  {item.expected}
                </span>
              );
            }
            return null;
          })}
        </div>
      </Card>

      {/* Printable Report Modal */}
      <PrintableReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        record={record}
      />
    </div>
  );
};
