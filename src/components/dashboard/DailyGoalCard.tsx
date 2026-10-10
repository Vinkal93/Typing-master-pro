'use client';

import React from 'react';
import { Target, Flame, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface DailyGoalCardProps {
  todayMinutes: number;
  goalMinutes: number;
  streakDays: number;
}

export const DailyGoalCard: React.FC<DailyGoalCardProps> = ({
  todayMinutes,
  goalMinutes,
  streakDays,
}) => {
  const percentage = Math.min(100, Math.round((todayMinutes / (goalMinutes || 15)) * 100));
  const isCompleted = todayMinutes >= goalMinutes;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Daily Practice Goal
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Target: {goalMinutes} mins / day
            </p>
          </div>
        </div>

        {/* Streak Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs font-bold">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>{streakDays} Day Streak</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-700 dark:text-slate-300">
            {todayMinutes} of {goalMinutes} mins completed
          </span>
          <span className="text-blue-600 dark:text-blue-400">{percentage}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Motivation Note */}
      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        {isCompleted ? (
          <span className="text-emerald-600 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fantastic work! Today&apos;s institute target achieved.
          </span>
        ) : (
          <span>
            Complete today&apos;s drill to build your muscle memory and maintain your streak.
          </span>
        )}
      </div>
    </Card>
  );
};
