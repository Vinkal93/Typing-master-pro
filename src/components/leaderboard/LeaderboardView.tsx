'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  Users,
  Medal,
  Flame,
  Target,
  Zap,
  Filter,
  RefreshCw,
  Shield,
  EyeOff,
  Eye,
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { LeaderboardService } from '@/services/leaderboard/leaderboardService';
import {
  LeaderboardEntry,
  BatchLeaderboardEntry,
  LeaderboardFilter,
  LeaderboardMetric,
  LeaderboardTimeframe,
} from '@/types/analytics';
import { ExamLanguage, ExamLayout, ExamDurationMinutes, ScoringPolicyType } from '@/types/exam';

export const LeaderboardView: React.FC = () => {
  const { activeProfile, updateProfile } = useProfile();
  const [activeTab, setActiveTab] = useState<'students' | 'batches'>('students');

  // Fairness Filters
  const [language, setLanguage] = useState<ExamLanguage>('Hindi');
  const [layout, setLayout] = useState<ExamLayout>('Hindi InScript');
  const [durationMinutes, setDurationMinutes] = useState<ExamDurationMinutes>(5);
  const [scoringPolicy, setScoringPolicy] = useState<ScoringPolicyType>('standard');
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('all_time');
  const [metric, setMetric] = useState<LeaderboardMetric>('speed');

  const [studentEntries, setStudentEntries] = useState<LeaderboardEntry[]>([]);
  const [batchEntries, setBatchEntries] = useState<BatchLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'students') {
        const filter: LeaderboardFilter = {
          language,
          keyboardLayout: layout,
          durationMinutes,
          scoringPolicy,
          timeframe,
          metric,
        };
        const list = await LeaderboardService.getStudentLeaderboard(filter, activeProfile?.id);
        setStudentEntries(list);
      } else {
        const list = await LeaderboardService.getBatchLeaderboard();
        setBatchEntries(list);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, language, layout, durationMinutes, scoringPolicy, timeframe, metric, activeProfile]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const togglePrivacy = async () => {
    if (!activeProfile) return;
    const currentPrivacy = activeProfile.preferences.showOnLeaderboard ?? true;
    await updateProfile({
      ...activeProfile,
      preferences: {
        ...activeProfile.preferences,
        showOnLeaderboard: !currentPrivacy,
      },
    });
    loadLeaderboard();
  };

  const isShowName = activeProfile?.preferences.showOnLeaderboard ?? true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>लीडरबोर्ड एवं रैंकिंग (Institute Leaderboard)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            समान परीक्षा मानकों, भाषा और समय सीमा पर आधारित निष्पक्ष रैंकिंग (Fair Comparison Engine)
          </p>
        </div>

        {/* Tab & Privacy Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'students'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              छात्र रैंकिंग
            </button>
            <button
              onClick={() => setActiveTab('batches')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'batches'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              बैच रैंकिंग
            </button>
          </div>

          {/* Privacy Toggle */}
          <button
            onClick={togglePrivacy}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isShowName
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                : 'border-slate-300 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
            title="लीडरबोर्ड पर अपना नाम दिखाएं या गोपनीय रखें"
          >
            {isShowName ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isShowName ? 'नाम दृश्यमान' : 'नाम गोपनीय'}</span>
          </button>

          <button
            onClick={loadLeaderboard}
            disabled={loading}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="रीफ्रेश करें"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Fairness Filter Toolbar (Active for Student Leaderboard) */}
      {activeTab === 'students' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold">
              <Filter className="w-3.5 h-3.5" />
              <span>निष्पक्ष मानक:</span>
            </div>

            {/* Language */}
            <select
              value={language}
              onChange={(e) => {
                const lang = e.target.value as ExamLanguage;
                setLanguage(lang);
                setLayout(lang === 'Hindi' ? 'Hindi InScript' : 'English QWERTY');
              }}
              className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            >
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="English">English</option>
            </select>

            {/* Layout */}
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value as ExamLayout)}
              className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            >
              <option value="Hindi InScript">Hindi InScript</option>
              <option value="English QWERTY">English QWERTY</option>
            </select>

            {/* Duration */}
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value) as ExamDurationMinutes)}
              className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            >
              <option value="1">1 मिनट टेस्ट</option>
              <option value="2">2 मिनट टेस्ट</option>
              <option value="5">5 मिनट टेस्ट (मानक)</option>
              <option value="10">10 मिनट टेस्ट</option>
              <option value="15">15 मिनट टेस्ट</option>
            </select>

            {/* Metric */}
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as LeaderboardMetric)}
              className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-blue-600 dark:text-blue-400"
            >
              <option value="speed">सर्वोत्तम गति (Net WPM)</option>
              <option value="accuracy">सर्वोत्तम सटीकता (Accuracy %)</option>
              <option value="improved">सर्वाधिक सुधार (Most Improved)</option>
            </select>

            {/* Timeframe */}
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as LeaderboardTimeframe)}
              className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            >
              <option value="all_time">सर्वकालिक (All Time)</option>
              <option value="monthly">मासिक (This Month)</option>
              <option value="weekly">साप्ताहिक (This Week)</option>
            </select>
          </div>
        </div>
      )}

      {/* Rankings List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {activeTab === 'students' ? (
          studentEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-16 text-center">रैंक</th>
                    <th className="py-3 px-4">विद्यार्थी का नाम</th>
                    <th className="py-3 px-4">बैच</th>
                    <th className="py-3 px-4 text-right">शुद्ध गति (Net WPM)</th>
                    <th className="py-3 px-4 text-right">सकल गति (Gross)</th>
                    <th className="py-3 px-4 text-right">सटीकता (Acc %)</th>
                    <th className="py-3 px-4 text-right">तिथि</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {studentEntries.map((entry) => (
                    <tr
                      key={entry.studentId}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        entry.isCurrentUser
                          ? 'bg-blue-50/60 dark:bg-blue-950/20 font-bold border-l-4 border-l-blue-600'
                          : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        {entry.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black">
                            🥇
                          </span>
                        ) : entry.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-black">
                            🥈
                          </span>
                        ) : entry.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-800 font-black">
                            🥉
                          </span>
                        ) : (
                          <span className="font-mono text-slate-500">#{entry.rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 font-devanagari">
                          <span>{entry.studentName}</span>
                          {entry.isCurrentUser && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-blue-600 text-white font-sans">
                              आप
                            </span>
                          )}
                        </div>
                        {entry.rollNo && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Roll: {entry.rollNo}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {entry.batchName || 'सामान्य'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {entry.netWpm} <span className="text-[10px] font-normal text-slate-400">WPM</span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400">
                        {entry.grossWpm} WPM
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                        {entry.accuracy}%
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                        {new Date(entry.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              चयनित परीक्षा मानकों ({language}, {layout}, {durationMinutes} मिनट) के लिए कोई रिकॉर्ड उपलब्ध नहीं है।
            </div>
          )
        ) : (
          /* Batch Leaderboard Table */
          batchEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-16 text-center">रैंक</th>
                    <th className="py-3 px-4">बैच का नाम</th>
                    <th className="py-3 px-4">शिफ्ट</th>
                    <th className="py-3 px-4 text-center">विद्यार्थी संख्या</th>
                    <th className="py-3 px-4 text-right">औसत शुद्ध गति</th>
                    <th className="py-3 px-4 text-right">औसत सटीकता</th>
                    <th className="py-3 px-4 text-right">शीर्ष गति (Peak)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {batchEntries.map((batch) => (
                    <tr key={batch.batchId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 text-center font-bold">
                        #{batch.rank}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {batch.batchName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 capitalize">
                        {batch.shift}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-400">
                        {batch.studentCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {batch.avgNetWpm} WPM
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                        {batch.avgAccuracy}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                        {batch.topWpm} WPM
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              बैच रैंकिंग के लिए पर्याप्त डेटा उपलब्ध नहीं है।
            </div>
          )
        )}
      </div>
    </div>
  );
};
