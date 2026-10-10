'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  AlertTriangle,
  Users,
  Target,
  Zap,
  Flame,
  Award,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';
import { AuthSession } from '@/types/institute';
import { TeacherAnalyticsService } from '@/services/institute/teacherAnalyticsService';
import { TeacherAnalyticsSummary } from '@/types/analytics';

interface TeacherAnalyticsViewProps {
  authSession: AuthSession;
}

export const TeacherAnalyticsView: React.FC<TeacherAnalyticsViewProps> = ({ authSession }) => {
  const [data, setData] = useState<TeacherAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const summary = await TeacherAnalyticsService.getTeacherAnalytics(authSession.user);
      setData(summary);
    } catch (err) {
      console.error('Failed to load teacher analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [authSession.user]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span>शिक्षक विश्लेषिकी एवं बैच निगरानी (Faculty Analytics)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            शिक्षक {authSession.user.name} के अधिकार क्षेत्र के बैचों की प्रगति, कमजोर कुंजियों एवं सुधार योग्य छात्रों की सूची
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>अपडेट करें</span>
        </button>
      </div>

      {data ? (
        <>
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500">अधीनस्थ बैच</span>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {data.totalBatches}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500">कुल नामांकित छात्र</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {data.totalStudents}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500">सुधार योग्य छात्र (At-Risk)</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {data.atRiskStudents.length}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500">सामूहिक कमजोर कुंजियाँ</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {data.weakKeysAcrossBatches.length}
              </div>
            </div>
          </div>

          {/* At-Risk Students Alerts Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                विशेष ध्यान योग्य विद्यार्थी (Students Needing Remediation)
              </h3>
            </div>

            {data.atRiskStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-rose-50/60 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">विद्यार्थी</th>
                      <th className="py-2.5 px-3">अनुक्रमांक</th>
                      <th className="py-2.5 px-3">बैच</th>
                      <th className="py-2.5 px-3">औसत गति</th>
                      <th className="py-2.5 px-3">औसत सटीकता</th>
                      <th className="py-2.5 px-3">जोखिम कारक</th>
                      <th className="py-2.5 px-3">गंभीरता</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.atRiskStudents.map((st) => (
                      <tr key={st.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 font-devanagari">
                          {st.studentName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {st.rollNo || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {st.batchName}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold">
                          {st.avgNetWpm} WPM
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold">
                          {st.avgAccuracy}%
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                            {st.primaryRiskFactor === 'low_accuracy'
                              ? 'कम सटीकता (<85%)'
                              : st.primaryRiskFactor === 'low_speed'
                              ? 'धीमी गति (<20 WPM)'
                              : 'अनियमित अभ्यास'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              st.riskSeverity === 'high'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300'
                            }`}
                          >
                            {st.riskSeverity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                वर्तमान में कोई भी छात्र जोखिम श्रेणी में नहीं है। सभी की प्रगति संतोषजनक है!
              </div>
            )}
          </div>

          {/* Batch Aggregates & Collective Weak Keys */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Batch Aggregates */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>बैचवार प्रदर्शन अवलोकन (Batch Performance Breakdown)</span>
              </h3>
              <div className="space-y-3">
                {data.batchAggregates.map((b) => (
                  <div
                    key={b.batchId}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {b.batchName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        छात्र: {b.studentCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs mt-2 text-slate-600 dark:text-slate-300 font-mono">
                      <span>औसत गति: <strong>{b.avgNetWpm} WPM</strong></span>
                      <span>सटीकता: <strong>{b.avgAccuracy}%</strong></span>
                      <span>टेस्ट पूर्ण: <strong>{b.totalTestsCompleted}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collective Weak Keys Radar */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>बैच सामूहिक कमजोर कुंजियाँ (Collective Weak-Key Radar)</span>
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                छात्रों द्वारा सबसे अधिक गलत दबाई गई कुंजियाँ — इन पर कक्षा में विशेष व्याख्यान एवं अभ्यास कराएं:
              </p>

              {data.weakKeysAcrossBatches.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {data.weakKeysAcrossBatches.map((item, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-md bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 flex items-center justify-center font-black font-devanagari text-base text-amber-800 dark:text-amber-300">
                          {item.char}
                        </span>
                        <span className="font-mono text-slate-500 text-[11px]">{item.code}</span>
                      </div>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {item.failCount} छात्रों में त्रुटि
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  पर्याप्त हीटमैप त्रुटि डेटा अभी उपलब्ध नहीं है।
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-xs text-slate-400">
          विश्लेषिकी लोड हो रही है...
        </div>
      )}
    </div>
  );
};
