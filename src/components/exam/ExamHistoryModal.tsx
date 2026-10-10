'use client';

import React, { useState, useEffect } from 'react';
import { Award, Download, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ExamAttemptRecord } from '@/types/exam';
import { storageService } from '@/services/storage/storageService';
import { ExamReportService } from '@/services/exam/examReportService';
import { PrintableReportModal } from './PrintableReportModal';

interface ExamHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
}

export const ExamHistoryModal: React.FC<ExamHistoryModalProps> = ({
  isOpen,
  onClose,
  profileId,
}) => {
  const [records, setRecords] = useState<ExamAttemptRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ExamAttemptRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, profileId]);

  const loadHistory = async () => {
    setIsLoading(true);
    const adapter = await storageService.getAdapter();
    const list = await adapter.getExamResults(profileId);
    setRecords(list);
    setIsLoading(false);
  };

  const handleExportAllCsv = () => {
    if (records.length === 0) return;
    const csv = ExamReportService.exportResultsToCsv(records);
    ExamReportService.downloadCsvFile(csv, `Typing_Exam_History_${profileId}.csv`);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="परीक्षा इतिहास एवं प्रदर्शन विवरण (Exam History)"
      >
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              कुल संपन्न परीक्षाएं: {records.length}
            </span>
            {records.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAllCsv}
                className="gap-1.5 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                सभी परिणाम CSV में डाउनलोड करें
              </Button>
            )}
          </div>

          {records.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              कोई पूर्व परीक्षा रिकॉर्ड उपलब्ध नहीं है। एक परीक्षा प्रारंभ करें।
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {records.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {r.presetTitle || r.passageTitle}
                      </span>
                      <Badge variant={r.passed ? 'green' : 'red'} size="sm">
                        {r.passed ? 'उत्तीर्ण' : 'अनुत्तीर्ण'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                      <span>{new Date(r.completedAt).toLocaleDateString('en-IN')}</span>
                      <span>• {r.language} ({r.layout})</span>
                      <span>• {Math.round(r.targetDurationSeconds / 60)} min</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <div className="text-base font-extrabold text-slate-900 dark:text-white">
                        {r.scoring.netWpm} WPM
                      </div>
                      <div className="text-xs text-slate-500">
                        {r.scoring.accuracy}% शुद्धता
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRecord(r)}
                      title="मुद्रण एवं प्रमाणपत्र देखें"
                      className="p-2 text-slate-600 hover:text-slate-900"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={onClose}>
              बंद करें
            </Button>
          </div>
        </div>
      </Modal>

      {selectedRecord && (
        <PrintableReportModal
          isOpen={selectedRecord !== null}
          onClose={() => setSelectedRecord(null)}
          record={selectedRecord}
        />
      )}
    </>
  );
};
