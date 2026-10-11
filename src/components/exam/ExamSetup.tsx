'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Play,
  Clock,
  Sparkles,
  Sliders,
  History,
  Plus,
  BookOpen,
  Keyboard as KeyboardIcon,
  ShieldAlert,
  Check,
  FileText,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useProfile } from '@/context/ProfileContext';
import {
  BackspacePolicy,
  ExamConfig,
  ExamDifficulty,
  ExamDurationMinutes,
  ExamLanguage,
  ExamLayout,
  ExamMode,
  ExamPassage,
  ExamProfilePreset,
  ScoringPolicyType,
} from '@/types/exam';
import { EXAM_PRESETS, ExamPresetService } from '@/services/exam/examPresets';
import { BUILTIN_EXAM_PASSAGES, PassageLibraryService } from '@/services/exam/passageLibrary';
import { storageService } from '@/services/storage/storageService';
import { CustomPassageModal } from './CustomPassageModal';
import { ExamHistoryModal } from './ExamHistoryModal';

interface ExamSetupProps {
  onStartExam: (config: ExamConfig, passage: ExamPassage) => void;
}

export const ExamSetup: React.FC<ExamSetupProps> = ({ onStartExam }) => {
  const { activeProfile } = useProfile();

  // Configuration state
  const [language, setLanguage] = useState<ExamLanguage>('Hindi');
  const [layout, setLayout] = useState<ExamLayout>('Hindi InScript');
  const [durationMinutes, setDurationMinutes] = useState<ExamDurationMinutes>(15);
  const [mode, setMode] = useState<ExamMode>('strict_exam');
  const [difficulty, setDifficulty] = useState<ExamDifficulty>('intermediate');
  const [backspacePolicy, setBackspacePolicy] = useState<BackspacePolicy>('allowed');
  const [scoringPolicy, setScoringPolicy] = useState<ScoringPolicyType>('cpct_hindi');
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState<boolean>(false);
  const [playSound, setPlaySound] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset_cpct_hindi_15m');

  // Passages
  const [passages, setPassages] = useState<ExamPassage[]>(BUILTIN_EXAM_PASSAGES);
  const [selectedPassageId, setSelectedPassageId] = useState<string>('pass_hi_inter_01');

  // Modals
  const [isCustomPassageOpen, setIsCustomPassageOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Load custom passages from storage
  const loadCustomPassages = async () => {
    try {
      const adapter = await storageService.getAdapter();
      const customList = await adapter.getCustomPassages();
      setPassages([...BUILTIN_EXAM_PASSAGES, ...customList]);
    } catch {
      // Storage fallback
    }
  };

  useEffect(() => {
    loadCustomPassages();
  }, []);

  // Update layout and passage when language changes
  const handleLanguageChange = (newLang: ExamLanguage) => {
    setLanguage(newLang);
    if (newLang === 'Hindi') {
      setLayout('Hindi InScript');
      setScoringPolicy('cpct_hindi');
      setSelectedPresetId('preset_cpct_hindi_15m');
      const hiPassage = passages.find((p) => p.language === 'Hindi');
      if (hiPassage) setSelectedPassageId(hiPassage.id);
    } else {
      setLayout('English QWERTY');
      setScoringPolicy('ssc_cgl');
      setSelectedPresetId('preset_ssc_chsl_english_15m');
      const enPassage = passages.find((p) => p.language === 'English');
      if (enPassage) setSelectedPassageId(enPassage.id);
    }
  };

  // 1-Click apply preset
  const handleApplyPreset = (preset: ExamProfilePreset) => {
    setSelectedPresetId(preset.id);
    setLanguage(preset.language);
    setLayout(preset.layout);
    setDurationMinutes(preset.durationMinutes);
    setMode(preset.mode);
    setBackspacePolicy(preset.backspacePolicy);
    setScoringPolicy(preset.scoringPolicy);
    setShowVirtualKeyboard(preset.allowVirtualKeyboard);
    setPlaySound(preset.allowSound);

    // Pick appropriate passage
    const matching = passages.find((p) => p.language === preset.language);
    if (matching) setSelectedPassageId(matching.id);
  };

  // Filter passages by current language & difficulty
  const availablePassages = passages.filter((p) => p.language === language);
  const currentPassage = passages.find((p) => p.id === selectedPassageId) || availablePassages[0] || passages[0];

  const handleStart = () => {
    const config: ExamConfig = {
      language,
      layout,
      durationMinutes,
      mode,
      difficulty,
      passageId: currentPassage.id,
      backspacePolicy,
      scoringPolicy,
      presetId: selectedPresetId,
      showVirtualKeyboard,
      playSound,
      minNetWpm: selectedPresetId ? ExamPresetService.getPresetById(selectedPresetId)?.minNetWpm : undefined,
      minAccuracy: selectedPresetId ? ExamPresetService.getPresetById(selectedPresetId)?.minAccuracy : undefined,
    };

    onStartExam(config, currentPassage);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              पेशेवर टंकण परीक्षा प्रणाली (Examination Mode)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            सरकारी एवं संस्थागत परीक्षा कक्ष (Typing Examination)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            मध्य प्रदेश सीपीसीटी (CPCT), एसएससी (SSC), उच्च न्यायालय एवं रेलवे टंकण परीक्षा प्रारूप का वास्तविक मूल्यांकन।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsHistoryOpen(true)}
            className="gap-2 text-xs"
          >
            <History className="w-4 h-4" />
            परीक्षा इतिहास एवं रिपोर्ट
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsCustomPassageOpen(true)}
            className="gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            कस्टम गद्यांश जोड़ें
          </Button>
        </div>
      </div>

      {/* Official Government Presets Quick Select */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            परीक्षा प्रारूप पूर्व-सेट (Official Exam Presets)
          </h3>
          <span className="text-xs text-slate-400">१-क्लिक मानक चयन</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EXAM_PRESETS.map((p) => {
            const isSelected = selectedPresetId === p.id;

            return (
              <div
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-500 shadow-sm ring-1 ring-blue-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-500 block uppercase">
                    {p.organization}
                  </span>
                  <Badge variant={p.language === 'Hindi' ? 'green' : 'blue'} size="sm">
                    {p.durationMinutes} min
                  </Badge>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1 line-clamp-1">
                  {p.titleHindi || p.title}
                </h4>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>न्यूनतम: {p.minNetWpm} WPM</span>
                  <span>{p.minAccuracy}% शुद्धता</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Language, Layout & Duration */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-500" />
            मूल परीक्षा विन्यास (Core Setup)
          </h3>

          {/* Language Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              टंकण भाषा (Typing Language)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLanguageChange('Hindi')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  language === 'Hindi'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Hindi (हिंदी इनस्क्रिप्ट)
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('English')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  language === 'English'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                English (अंग्रेजी)
              </button>
            </div>
          </div>

          {/* Keyboard Layout Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              कीबोर्ड लेआउट (Keyboard Layout)
            </label>
            <div className="space-y-2">
              {language === 'Hindi' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setLayout('Hindi InScript')}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs text-left transition-all ${
                      layout === 'Hindi InScript'
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {layout === 'Hindi InScript' ? (
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-400 flex-shrink-0" />
                      )}
                      <div>
                        <span>Hindi InScript (IS 16350 मानक)</span>
                        <p className="text-[10px] text-slate-500 font-normal">केंद्र व राज्य सरकारी भर्ती एवं SSC मानक</p>
                      </div>
                    </div>
                    <Badge variant={layout === 'Hindi InScript' ? 'green' : 'gray'} size="sm">
                      सत्यापित
                    </Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayout('Hindi Remington GAIL')}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs text-left transition-all ${
                      layout === 'Hindi Remington GAIL'
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {layout === 'Hindi Remington GAIL' ? (
                        <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-400 flex-shrink-0" />
                      )}
                      <div>
                        <span>Hindi Remington GAIL (रेमिंगटन गेल)</span>
                        <p className="text-[10px] text-slate-500 font-normal">CPCT, हाईकोर्ट व पारंपरिक टाइपराइटर लेआउट</p>
                      </div>
                    </div>
                    <Badge variant={layout === 'Hindi Remington GAIL' ? 'blue' : 'gray'} size="sm">
                      सक्रिय एवं Alt कोड समर्थित
                    </Badge>
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                      English QWERTY
                    </span>
                  </div>
                  <Badge variant="green" size="sm">सक्रिय एवं सत्यापित</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Duration Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>परीक्षा समयावधि (Duration)</span>
              <span className="font-mono text-blue-600 font-bold">{durationMinutes} मिनट</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 font-mono text-xs">
              {([1, 2, 5, 10, 15, 30, 60] as ExamDurationMinutes[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDurationMinutes(d)}
                  className={`py-1.5 rounded-lg border transition-all ${
                    durationMinutes === d
                      ? 'bg-blue-600 text-white font-bold border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Right Column: Policies, Mode & Passage */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            परीक्षा नीतियां एवं नियंत्रण (Exam Rules)
          </h3>

          {/* Mode Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              परीक्षा मोड (Exam Mode)
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setMode('strict_exam')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  mode === 'strict_exam'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-950 dark:text-rose-200 font-bold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="block font-bold">कठोर परीक्षा (Strict)</span>
                <span className="text-[10px] opacity-75">लाइव त्रुटि संकेत व गति छिपाए रखें</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('practice')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  mode === 'practice'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-950 dark:text-emerald-200 font-bold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="block font-bold">अभ्यास मोड (Practice)</span>
                <span className="text-[10px] opacity-75">लाइव गति, विराम व वर्चुअल कीबोर्ड</span>
              </button>
            </div>
          </div>

          {/* Backspace Policy Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              बैकस्पेस नीति (Backspace Policy)
            </label>
            <select
              value={backspacePolicy}
              onChange={(e) => setBackspacePolicy(e.target.value as BackspacePolicy)}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="allowed">पूर्ण अनुमति (Allowed: किसी भी शब्द को बैकस्पेस करें)</option>
              <option value="restricted_current_word">वर्तमान शब्द तक सीमित (Restricted: केवल चालू शब्द)</option>
              <option value="disabled">पूर्णतः अवरुद्ध (Disabled: बैकस्पेस पूर्ण बंद)</option>
            </select>
          </div>

          {/* Passage Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>परीक्षा गद्यांश (Passage Content)</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {currentPassage.wordCount} शब्द
              </span>
            </label>
            <select
              value={selectedPassageId}
              onChange={(e) => setSelectedPassageId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-devanagari"
            >
              {availablePassages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.wordCount} words)
                </option>
              ))}
            </select>
          </div>

          {/* Toggles row */}
          <div className="flex items-center justify-between pt-2 text-xs text-slate-600 dark:text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showVirtualKeyboard}
                onChange={(e) => setShowVirtualKeyboard(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>वर्चुअल कीबोर्ड दिखाएं</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={playSound}
                onChange={(e) => setPlaySound(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>कीस्ट्रोक ध्वनि (Sound)</span>
            </label>
          </div>
        </Card>
      </div>

      {/* Action CTA Banner */}
      <div className="p-4 bg-slate-900 text-white dark:bg-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <h3 className="font-bold text-base">
            परीक्षा आरंभ करने के लिए तैयार हैं?
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            समय: {durationMinutes} मिनट • भाषा: {language} ({layout}) • नीति: {backspacePolicy}
          </p>
        </div>

        <Button
          onClick={handleStart}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 px-8 py-3 text-sm shadow-md"
        >
          <Play className="w-4 h-4" />
          परीक्षा प्रारंभ करें (Start Exam)
        </Button>
      </div>

      {/* Modals */}
      <CustomPassageModal
        isOpen={isCustomPassageOpen}
        onClose={() => setIsCustomPassageOpen(false)}
        onPassageCreated={(newP) => {
          loadCustomPassages();
          setSelectedPassageId(newP.id);
        }}
      />

      <ExamHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        profileId={activeProfile?.id || 'guest'}
      />
    </div>
  );
};
