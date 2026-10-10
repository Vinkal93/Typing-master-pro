'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileJson,
  Lock,
} from 'lucide-react';
import { BackupRestoreService, RestorePreview } from '@/services/institute/backupRestoreService';
import { UserRole } from '@/types/institute';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface BackupRestoreViewProps {
  currentUser: { id: string; name: string; role: UserRole };
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  currentUser,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [uploadedJsonText, setUploadedJsonText] = useState('');
  const [preview, setPreview] = useState<RestorePreview | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const json = await BackupRestoreService.generateInstituteBackup(currentUser);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Typing_Master_Pro_Institute_Backup_v4_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      setUploadedJsonText(text);
      const p = await BackupRestoreService.inspectBackupFile(text);
      setPreview(p);
      setRestoreStatus(null);
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = async () => {
    if (!uploadedJsonText) return;
    setIsRestoring(true);
    try {
      const res = await BackupRestoreService.executeRestore(uploadedJsonText, currentUser);
      setRestoreStatus(res);
      if (res.success) {
        setPreview(null);
        setUploadedJsonText('');
      }
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>Encrypted Disaster Recovery & Integrity-Checked Backup</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Export full institute archives with SHA-256 tamper-detection checksums and restore safely without silent data overwrites.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Backup Card */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Download className="w-4 h-4 text-purple-600" />
              Export Institute Archive
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Generates a single self-contained JSON backup with student rosters, exam results, batch allocations, attendance records, and audit logs.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 font-mono">
            <div>✓ Format: Standard UTF-8 JSON (v4 Schema)</div>
            <div>✓ Integrity: SHA-256 Cryptographic Checksum</div>
            <div>✓ Includes: Phase 1–5 unified database</div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportBackup}
            disabled={isExporting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-xs font-semibold"
          >
            {isExporting ? 'Generating Archive...' : 'Download Verified Backup (.json)'}
          </Button>
        </div>

        {/* Restore Backup Card */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              Restore & Inspection
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload an existing backup file to inspect record counts and checksum integrity before confirming.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Backup File (.json):
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelected}
              className="text-xs w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
            />
          </div>

          {preview && (
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                <span>Restore Inspection Preview</span>
                <Badge variant={preview.checksumMatched ? 'green' : 'amber'} size="sm">
                  {preview.checksumMatched ? 'Checksum Verified' : 'Checksum Unverified'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                <div>Students: <strong>{preview.studentCount}</strong></div>
                <div>Batches: <strong>{preview.batchCount}</strong></div>
                <div>Attendance: <strong>{preview.attendanceCount}</strong></div>
                <div>Exams: <strong>{preview.examResultCount}</strong></div>
                <div>Assignments: <strong>{preview.testAssignmentCount}</strong></div>
                <div>Users: <strong>{preview.userCount}</strong></div>
              </div>

              {preview.errors.length > 0 && (
                <div className="text-[11px] text-amber-600 space-y-0.5">
                  {preview.errors.map((e, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{e}</span>
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmRestore}
                disabled={isRestoring || !preview.isValid}
                className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-semibold mt-2"
              >
                {isRestoring ? 'Applying Data...' : 'Confirm & Apply Restore'}
              </Button>
            </div>
          )}

          {restoreStatus && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                restoreStatus.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {restoreStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span>{restoreStatus.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
