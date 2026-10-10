'use client';

import React from 'react';
import { History, PlayCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PracticeResult } from '@/types';

interface RecentActivityProps {
  recentResults: PracticeResult[];
  onStartPractice: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  recentResults,
  onStartPractice,
}) => {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Recent Practice Activity
          </h4>
        </div>
        <span className="text-xs text-slate-400">
          {recentResults.length} Record{recentResults.length === 1 ? '' : 's'}
        </span>
      </div>

      {recentResults.length === 0 ? (
        // Explicit Empty State
        <div className="py-8 text-center space-y-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-xs mx-auto">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No Practice Activity Recorded Yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your drill history, WPM speed benchmarks, and accuracy records will appear here after your first test.
            </p>
          </div>
          <button
            onClick={onStartPractice}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 underline underline-offset-4"
          >
            Start with Lesson 1 Now
          </button>
        </div>
      ) : (
        // Results Table
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                <th className="py-2 font-medium">Lesson Drill</th>
                <th className="py-2 font-medium">Speed</th>
                <th className="py-2 font-medium">Accuracy</th>
                <th className="py-2 font-medium">Duration</th>
                <th className="py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentResults.map((result) => {
                const dateStr = new Date(result.completedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                });
                return (
                  <tr key={result.id} className="text-slate-700 dark:text-slate-300">
                    <td className="py-2.5 font-medium">{result.lessonTitle}</td>
                    <td className="py-2.5 font-bold text-blue-600">{result.netWpm} WPM</td>
                    <td className="py-2.5 font-medium">{result.accuracy}%</td>
                    <td className="py-2.5 text-slate-500">{Math.round(result.durationSeconds)}s</td>
                    <td className="py-2.5 text-slate-400">{dateStr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
