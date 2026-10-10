'use client';

import React, { useState } from 'react';
import {
  Keyboard,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Type,
  Clock,
  User,
  Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AvatarBadge, AVATAR_OPTIONS } from '@/components/ui/AvatarBadge';
import { useProfile } from '@/context/ProfileContext';
import { KEYBOARD_LAYOUTS } from '@/services/keyboard/keyboardLayouts';
import { Language, KeyboardLayout, FontPreference } from '@/types';

export const OnboardingWizard: React.FC = () => {
  const { createProfile } = useProfile();

  // Wizard state (Steps 1 to 7)
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [rollNo, setRollNo] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('avatar-scholar');
  const [language, setLanguage] = useState<Language>('hindi');
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>('hindi_inscript');
  const [fontPreference, setFontPreference] = useState<FontPreference>('noto_sans_devanagari');
  const [dailyGoal, setDailyGoal] = useState<number>(15);

  const handleNextStep2 = () => {
    if (!name.trim()) {
      setNameError('Please enter the student name.');
      return;
    }
    if (name.trim().length < 2) {
      setNameError('Student name must be at least 2 characters.');
      return;
    }
    setNameError('');
    setStep(3);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    if (newLang === 'hindi') {
      setKeyboardLayout('hindi_inscript');
    } else {
      setKeyboardLayout('english_qwerty');
    }
  };

  const handleCompleteSetup = async () => {
    try {
      setIsSubmitting(true);
      await createProfile({
        name: name.trim(),
        avatar,
        instituteRollNo: rollNo.trim() || undefined,
        preferences: {
          language,
          keyboardLayout,
          fontPreference,
          dailyPracticeGoal: dailyGoal,
          theme: 'light',
          soundEffects: true,
          fontSize: 'normal',
        },
      });
    } catch (err: any) {
      console.error('Setup completion error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-4 md:p-8">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Typing Master Pro
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Professional Computer Institute Edition • First Launch Setup
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Step {step} of 7
          </span>
          <div className="w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Wizard Step Container */}
      <div className="max-w-3xl mx-auto w-full my-8">
        {/* ================= STEP 1: WELCOME SCREEN ================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <Badge variant="blue" size="md">
                <Sparkles className="w-3.5 h-3.5" /> Welcome to Typing Master Pro
              </Badge>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Master Hindi & English Touch Typing
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                Designed specifically for computer institute students preparing for government clerical
                exams, CPCT, High Court typing tests, and professional office mastery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <Card className="space-y-2 border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  100%
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Offline-First Architecture
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Runs directly on classroom lab computers without internet connection, cloud logins, or external dependencies.
                </p>
              </Card>

              <Card className="space-y-2 border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  BIS
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  InScript & Remington GAIL
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Full official support for Hindi InScript, Remington GAIL typewriter, and standard English QWERTY layouts.
                </p>
              </Card>

              <Card className="space-y-2 border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 flex items-center justify-center font-bold text-sm">
                  WPM
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Institute Exam Precision
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Strict Gross WPM, Net WPM, and Backspace deduction metrics calibrated to official government examination boards.
                </p>
              </Card>
            </div>

            <div className="pt-6 flex justify-end">
              <Button size="lg" onClick={() => setStep(2)} icon={<ArrowRight className="w-5 h-5" />}>
                Get Started
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: STUDENT PROFILE & AVATAR ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Student Profile Setup
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter the student information to track individual typing progress and examination readiness.
              </p>
            </div>

            <Card className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Student Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    placeholder="e.g. Rahul Sharma or Priya Verma"
                    className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    autoFocus
                  />
                </div>
                {nameError && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">{nameError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Institute Roll Number / Student ID <span className="text-xs font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="e.g. IT-2026-042"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Profile Avatar
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {AVATAR_OPTIONS.map((item) => {
                    const isSelected = avatar === item.id;
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAvatar(item.id)}
                        className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-600'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 ${item.bg}`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)} icon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button onClick={handleNextStep2} icon={<ArrowRight className="w-4 h-4" />}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: LANGUAGE SELECTION ================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Primary Practice Language
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose your primary learning focus. You can switch between languages at any time from the dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                hoverable
                onClick={() => handleLanguageChange('hindi')}
                className={`space-y-3 border-2 transition-all ${
                  language === 'hindi'
                    ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600 font-devanagari">अ</span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      Hindi Typing (हिन्दी)
                    </h3>
                  </div>
                  {language === 'hindi' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Recommended for government job aspirants, CPCT qualification, High Court clerk exams,
                  and State PSC computer proficiency certifications.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="blue" size="sm">InScript Layout</Badge>
                  <Badge variant="gray" size="sm">Remington GAIL</Badge>
                  <Badge variant="green" size="sm">Mangal & Noto</Badge>
                </div>
              </Card>

              <Card
                hoverable
                onClick={() => handleLanguageChange('english')}
                className={`space-y-3 border-2 transition-all ${
                  language === 'english'
                    ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">A</span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      English Typing
                    </h3>
                  </div>
                  {language === 'english' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Master touch typing on standard QWERTY keyboard with drills covering home row, top row,
                  number keys, punctuation, and speed drills.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="blue" size="sm">English QWERTY</Badge>
                  <Badge variant="gray" size="sm">Touch Typing Drills</Badge>
                  <Badge variant="purple" size="sm">Speed Benchmarks</Badge>
                </div>
              </Card>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)} icon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button onClick={() => setStep(4)} icon={<ArrowRight className="w-4 h-4" />}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: KEYBOARD LAYOUT SELECTION ================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Keyboard Layout Selection
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select the physical keyboard mapping you want to practice on.
              </p>
            </div>

            <div className="space-y-3">
              {(['hindi_inscript', 'remington_gail', 'english_qwerty'] as KeyboardLayout[]).map((layoutKey) => {
                const layout = KEYBOARD_LAYOUTS[layoutKey];
                const isSelected = keyboardLayout === layoutKey;

                return (
                  <Card
                    key={layoutKey}
                    hoverable
                    onClick={() => {
                      setKeyboardLayout(layoutKey);
                      if (layoutKey === 'english_qwerty') {
                        setLanguage('english');
                      } else {
                        setLanguage('hindi');
                      }
                    }}
                    className={`border-2 transition-all p-4 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                            {layout.name}
                          </h3>
                          <span className="text-xs text-slate-500 font-devanagari">
                            ({layout.hindiName})
                          </span>
                          {layoutKey === 'hindi_inscript' && (
                            <Badge variant="green" size="sm">Recommended for Exams</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {layout.description}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 font-medium pt-1">
                          📋 {layout.examUsage}
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                    </div>

                    {/* Home row preview */}
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 font-mono text-xs flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Home Row Anchor:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 tracking-wider font-devanagari">
                        {layout.homeRowPreview}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(3)} icon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button onClick={() => setStep(5)} icon={<ArrowRight className="w-4 h-4" />}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: FONT PREFERENCE ================= */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Hindi Font Preference & Live Preview
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose your font rendering. Typing Master Pro bundles Noto Sans Devanagari locally, guaranteeing 100% offline functionality.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                hoverable
                onClick={() => setFontPreference('mangal')}
                className={`border-2 p-4 transition-all ${
                  fontPreference === 'mangal'
                    ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Mangal Font (System Standard)
                  </h3>
                  {fontPreference === 'mangal' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Standard Windows system font utilized in government typing examinations across India.
                </p>
                <Badge variant="blue" size="sm">Govt Standard</Badge>
              </Card>

              <Card
                hoverable
                onClick={() => setFontPreference('noto_sans_devanagari')}
                className={`border-2 p-4 transition-all ${
                  fontPreference === 'noto_sans_devanagari'
                    ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Bundled Noto Sans Devanagari
                  </h3>
                  {fontPreference === 'noto_sans_devanagari' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Locally bundled open-source font. Guaranteed to render flawlessly even on bare lab PCs without Mangal installed.
                </p>
                <Badge variant="green" size="sm">Guaranteed Offline</Badge>
              </Card>
            </div>

            {/* Live Font Render Box */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">Live Font Rendering Preview:</span>
                <span className="text-blue-600 font-medium">
                  Active Font: {fontPreference === 'mangal' ? 'Mangal (or Noto Fallback)' : 'Bundled Noto Sans Devanagari'}
                </span>
              </div>
              <div
                className={`text-lg p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 ${
                  fontPreference === 'mangal' ? 'font-mangal-stack' : 'font-noto-stack'
                }`}
              >
                सत्यमेव जयते — अभ्यास ही सफलता की कुंजी है। निरंतर टाइपिंग अभ्यास से परीक्षा में पूर्ण अंक प्राप्त करें।
              </div>
              <p className="text-xs text-slate-400 italic">
                Verified: No external font CDN or Google Fonts runtime network requests required.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(4)} icon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button onClick={() => setStep(6)} icon={<ArrowRight className="w-4 h-4" />}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 6: DAILY PRACTICE GOAL ================= */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Daily Practice Goal
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Daily consistent practice builds muscle memory faster than irregular marathons. Set your target.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { mins: 10, title: '10 Minutes', desc: 'Gentle introduction for beginners', badge: 'Casual' },
                { mins: 15, title: '15 Minutes', desc: 'Standard classroom practice session', badge: 'Recommended', isRec: true },
                { mins: 20, title: '20 Minutes', desc: 'Accelerated prep for exam aspirants', badge: 'Aspirant' },
                { mins: 30, title: '30 Minutes', desc: 'Intensive high-speed typing mastery', badge: 'Mastery' },
              ].map((g) => {
                const isSelected = dailyGoal === g.mins;
                return (
                  <Card
                    key={g.mins}
                    hoverable
                    onClick={() => setDailyGoal(g.mins)}
                    className={`border-2 p-4 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                          {g.title}
                        </h3>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Badge variant={g.isRec ? 'blue' : 'gray'} size="sm">
                          {g.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {g.desc}
                    </p>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(5)} icon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button onClick={() => setStep(7)} icon={<ArrowRight className="w-4 h-4" />}>
                Review & Confirm
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 7: SETUP COMPLETION & SUMMARY ================= */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Setup Complete! Ready to Practice
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Your student profile and offline preferences are configured. Review details below:
              </p>
            </div>

            <Card className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Student Profile:</span>
                <div className="flex items-center gap-2">
                  <AvatarBadge avatarId={avatar} size="sm" />
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{name}</span>
                  {rollNo && <span className="text-xs text-slate-400">({rollNo})</span>}
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target Language:</span>
                <Badge variant="blue" size="sm">
                  {language === 'hindi' ? 'Hindi (हिन्दी)' : 'English'}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Keyboard Layout:</span>
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  {KEYBOARD_LAYOUTS[keyboardLayout].name}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Font Stack:</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {fontPreference === 'mangal' ? 'Mangal (with Noto fallback)' : 'Bundled Noto Sans Devanagari'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Daily Practice Target:</span>
                <span className="font-semibold text-sm text-blue-600">
                  {dailyGoal} Minutes per Day
                </span>
              </div>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(6)} icon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button
                size="lg"
                onClick={handleCompleteSetup}
                disabled={isSubmitting}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                {isSubmitting ? 'Saving Profile...' : 'Launch Student Dashboard'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="max-w-4xl mx-auto w-full pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Local Profile Storage • Safe for offline institute use</span>
        </div>
        <span>Typing Master Pro — Phase 1 Architecture</span>
      </div>
    </div>
  );
};
