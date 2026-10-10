'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Zap,
  Target,
  Clock,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { RecommendationService } from '@/services/analytics/recommendationService';
import { PracticeRecommendation } from '@/types/analytics';

interface SmartRecommendationsViewProps {
  onStartDrill?: (text: string, title: string) => void;
}

export const SmartRecommendationsView: React.FC<SmartRecommendationsViewProps> = ({
  onStartDrill,
}) => {
  const { activeProfile } = useProfile();
  const [recommendations, setRecommendations] = useState<PracticeRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecommendations = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      const data = await RecommendationService.getRecommendations(activeProfile.id);
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleRefresh = async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      const fresh = await RecommendationService.generateRecommendations(
        activeProfile.id,
        activeProfile.preferences.keyboardLayout
      );
      setRecommendations(fresh);
    } catch (err) {
      console.error('Failed to generate fresh recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeProfile) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>स्मार्ट अभ्यास सिफारिशें (Intelligent Practice Recommendations)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            आपकी व्यक्तिगत कमजोर कुंजियों एवं त्रुटि पैटर्न पर आधारित विशेष उपचारात्मक अभ्यास (100% Offline Local Engine)
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>नए अभ्यास तैयार करें</span>
        </button>
      </div>

      {/* Recommendations Cards */}
      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                    {rec.focus === 'weak_keys' ? 'कमजोर कुंजियाँ निवारण' : 'सटीकता एवं लय सुधार'}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {rec.recommendedDurationMinutes} मिनट
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {rec.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                  {rec.description}
                </p>

                {/* Target Characters Badges */}
                {rec.targetChars.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      लक्षित अक्षर (Target Keys):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.targetChars.map((ch, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold font-devanagari"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drill Text Preview */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    अभ्यास गद्यांश पूर्वावलोकन:
                  </span>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 font-devanagari line-clamp-2">
                    {rec.drillText}
                  </p>
                </div>

                {/* Target Goals */}
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-5">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    लक्ष्य: <strong>{rec.targetWpm} WPM</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-blue-500" />
                    सटीकता: <strong>{rec.targetAccuracy}%</strong>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  if (onStartDrill) {
                    onStartDrill(rec.drillText, rec.title);
                  }
                }}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>यह अभ्यास शुरू करें</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
          <Lightbulb className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            आपकी सभी कुंजियों पर प्रदर्शन उत्कृष्ट है!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
            हीटमैप में कोई कमजोर कुंजी नहीं पाई गई। आप परीक्षा मोड में गति बढ़ाने का अभ्यास कर सकते हैं।
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
          >
            सामान्य लय अभ्यास उत्पन्न करें
          </button>
        </div>
      )}
    </div>
  );
};
