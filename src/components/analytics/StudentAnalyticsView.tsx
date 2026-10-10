'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Award,
  Zap,
  Target,
  Clock,
  Calendar,
  Filter,
  BarChart2,
  BookOpen,
  FileCheck,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { AnalyticsService } from '@/services/analytics/analyticsService';
import {
  AggregateAnalyticsResult,
  StudentAnalyticsFilter,
  AnalyticsDateRange,
} from '@/types/analytics';
import { ExamLanguage, ExamLayout, ExamDurationMinutes } from '@/types/exam';

export const StudentAnalyticsView: React.FC = () => {
  const { activeProfile } = useProfile();
  const [data, setData] = useState<AggregateAnalyticsResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>('all');
  const [language, setLanguage] = useState<ExamLanguage | 'all'>('all');
  const [layout, setLayout] = useState<ExamLayout | 'all'>('all');
  const [durationMinutes, setDurationMinutes] = useState<ExamDurationMinutes | 'all'>('all');

  const loadAnalytics = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      const filter: StudentAnalyticsFilter = {
        dateRange,
        language: language === 'all' ? undefined : language,
        layout: layout === 'all' ? undefined : layout,
        durationMinutes: durationMinutes === 'all' ? undefined : durationMinutes,
      };
      const result = await AnalyticsService.getStudentAnalytics(activeProfile.id, filter);
      setData(result);
    } catch (err) {
      console.error('Failed to load student analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [activeProfile, dateRange, language, layout, durationMinutes]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (!activeProfile) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>व्यक्तिगत प्रगति एवं विश्लेषण (Performance Analytics)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              छात्र {activeProfile.name} के टंकण इतिहास, गति वृद्धि एवं सटीकता का विस्तृत रिकॉर्ड
            </p>
          </div>
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="self-start md:self-auto px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>अपडेट करें</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold">
            <Filter className="w-3.5 h-3.5" />
            <span>फ़िल्टर:</span>
          </div>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as AnalyticsDateRange)}
            className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">सभी समय (All Time)</option>
            <option value="7days">पिछले 7 दिन (Last 7 Days)</option>
            <option value="30days">पिछले 30 दिन (Last 30 Days)</option>
            <option value="90days">पिछले 90 दिन (Last 90 Days)</option>
          </select>

          {/* Language */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">सभी भाषाएँ (All Languages)</option>
            <option value="Hindi">हिंदी (Hindi)</option>
            <option value="English">English</option>
          </select>

          {/* Layout */}
          <select
            value={layout}
            onChange={(e) => setLayout(e.target.value as any)}
            className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">सभी लेआउट (All Layouts)</option>
            <option value="Hindi InScript">Hindi InScript</option>
            <option value="English QWERTY">English QWERTY</option>
          </select>

          {/* Duration */}
          <select
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value === 'all' ? 'all' : Number(e.target.value) as any)}
            className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">सभी अवधि (All Durations)</option>
            <option value="1">1 मिनट (1 Min)</option>
            <option value="2">2 मिनट (2 Mins)</option>
            <option value="5">5 मिनट (5 Mins)</option>
            <option value="10">10 मिनट (10 Mins)</option>
            <option value="15">15 मिनट (15 Mins)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {data && data.hasData ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Best Net WPM */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                <span>सर्वोत्तम शुद्ध गति</span>
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {data.bestNetWpm} <span className="text-xs font-medium text-slate-400">WPM</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">औसत: {data.averageNetWpm} WPM</div>
            </div>

            {/* Best Gross WPM */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                <span>सर्वोत्तम सकल गति</span>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {data.bestGrossWpm} <span className="text-xs font-medium text-slate-400">WPM</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">औसत: {data.averageGrossWpm} WPM</div>
            </div>

            {/* Best Accuracy */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                <span>सटीकता (Accuracy)</span>
                <Target className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {data.bestAccuracy}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">औसत: {data.averageAccuracy}%</div>
            </div>

            {/* Completed Tests */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                <span>सम्पन्न परीक्षाएं</span>
                <FileCheck className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {data.completedExamsCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">आधिकारिक टेस्ट</div>
            </div>

            {/* Lessons Completed */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                <span>उत्तीर्ण पाठ (LMS)</span>
                <BookOpen className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {data.completedLessonsCount} / 160
              </div>
              <div className="text-[11px] text-slate-500 mt-1">पाठ्यक्रम प्रगति</div>
            </div>

            {/* Practice Time */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                <span>कुल अभ्यास समय</span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {data.totalPracticeMinutes} <span className="text-xs font-medium text-slate-400">मिनट</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {Math.round((data.totalPracticeMinutes / 60) * 10) / 10} घंटे
              </div>
            </div>
          </div>

          {/* Growth Trends & Personal Records */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Trend Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-blue-600" />
                    <span>गति एवं सटीकता का क्रमिक रुझान (Speed Progress Trend)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    प्रत्येक परीक्षा में प्राप्त नेट गति (WPM)
                  </p>
                </div>
                {/* Deltas */}
                <div className="flex items-center gap-3 text-xs font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">साप्ताहिक:</span>
                    <span
                      className={`flex items-center ${
                        data.weeklyWpmChangePct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {data.weeklyWpmChangePct >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {data.weeklyWpmChangePct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart SVG Visualization */}
              {data.trends.length > 0 ? (
                <div className="h-56 w-full pt-4 flex flex-col justify-end">
                  <div className="h-44 flex items-end gap-2 border-b border-l border-slate-200 dark:border-slate-700 px-2 pb-1">
                    {data.trends.slice(-15).map((point, idx) => {
                      const maxVal = Math.max(...data.trends.map((t) => t.netWpm), 50);
                      const heightPct = Math.max(10, Math.round((point.netWpm / maxVal) * 100));

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                          {/* Tooltip */}
                          <div className="absolute -top-12 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-slate-800 text-white text-[10px] rounded-md px-2 py-1 shadow-md z-10 whitespace-nowrap">
                            <div className="font-bold">{point.label}</div>
                            <div>
                              {point.netWpm} WPM • {point.accuracy}% Acc
                            </div>
                            <div className="text-slate-400">{point.date}</div>
                          </div>

                          <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            {point.netWpm}
                          </span>
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full max-w-[28px] rounded-t-sm transition-all ${
                              point.netWpm >= 35
                                ? 'bg-emerald-500 group-hover:bg-emerald-600'
                                : point.netWpm >= 25
                                ? 'bg-blue-500 group-hover:bg-blue-600'
                                : 'bg-slate-400 group-hover:bg-slate-500'
                            }`}
                          />
                          <span className="text-[9px] text-slate-400 truncate max-w-[36px]">
                            {point.date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 px-2">
                    <span>प्रारंभिक परीक्षाएं (Earlier)</span>
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-xs" /> 35+ WPM
                      <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-xs ml-2" /> 25-34 WPM
                    </span>
                    <span>नवीनतम परीक्षाएं (Latest)</span>
                  </div>
                </div>
              ) : (
                <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                  चयनित फ़िल्टर के लिए कोई परीक्षा रुझान उपलब्ध नहीं है।
                </div>
              )}
            </div>

            {/* Personal Records Showcase */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>व्यक्तिगत कीर्तिमान (Personal Records)</span>
              </h3>

              {data.personalRecords.length > 0 ? (
                <div className="space-y-3">
                  {data.personalRecords.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {rec.title}
                        </span>
                        <span className="text-base font-black text-amber-700 dark:text-amber-400">
                          {rec.value} {rec.unit}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex justify-between">
                        <span className="truncate max-w-[140px]">{rec.testTitle}</span>
                        <span>{rec.dateAchieved}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  अभी तक कोई रिकॉर्ड दर्ज नहीं हुआ है।
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
          <BarChart2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            विश्लेषण हेतु पर्याप्त डेटा उपलब्ध नहीं है (No Test History Found)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-5">
            जब छात्र टंकण पाठ या आधिकारिक परीक्षा पूरी करेंगे, तब उनकी वास्तविक गति, सटीकता, और व्यक्तिगत रिकॉर्ड यहाँ स्वतः प्रदर्शित होंगे।
          </p>
        </div>
      )}
    </div>
  );
};
