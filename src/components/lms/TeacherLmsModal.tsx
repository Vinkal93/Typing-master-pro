'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Check, RotateCcw, Lock, Unlock, Sliders } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { storageService } from '@/services/storage/storageService';
import { COURSE_LEVEL_DEFINITIONS } from '@/services/curriculum/curriculumService';
import { LmsTeacherSettings, CourseLevelId } from '@/types/lms';

interface TeacherLmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged?: () => void;
}

export const TeacherLmsModal: React.FC<TeacherLmsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChanged,
}) => {
  const [settings, setSettings] = useState<LmsTeacherSettings>({
    unlockAllLessons: false,
    customLevelThresholds: {
      1: { minAccuracy: 85, minWpm: 0 },
      2: { minAccuracy: 90, minWpm: 0 },
      3: { minAccuracy: 92, minWpm: 15 },
      4: { minAccuracy: 94, minWpm: 20 },
      5: { minAccuracy: 95, minWpm: 25 },
      6: { minAccuracy: 97, minWpm: 30 },
    },
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    const adapter = await storageService.getAdapter();
    const loaded = await adapter.getTeacherSettings();
    setSettings(loaded);
    setIsSaved(false);
  };

  const handleToggleUnlockAll = () => {
    setSettings((prev) => ({
      ...prev,
      unlockAllLessons: !prev.unlockAllLessons,
    }));
  };

  const handleThresholdChange = (
    levelId: CourseLevelId,
    field: 'minAccuracy' | 'minWpm',
    value: number
  ) => {
    setSettings((prev) => ({
      ...prev,
      customLevelThresholds: {
        ...prev.customLevelThresholds,
        [levelId]: {
          ...prev.customLevelThresholds[levelId],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    const adapter = await storageService.getAdapter();
    await adapter.saveTeacherSettings(settings);
    setIsSaved(true);
    if (onSettingsChanged) onSettingsChanged();
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleResetDefaults = () => {
    setSettings({
      unlockAllLessons: false,
      customLevelThresholds: {
        1: { minAccuracy: 85, minWpm: 0 },
        2: { minAccuracy: 90, minWpm: 0 },
        3: { minAccuracy: 92, minWpm: 15 },
        4: { minAccuracy: 94, minWpm: 20 },
        5: { minAccuracy: 95, minWpm: 25 },
        6: { minAccuracy: 97, minWpm: 30 },
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="प्रशिक्षक नियंत्रण कक्ष (Teacher Control Panel)"
    >
      <div className="space-y-6 py-2">
        {/* Master Unlock Override */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {settings.unlockAllLessons ? (
                <Unlock className="w-5 h-5 text-emerald-600" />
              ) : (
                <Lock className="w-5 h-5 text-amber-600" />
              )}
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                सभी १६० पाठ तुरंत अनलॉक करें (Unlock All Lessons)
              </h4>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              छात्रों को बिना पूर्व-शर्तों के किसी भी स्तर का कोई भी पाठ चुनने की अनुमति दें।
            </p>
          </div>

          <Button
            variant={settings.unlockAllLessons ? 'primary' : 'outline'}
            size="sm"
            onClick={handleToggleUnlockAll}
            className={settings.unlockAllLessons ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            {settings.unlockAllLessons ? 'सक्रिय (Unlocked)' : 'निष्क्रिय (Default)'}
          </Button>
        </div>

        {/* Level Passing Criteria Adjustment */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-500" />
              प्रत्येक स्तर हेतु उत्तीर्णता मानक (Passing Thresholds)
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetDefaults}
              className="text-xs gap-1 text-slate-500"
            >
              <RotateCcw className="w-3 h-3" />
              डिफ़ॉल्ट रीसेट
            </Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {COURSE_LEVEL_DEFINITIONS.map((def) => {
              const currentThreshold = settings.customLevelThresholds[def.id] || {
                minAccuracy: def.defaultMinAccuracy,
                minWpm: def.defaultMinWpm,
              };

              return (
                <div
                  key={def.id}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Level {def.id}: {def.name}
                    </span>
                    <span className="text-xs text-slate-400 block font-devanagari">
                      {def.nameHindi}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-slate-500">शुद्धता %</label>
                      <input
                        type="number"
                        min="70"
                        max="100"
                        value={currentThreshold.minAccuracy}
                        onChange={(e) =>
                          handleThresholdChange(
                            def.id,
                            'minAccuracy',
                            parseInt(e.target.value) || 80
                          )
                        }
                        className="w-16 px-2 py-1 text-xs text-center border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-slate-500">WPM</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={currentThreshold.minWpm || 0}
                        onChange={(e) =>
                          handleThresholdChange(
                            def.id,
                            'minWpm',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-16 px-2 py-1 text-xs text-center border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            रद्द करें
          </Button>
          <Button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium"
          >
            {isSaved ? <Check className="w-4 h-4" /> : null}
            सेव एवं लागू करें
          </Button>
        </div>
      </div>
    </Modal>
  );
};
