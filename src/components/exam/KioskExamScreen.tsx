'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Lock,
  Unlock,
  AlertTriangle,
  KeyRound,
  Maximize2,
  XCircle,
} from 'lucide-react';
import { ExamScreen } from './ExamScreen';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ExamConfig, ExamPassage, ExamAttemptRecord } from '@/types/exam';
import { KioskViolationRecord } from '@/types/remington';
import { KioskLockdownService, DEFAULT_KIOSK_POLICY } from '@/services/kiosk/kioskLockdownService';
import { lanSyncService } from '@/services/network/lanSyncService';
import { audioService } from '@/services/engine/audioService';

interface KioskExamScreenProps {
  config: ExamConfig;
  passage: ExamPassage;
  onFinished: (record: ExamAttemptRecord) => void;
  onCancel: () => void;
}

export const KioskExamScreen: React.FC<KioskExamScreenProps> = ({
  config,
  passage,
  onFinished,
  onCancel,
}) => {
  const isStrictMode = config.mode === 'strict_exam';
  const [violationCount, setViolationCount] = useState<number>(0);
  const [latestViolation, setLatestViolation] = useState<KioskViolationRecord | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [violationsList, setViolationsList] = useState<KioskViolationRecord[]>([]);
  const [instructorPin, setInstructorPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [showWarningToast, setShowWarningToast] = useState<boolean>(false);

  const lockdownServiceRef = useRef<KioskLockdownService | null>(null);

  useEffect(() => {
    if (!isStrictMode) return;

    const lockdown = new KioskLockdownService(DEFAULT_KIOSK_POLICY);
    lockdownServiceRef.current = lockdown;

    lockdown.activateLockdown(
      (violation, totalCount) => {
        setViolationCount(totalCount);
        setLatestViolation(violation);
        setViolationsList(lockdown.getViolations());
        setShowWarningToast(true);
        audioService.playError();

        // Broadcast to LAN monitor
        lanSyncService.reportKioskViolation(violation, totalCount);

        // Hide toast after 4s
        setTimeout(() => setShowWarningToast(false), 4000);
      },
      () => {
        // Lockdown breach! (3 violations)
        setIsLocked(true);
        audioService.playError();
      }
    );

    // Subscribe to instructor unlock command via LAN
    const unsubscribe = lanSyncService.subscribeMessages((msg) => {
      if (msg.type === 'INSTRUCTOR_UNLOCK_COMMAND') {
        const targetId = msg.payload?.targetTerminalId;
        if (!targetId || targetId === lanSyncService.getCurrentTerminalId()) {
          setIsLocked(false);
          setPinError('');
        }
      } else if (msg.type === 'INSTRUCTOR_LOCK_COMMAND') {
        const targetId = msg.payload?.targetTerminalId;
        if (!targetId || targetId === lanSyncService.getCurrentTerminalId()) {
          setIsLocked(true);
        }
      }
    });

    return () => {
      unsubscribe();
      lockdown.deactivateLockdown();
    };
  }, [isStrictMode]);

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default master instructor PIN is 123456 or admin
    if (instructorPin.trim() === '123456' || instructorPin.trim() === 'admin123') {
      setIsLocked(false);
      setInstructorPin('');
      setPinError('');
      // Request fullscreen again if exited
      if (typeof document !== 'undefined' && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      setPinError('अमान्य शिक्षक पिन (Invalid Instructor PIN). कृपया सही 6-अंकीय पिन दर्ज करें।');
      audioService.playError();
    }
  };

  const handleForceSubmit = () => {
    // If instructor opts to terminate/submit the exam upon breach
    setIsLocked(false);
    onCancel();
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-50 dark:bg-slate-950 select-none">
      {/* Strict Kiosk Header Banner */}
      {isStrictMode && (
        <div className="bg-slate-900 border-b border-slate-800 text-white px-4 py-1.5 flex items-center justify-between text-xs sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold tracking-wide flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              कियोस्क परीक्षा मोड सक्रिय (STRICT KIOSK LOCKDOWN ACTIVE)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">सुरक्षा उल्लंघन (Violations):</span>
              <Badge
                variant={violationCount === 0 ? 'green' : violationCount >= 2 ? 'red' : 'amber'}
                size="sm"
              >
                {violationCount} / {DEFAULT_KIOSK_POLICY.maxViolationsAllowed}
              </Badge>
            </div>

            <button
              onClick={() => {
                if (typeof document !== 'undefined' && !document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              title="पूर्ण स्क्रीन लागू करें"
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Violation Toast */}
      {showWarningToast && latestViolation && (
        <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-rose-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-rose-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse text-amber-200" />
            <div>
              <p className="font-bold text-sm">सुरक्षा चेतावनी! (Security Warning #{violationCount})</p>
              <p className="text-xs text-rose-100">
                {latestViolation.details}. 3 उल्लंघनों के बाद परीक्षा सत्र लॉक हो जाएगा।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Underlying Exam Screen */}
      <div className={isLocked ? 'filter blur-sm pointer-events-none' : ''}>
        <ExamScreen
          config={config}
          passage={passage}
          onFinished={onFinished}
          onCancel={onCancel}
        />
      </div>

      {/* Instructor Breach Lock Modal */}
      {isLocked && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/50 text-rose-600 rounded-full flex items-center justify-center mx-auto border-4 border-rose-200 dark:border-rose-900">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                परीक्षा सत्र अवरुद्ध (EXAM LOCKED)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                सुरक्षा नीतियों के बार-बार उल्लंघन ({DEFAULT_KIOSK_POLICY.maxViolationsAllowed} बार) के कारण यह कंप्यूटर लॉक कर दिया गया है।
              </p>
            </div>

            {/* List of Breaches */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-left max-h-36 overflow-y-auto space-y-1.5 text-xs">
              <div className="font-semibold text-slate-700 dark:text-slate-300">दर्ज उल्लंघन विवरण:</div>
              {violationsList.map((v, idx) => (
                <div key={v.id || idx} className="flex items-start gap-1.5 text-rose-600 dark:text-rose-400">
                  <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    #{idx + 1}: {v.details} ({new Date(v.timestamp).toLocaleTimeString()})
                  </span>
                </div>
              ))}
            </div>

            {/* Teacher Unlock Form */}
            <form onSubmit={handleUnlockWithPin} className="space-y-3 pt-2">
              <div className="text-left">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  शिक्षक अनलॉक पिन (Instructor Override PIN)
                </label>
                <input
                  type="password"
                  placeholder="शिक्षक पिन (उदा. 123456)"
                  value={instructorPin}
                  onChange={(e) => {
                    setInstructorPin(e.target.value);
                    setPinError('');
                  }}
                  autoFocus
                  className="w-full mt-1 px-3 py-2 text-center tracking-widest text-lg font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {pinError && <p className="text-xs text-rose-500 mt-1">{pinError}</p>}
                <p className="text-[11px] text-slate-500 mt-1">
                  डिफ़ॉल्ट मास्टर पिन: <code className="font-mono font-bold text-slate-700 dark:text-slate-300">123456</code>
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleForceSubmit}
                  className="flex-1 text-xs border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                >
                  परीक्षा समाप्त करें
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700"
                >
                  <Unlock className="w-3.5 h-3.5 mr-1" />
                  पुनः अनलॉक करें
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
