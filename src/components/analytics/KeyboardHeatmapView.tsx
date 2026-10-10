'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Keyboard as KeyboardIcon,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  RefreshCw,
  X,
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { HeatmapService } from '@/services/analytics/heatmapService';
import { KeyHeatmapStat } from '@/types/analytics';
import { KeyboardLayout } from '@/types';
import { INSCRIPT_KEYS, InScriptKeyDef } from '@/services/engine/inscriptMapping';

export const KeyboardHeatmapView: React.FC = () => {
  const { activeProfile } = useProfile();
  const [layout, setLayout] = useState<KeyboardLayout>('hindi_inscript');
  const [stats, setStats] = useState<KeyHeatmapStat[]>([]);
  const [selectedKey, setSelectedKey] = useState<{
    def: InScriptKeyDef;
    stat?: KeyHeatmapStat;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHeatmap = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      const data = await HeatmapService.getKeyStats(activeProfile.id, layout);
      setStats(data);
    } catch (err) {
      console.error('Failed to load keyboard heatmap:', err);
    } finally {
      setLoading(false);
    }
  }, [activeProfile, layout]);

  useEffect(() => {
    loadHeatmap();
  }, [loadHeatmap]);

  const statMap = new Map<string, KeyHeatmapStat>();
  stats.forEach((s) => statMap.set(s.code, s));

  // Rows of keyboard
  const numberRow = INSCRIPT_KEYS.filter((k) => k.row === 'number');
  const topRow = INSCRIPT_KEYS.filter((k) => k.row === 'top');
  const homeRow = INSCRIPT_KEYS.filter((k) => k.row === 'home');
  const bottomRow = INSCRIPT_KEYS.filter((k) => k.row === 'bottom');

  return (
    <div className="space-y-6">
      {/* Header and Layout Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <KeyboardIcon className="w-5 h-5 text-emerald-600" />
              <span>कीबोर्ड एक्यूरेसी हीटमैप (Keyboard Heatmap)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              प्रत्येक भौतिक कुंजी की शुद्धता, गति एवं त्रुटि प्रवृत्तियों का विज़ुअल हीटमैप
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLayout('hindi_inscript')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                layout === 'hindi_inscript'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              हिंदी इनस्क्रिप्ट (Hindi InScript)
            </button>
            <button
              onClick={() => setLayout('english_qwerty')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                layout === 'english_qwerty'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              English QWERTY
            </button>
            <button
              onClick={loadHeatmap}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              title="रीफ्रेश करें"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-bold text-slate-400">रंग संकेत:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500" />
            <span className="text-[11px] text-slate-600 dark:text-slate-300">दक्ष (95%+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-400" />
            <span className="text-[11px] text-slate-600 dark:text-slate-300">उत्तम (85-94%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-400" />
            <span className="text-[11px] text-slate-600 dark:text-slate-300">मध्यम (75-84%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-orange-500" />
            <span className="text-[11px] text-slate-600 dark:text-slate-300">कमजोर (60-74%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-600" />
            <span className="text-[11px] text-slate-600 dark:text-slate-300">अति कमजोर (&lt;60%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-slate-200 dark:bg-slate-700" />
            <span className="text-[11px] text-slate-500">अप्रशिक्षित (No Data)</span>
          </div>
        </div>
      </div>

      {/* Interactive Virtual Heatmap Canvas */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs overflow-x-auto">
        <div className="min-w-[800px] flex flex-col gap-2 mx-auto">
          {/* Number Row */}
          <div className="flex gap-1.5 justify-center">
            {numberRow.map((key) => renderHeatKey(key))}
          </div>

          {/* Top Row */}
          <div className="flex gap-1.5 justify-center">
            {topRow.map((key) => renderHeatKey(key))}
          </div>

          {/* Home Row */}
          <div className="flex gap-1.5 justify-center">
            {homeRow.map((key) => renderHeatKey(key))}
          </div>

          {/* Bottom Row */}
          <div className="flex gap-1.5 justify-center">
            {bottomRow.map((key) => renderHeatKey(key))}
          </div>

          {/* Space Bar */}
          <div className="flex justify-center mt-1">
            <button
              onClick={() => {
                const spaceDef = INSCRIPT_KEYS.find((k) => k.code === 'Space');
                if (spaceDef) {
                  setSelectedKey({ def: spaceDef, stat: statMap.get('Space') });
                }
              }}
              className="h-10 w-96 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-blue-500 transition-colors"
            >
              Space Bar {statMap.get('Space') ? `(${statMap.get('Space')?.accuracyPct}%)` : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Key Diagnostic Modal / Drawer */}
      {selectedKey && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-devanagari text-slate-900 dark:text-slate-100">
                    {layout === 'hindi_inscript' ? selectedKey.def.hiNormal : selectedKey.def.enNormal}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    {selectedKey.def.enNormal}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    कुंजी विवरण (Key Diagnostics)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    भौतिक कोड: <span className="font-mono text-blue-600">{selectedKey.def.code}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedKey(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedKey.stat && selectedKey.stat.totalAttempts > 0 ? (
              <div className="space-y-4 pt-4">
                {/* Stats Breakdown Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500">कुल प्रयास (Attempts)</span>
                    <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                      {selectedKey.stat.totalAttempts}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500">सटीकता (Accuracy)</span>
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {selectedKey.stat.accuracyPct}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500">सही प्रयास (Correct)</span>
                    <div className="text-lg font-black text-slate-800 dark:text-slate-200">
                      {selectedKey.stat.correctAttempts}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500">प्रतिक्रिया समय (Latency)</span>
                    <div className="text-lg font-black text-slate-800 dark:text-slate-200">
                      {selectedKey.stat.avgResponseTimeMs} ms
                    </div>
                  </div>
                </div>

                {/* Repeated Mistakes */}
                {selectedKey.stat.repeatedMistakes &&
                Object.keys(selectedKey.stat.repeatedMistakes).length > 0 ? (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      बारंबार होने वाली गलतियाँ (Repeated Confusions):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedKey.stat.repeatedMistakes).map(([char, count], i) => (
                        <div
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-1.5"
                        >
                          <span className="font-bold font-devanagari">&apos;{char}&apos;</span>
                          <span className="text-[10px] text-rose-500">({count} बार)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                इस कुंजी के लिए अभी तक कोई अभ्यास डेटा रिकॉर्ड नहीं हुआ है।
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  function renderHeatKey(keyDef: InScriptKeyDef) {
    const stat = statMap.get(keyDef.code);
    const color = HeatmapService.getHeatmapColorClass(stat);

    return (
      <button
        key={keyDef.code}
        onClick={() => setSelectedKey({ def: keyDef, stat })}
        title={`${keyDef.code}: ${color.label}`}
        className={`h-14 w-14 rounded-lg border flex flex-col items-center justify-between p-1.5 transition-all hover:scale-105 hover:z-10 shadow-2xs ${color.bg} ${color.border}`}
      >
        <div className="w-full flex justify-between text-[10px] opacity-75 font-mono">
          <span>{layout === 'hindi_inscript' ? keyDef.hiShift : keyDef.enShift}</span>
          <span className="text-[9px] uppercase">{keyDef.enNormal}</span>
        </div>
        <div className="text-base font-bold font-devanagari">
          {layout === 'hindi_inscript' ? keyDef.hiNormal : keyDef.enNormal}
        </div>
        <div className="text-[9px] font-black tracking-tight">
          {stat ? `${Math.round(stat.accuracyPct)}%` : '—'}
        </div>
      </button>
    );
  }
};
