'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  FileText,
  Award,
  Lock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface TeacherModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherModeModal: React.FC<TeacherModeModalProps> = ({ isOpen, onClose }) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAttemptLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('Teacher Administration Engine is scheduled for Phase 2 release. Phase 1 provides the underlying offline profile architecture.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Instructor & Teacher Administration Mode"
      subtitle="Computer Institute & Examination Center Control Panel"
      maxWidth="lg"
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs font-bold text-purple-900 dark:text-purple-200">
                Phase 2 Architecture Preview
              </p>
              <p className="text-[11px] text-purple-700 dark:text-purple-300">
                Teacher module is scheduled for implementation in Phase 2.
              </p>
            </div>
          </div>
          <Badge variant="purple" size="sm">Coming in Phase 2</Badge>
        </div>

        {/* Feature Preview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 text-purple-600 font-bold">
              <Users className="w-4 h-4" />
              <span>Batch Student Roster</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Import 50+ students at once via CSV/Excel, manage batch lab timings, and monitor individual completion.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 text-purple-600 font-bold">
              <FileText className="w-4 h-4" />
              <span>Custom Passage Uploader</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Upload custom institute Hindi and English dictation passages, court judgments, and custom practice drills.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 text-purple-600 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Strict Exam Kiosk Mode</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Simulate real government exam conditions: optional backspace disable, full-screen lockdown, and automated grading.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 text-purple-600 font-bold">
              <Award className="w-4 h-4" />
              <span>Institute Speed Certificates</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              One-click PDF generation of certified typing speed certificates stamped with institute name and student roll number.
            </p>
          </div>
        </div>

        {/* PIN Entry Wireframe */}
        <form onSubmit={handleAttemptLogin} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Instructor Security PIN:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setErrorMsg('');
                }}
                maxLength={6}
                placeholder="Enter 4 or 6-digit Instructor PIN"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            {errorMsg && (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                {errorMsg}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onClose} type="button">
              Close
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Access Teacher Portal
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
