'use client';

import React from 'react';
import { Gauge, CheckCircle, Clock, Zap, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProfileStatistics } from '@/services/statistics/statisticsService';

interface StatsOverviewProps {
  stats: ProfileStatistics;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Performance Analytics
        </h3>
        {!stats.hasData && (
          <Badge variant="gray" size="sm">
            <AlertCircle className="w-3 h-3 text-slate-400" />
            <span>Awaiting First Completed Test</span>
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Net Speed (WPM) */}
        <Card className="p-4 space-y-2 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Net Speed (WPM)</span>
            <Gauge className="w-4 h-4 text-blue-600" />
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats.hasData ? stats.averageNetWpm : '0'}
              </span>
              <span className="text-xs font-semibold text-slate-400">WPM</span>
            </div>

            {stats.hasData ? (
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                Peak: {stats.peakNetWpm} WPM
              </p>
            ) : (
              <div className="mt-1.5 p-1.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                No tests completed yet. Complete your first practice test to calculate your speed.
              </div>
            )}
          </div>
        </Card>

        {/* Card 2: Typing Accuracy */}
        <Card className="p-4 space-y-2 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Accuracy Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats.hasData ? `${stats.averageAccuracy}%` : '0%'}
              </span>
            </div>

            {stats.hasData ? (
              <p className="text-[11px] text-slate-500 mt-1">
                Across {stats.totalTests} practice session{stats.totalTests === 1 ? '' : 's'}
              </p>
            ) : (
              <div className="mt-1.5 p-1.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                No accuracy benchmark yet. Institute minimum is 85% accuracy.
              </div>
            )}
          </div>
        </Card>

        {/* Card 3: Total Practice Time */}
        <Card className="p-4 space-y-2 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Practice Time</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats.totalPracticeMinutes}
              </span>
              <span className="text-xs font-semibold text-slate-400">mins</span>
            </div>

            <p className="text-[11px] text-slate-500 mt-1">
              {stats.todayMinutes > 0
                ? `${stats.todayMinutes} mins practiced today`
                : 'Session logged offline'}
            </p>
          </div>
        </Card>

        {/* Card 4: Tests Completed */}
        <Card className="p-4 space-y-2 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Tests Completed</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats.totalTests}
              </span>
              <span className="text-xs font-semibold text-slate-400">tests</span>
            </div>

            <p className="text-[11px] text-slate-500 mt-1">
              {stats.currentStreakDays > 0
                ? `${stats.currentStreakDays}-day active streak`
                : 'Complete test to start streak'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
