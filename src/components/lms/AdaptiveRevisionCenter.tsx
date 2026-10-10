'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Play,
  ArrowLeft,
  CheckCircle,
  Keyboard as KeyboardIcon,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useProfile } from '@/context/ProfileContext';
import { storageService } from '@/services/storage/storageService';
import { AdaptivePracticeService } from '@/services/lms/adaptivePracticeService';
import { CharacterMistakeStat, LmsLesson } from '@/types/lms';
import { LessonPlayer } from './LessonPlayer';

interface AdaptiveRevisionCenterProps {
  onBack: () => void;
}

export const AdaptiveRevisionCenter: React.FC<AdaptiveRevisionCenterProps> = ({ onBack }) => {
  const { activeProfile } = useProfile();
  const [mistakes, setMistakes] = useState<CharacterMistakeStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDrillLesson, setActiveDrillLesson] = useState<LmsLesson | null>(null);

  const loadMistakes = async () => {
    if (!activeProfile) return;
    setIsLoading(true);
    const adapter = await storageService.getAdapter();
    const stats = await adapter.getMistakeStats(activeProfile.id);
    const sorted = stats.filter((s) => s.errorCount > 0).sort((a, b) => b.errorCount - a.errorCount);
    setMistakes(sorted);
    setIsLoading(false);
  };

  useEffect(() => {
    loadMistakes();
  }, [activeProfile]);

  const handleStartAdaptiveDrill = () => {
    const drill = AdaptivePracticeService.generateAdaptiveLesson(mistakes);
    setActiveDrillLesson(drill);
  };

  const handleResetCharacter = async (char: string) => {
    if (!activeProfile) return;
    await AdaptivePracticeService.resetWeakCharacter(activeProfile.id, char);
    await loadMistakes();
  };

  if (activeDrillLesson) {
    return (
      <LessonPlayer
        lesson={activeDrillLesson}
        onBack={() => {
          setActiveDrillLesson(null);
          loadMistakes();
        }}
        onLessonCompleted={() => {
          setActiveDrillLesson(null);
          loadMistakes();
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                स्मार्ट अनुकूली संशोधन केंद्र
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              कमजोर कुंजियों का त्रुटि-निवारण (Adaptive Revision)
            </h1>
          </div>
        </div>

        {mistakes.length > 0 && (
          <Button
            onClick={handleStartAdaptiveDrill}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold gap-2 shadow-sm"
          >
            <Play className="w-4 h-4" />
            अनुकूली अभ्यास प्रारंभ करें
          </Button>
        )}
      </div>

      {/* Explanation Banner */}
      <div className="p-4 rounded-xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 text-sm text-violet-900 dark:text-violet-300 leading-relaxed">
        यह प्रणाली आपके द्वारा किए गए सभी टंकण प्रयासों का स्थानीय विश्लेषण करती है। जिन विशिष्ट अक्षरों या कुंजियों पर आपसे बार-बार गलतियां होती हैं, उनके लिए स्वचालित रूप से विशेष सुधारात्मक अभ्यास तैयार किए जाते हैं।
      </div>

      {/* Weak Keys Grid or Empty State */}
      {mistakes.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            कोई कमजोर कुंजी दर्ज नहीं है!
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            बधाई! आपके द्वारा किए गए अभ्यासों में अभी तक कोई बारंबार त्रुटि दर्ज नहीं हुई है। पाठ्यक्रम के पाठों का अभ्यास जारी रखें।
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-white text-base">
              शीर्ष त्रुटिपूर्ण वर्ण एवं कुंजियां ({mistakes.length})
            </h3>
            <span className="text-xs text-slate-500">
              त्रुटि आवृत्ति के अनुसार क्रमबद्ध
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mistakes.map((stat) => (
              <Card
                key={stat.char}
                className="p-4 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-devanagari text-2xl font-bold text-slate-900 dark:text-white shadow-inner">
                    {stat.char}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
                        {stat.keyCode || 'Physical Key'}
                      </span>
                    </div>
                    <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                      {stat.errorCount} गलतियां दर्ज
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResetCharacter(stat.char)}
                  title="त्रुटि गणना रीसेट करें"
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
