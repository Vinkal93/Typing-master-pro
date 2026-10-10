'use client';

import React, { useState } from 'react';
import {
  Settings,
  Languages,
  Keyboard,
  Type,
  Clock,
  Volume2,
  VolumeX,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useProfile } from '@/context/ProfileContext';
import { storageService } from '@/services/storage/storageService';
import { Language, KeyboardLayout, FontPreference } from '@/types';
import { KEYBOARD_LAYOUTS } from '@/services/keyboard/keyboardLayouts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { activeProfile, updateProfile, refreshProfiles } = useProfile();

  const [language, setLanguage] = useState<Language>(
    activeProfile?.preferences.language || 'hindi'
  );
  const [layout, setLayout] = useState<KeyboardLayout>(
    activeProfile?.preferences.keyboardLayout || 'hindi_inscript'
  );
  const [fontPref, setFontPref] = useState<FontPreference>(
    activeProfile?.preferences.fontPreference || 'noto_sans_devanagari'
  );
  const [dailyGoal, setDailyGoal] = useState<number>(
    activeProfile?.preferences.dailyPracticeGoal || 15
  );
  const [soundEffects, setSoundEffects] = useState<boolean>(
    activeProfile?.preferences.soundEffects ?? true
  );

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePreferences = async () => {
    if (!activeProfile) return;
    try {
      setIsSaving(true);
      await updateProfile({
        ...activeProfile,
        preferences: {
          ...activeProfile.preferences,
          language,
          keyboardLayout: layout,
          fontPreference: fontPref,
          dailyPracticeGoal: dailyGoal,
          soundEffects,
        },
      });
      setStatusMessage({ type: 'success', text: 'Preferences saved successfully!' });
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 800);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const storage = await storageService.getAdapter();
      const json = await storage.exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `typing_master_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMessage({ type: 'success', text: 'Backup exported successfully!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Export failed: ' + err.message });
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const storage = await storageService.getAdapter();
        const result = await storage.importData(text);
        if (result.success) {
          await refreshProfiles();
          setStatusMessage({ type: 'success', text: result.message });
        } else {
          setStatusMessage({ type: 'error', text: result.message });
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: 'Corrupt backup file: ' + err.message });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application & Student Settings"
      subtitle="Configure layout, font rendering, practice targets, and data backup"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {statusMessage && (
          <div
            className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* 1. Language & Layout */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Language & Keyboard Layout
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="block text-slate-600 dark:text-slate-400 mb-1">Target Language:</span>
              <select
                value={language}
                onChange={(e) => {
                  const val = e.target.value as Language;
                  setLanguage(val);
                  if (val === 'hindi' && layout === 'english_qwerty') {
                    setLayout('hindi_inscript');
                  } else if (val === 'english') {
                    setLayout('english_qwerty');
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="hindi">Hindi (हिन्दी)</option>
                <option value="english">English</option>
              </select>
            </div>

            <div>
              <span className="block text-slate-600 dark:text-slate-400 mb-1">Keyboard Layout:</span>
              <select
                value={layout}
                onChange={(e) => {
                  const val = e.target.value as KeyboardLayout;
                  setLayout(val);
                  if (val === 'english_qwerty') setLanguage('english');
                  else setLanguage('hindi');
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="hindi_inscript">Hindi InScript (BIS Govt Standard)</option>
                <option value="remington_gail">Remington GAIL (Court/Typewriter)</option>
                <option value="english_qwerty">English QWERTY</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Font Preference */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Hindi Font Rendering
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setFontPref('mangal')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                fontPref === 'mangal'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Mangal (Windows Standard)
            </button>
            <button
              type="button"
              onClick={() => setFontPref('noto_sans_devanagari')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                fontPref === 'noto_sans_devanagari'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Bundled Noto Sans (Offline)
            </button>
          </div>
        </div>

        {/* 3. Daily Practice Goal & Sound */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Daily Practice Target:
            </label>
            <select
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value={10}>10 Minutes / Day</option>
              <option value={15}>15 Minutes / Day (Recommended)</option>
              <option value={20}>20 Minutes / Day (Exam Prep)</option>
              <option value={30}>30 Minutes / Day (Intensive)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Typing Audio Feedback:
            </label>
            <button
              type="button"
              onClick={() => setSoundEffects(!soundEffects)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <span>Keyboard Click Sound</span>
              {soundEffects ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Volume2 className="w-4 h-4" /> Enabled
                </span>
              ) : (
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <VolumeX className="w-4 h-4" /> Muted
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 4. Offline Data Backup & Migration */}
        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Offline Institute Backup & Migration
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export All Data (JSON)
            </Button>

            <label className="inline-flex items-center justify-center font-medium rounded-lg text-xs px-3 py-1.5 gap-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-200 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-[11px] text-slate-400">
            Export allows transferring student practice profiles between classroom laboratory PCs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSavePreferences}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
