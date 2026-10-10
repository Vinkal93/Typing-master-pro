'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  Award,
  Zap,
  Target,
  Calendar,
  BookOpen,
  FileCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { AchievementService } from '@/services/achievements/achievementService';
import {
  AchievementDefinition,
  StudentAchievement,
  AchievementCategory,
} from '@/types/analytics';

export const AchievementsView: React.FC = () => {
  const { activeProfile } = useProfile();
  const [unlocked, setUnlocked] = useState<StudentAchievement[]>([]);
  const [allDefinitions, setAllDefinitions] = useState<AchievementDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [newlyUnlockedCount, setNewlyUnlockedCount] = useState<number | null>(null);

  const loadAchievements = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      // Evaluate first to award any pending achievements
      const newlyAwarded = await AchievementService.evaluateAndAwardAchievements(activeProfile.id);
      if (newlyAwarded.length > 0) {
        setNewlyUnlockedCount(newlyAwarded.length);
      }

      const status = await AchievementService.getStudentAchievementStatus(activeProfile.id);
      setUnlocked(status.unlocked);
      setAllDefinitions(status.allDefinitions);
    } catch (err) {
      console.error('Failed to load achievements:', err);
    } finally {
      setLoading(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  if (!activeProfile) return null;

  const unlockedMap = new Map<string, StudentAchievement>();
  unlocked.forEach((u) => unlockedMap.set(u.achievementCode, u));

  const filteredDefinitions =
    selectedCategory === 'all'
      ? allDefinitions
      : allDefinitions.filter((d) => d.category === selectedCategory);

  const totalAchievements = allDefinitions.length;
  const unlockedCount = unlocked.length;
  const progressPct = totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header and Progress Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-600">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                उपलब्धियां एवं पदक (Student Achievements)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                टंकण अभ्यास, परीक्षा और गति के कीर्तिमानों पर अर्जित विशिष्ट पदक
              </p>
            </div>
          </div>

          <button
            onClick={loadAchievements}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>उपलब्धियां जांचें</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              कुल प्रगति: {unlockedCount} / {totalAchievements} पदक अनलॉक
            </span>
            <span className="font-black text-amber-600 dark:text-amber-400">
              {progressPct}% पूर्ण
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              style={{ width: `${progressPct}%` }}
              className="h-full bg-linear-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-bold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>श्रेणी:</span>
          </div>
          {[
            { id: 'all', label: 'सभी पदक (All)' },
            { id: 'speed', label: 'गति (Speed)' },
            { id: 'accuracy', label: 'सटीकता (Accuracy)' },
            { id: 'consistency', label: 'नियमितता (Consistency)' },
            { id: 'curriculum', label: 'पाठ्यक्रम (Curriculum)' },
            { id: 'exam', label: 'परीक्षा (Exam)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Newly Unlocked Toast Alert */}
      {newlyUnlockedCount && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>बधाई! आपके खाते में {newlyUnlockedCount} नई उपलब्धियाँ जोड़ी गई हैं!</span>
          </div>
          <button
            onClick={() => setNewlyUnlockedCount(null)}
            className="text-emerald-700 hover:underline"
          >
            बंद करें
          </button>
        </div>
      )}

      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDefinitions.map((def) => {
          const unlockedItem = unlockedMap.get(def.code);
          const isUnlocked = !!unlockedItem;

          return (
            <div
              key={def.id}
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                isUnlocked
                  ? 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/60 shadow-xs'
                  : 'bg-slate-50/70 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div>
                {/* Header: Tier & Category */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      def.tier === 'platinum'
                        ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : def.tier === 'gold'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : def.tier === 'silver'
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                        : 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                    }`}
                  >
                    {def.tier}
                  </span>

                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>अनलॉक</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>लॉक</span>
                    </span>
                  )}
                </div>

                {/* Trophy Title */}
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mb-0.5">
                  {def.titleHindi}
                </h3>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  {def.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {def.descriptionHindi}
                </p>
              </div>

              {/* Footer: Date or Requirement */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                {isUnlocked ? (
                  <div className="text-slate-500 flex justify-between items-center">
                    <span>प्राप्त: {new Date(unlockedItem.unlockedAt).toLocaleDateString()}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      मूल्य: {unlockedItem.metricValueAtUnlock}
                    </span>
                  </div>
                ) : (
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>लक्ष्य:</span>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                      {def.threshold} ({def.requiredMetric})
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
