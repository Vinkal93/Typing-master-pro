'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Layers,
  GraduationCap,
  Award,
  Zap,
  Target,
  AlertTriangle,
  History,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { InstituteDashboardStats } from '@/types/institute';
import { InstituteService } from '@/services/institute/instituteService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface InstituteDashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export const InstituteDashboardView: React.FC<InstituteDashboardViewProps> = ({
  onNavigateTab,
}) => {
  const [stats, setStats] = useState<InstituteDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await InstituteService.getDashboardStats();
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm">Loading institute analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-sm">
        <div>
          <h2 className="text-lg font-bold">Institute Administration Overview</h2>
          <p className="text-xs text-purple-200 mt-0.5">
            Real-time local statistics computed from active database records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            className="bg-purple-800/60 border-purple-700 text-white hover:bg-purple-700 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Live Data
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Students</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {stats.totalStudents}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{stats.activeStudents} active</p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Batches</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {stats.totalBatches}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{stats.activeBatches} active</p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Teachers</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {stats.totalTeachers}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Faculty staff</p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Lessons Done</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {stats.completedLessons}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">LMS curriculum</p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Tests Taken</span>
            <Award className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {stats.testsConducted}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Examinations</p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Avg Speed</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {stats.averageSpeedWpm}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Net WPM</p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Avg Accuracy</span>
            <Target className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono">
            {stats.averageAccuracy}%
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Overall rate</p>
        </div>
      </div>

      {/* Two Column Section: Students Needing Attention & Recent Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students Needing Attention */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Students Needing Remediation
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('students')}
              className="text-[11px] h-7"
            >
              View All Students
            </Button>
          </div>

          {stats.studentsNeedingAttention.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              🎉 All active students are performing above threshold targets!
            </div>
          ) : (
            <div className="space-y-2">
              {stats.studentsNeedingAttention.map((item) => (
                <div
                  key={item.student.id}
                  className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {item.student.name}
                      </span>
                      <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                        {item.student.rollNo}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                      {item.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {item.currentSpeed} WPM / {item.currentAccuracy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities Audit Log */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-purple-600">
              <History className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Recent Audit Trail Activities
              </h3>
            </div>
            <Badge variant="purple" size="sm">Immutable Local Log</Badge>
          </div>

          {stats.recentActivities.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No administrative activities logged yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {stats.recentActivities.map((act) => (
                <div key={act.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {act.userName}
                      </span>
                      <Badge
                        variant={act.userRole === 'admin' ? 'purple' : 'blue'}
                        size="sm"
                        className="text-[9px] uppercase"
                      >
                        {act.userRole}
                      </Badge>
                      <span className="text-slate-400 font-mono text-[10px]">
                        [{act.action}]
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px]">
                      {act.details}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0 whitespace-nowrap">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
