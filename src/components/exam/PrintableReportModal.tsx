'use client';

import React, { useRef } from 'react';
import { Printer, Download, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ExamAttemptRecord } from '@/types/exam';
import { ExamReportService } from '@/services/exam/examReportService';

interface PrintableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ExamAttemptRecord;
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    iframeRef.current.contentWindow.focus();
    iframeRef.current.contentWindow.print();
  };

  const handleDownloadCsv = () => {
    const csv = ExamReportService.exportResultsToCsv([record]);
    ExamReportService.downloadCsvFile(csv, `Scorecard_${record.studentName.replace(/\s+/g, '_')}.csv`);
  };

  const htmlContent = ExamReportService.generatePrintableHtml(record);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="मुद्रण योग्य परीक्षा प्रमाणपत्र एवं अंकतालिका"
    >
      <div className="space-y-4 py-2">
        {/* Preview Frame */}
        <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white h-[500px] shadow-inner">
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            title="Printable Scorecard"
            className="w-full h-full border-0"
          />
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            onClick={handleDownloadCsv}
            className="gap-2 text-xs"
          >
            <Download className="w-4 h-4" />
            CSV डेटा डाउनलोड करें
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              बंद करें
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium"
            >
              <Printer className="w-4 h-4" />
              प्रिंट / PDF में सहेजें
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
