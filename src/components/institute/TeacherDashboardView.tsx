'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  CalendarCheck,
  FileCheck,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Batch, InstituteStudent, InstituteUser, UserRole } from '@/types/institute';
import { InstituteService } from '@/services/institute/instituteService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface TeacherDashboardViewProps {
  currentUser: { id: string; name: string; role: UserRole };
  onNavigateTab: (tab: string, batchId?: string) => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  currentUser,
  onNavigateTab,
}) => {
  const [assignedBatches, setAssignedBatches] = useState<Batch[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<InstituteStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const allBatches = await InstituteService.getBatches();
      // If user is teacher, filter to batches where teacherId === currentUser.id or assigned
      const myBatches = currentUser.role === 'admin'
        ? allBatches
        : allBatches.filter((b) => b.teacherId === currentUser.id);
      setAssignedBatches(myBatches);

      const allStudents = await InstituteService.getStudents({ status: 'active' });
      const myBatchIdSet = new Set(myBatches.map((b) => b.id));
      const myStudents = currentUser.role === 'admin'
        ? allStudents
        : allStudents.filter((s) => myBatchIdSet.has(s.batchId));
      setAssignedStudents(myStudents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Teacher Welcome Header */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-200" />
            <h2 className="text-base font-bold">Faculty Portal — {currentUser.name}</h2>
            <Badge variant="purple" size="sm" className="bg-purple-700 text-purple-100 border-none text-[10px]">
              Assigned Faculty
            </Badge>
          </div>
          <p className="text-xs text-purple-200 mt-0.5">
            You are managing {assignedBatches.length} batch(es) and {assignedStudents.length} enrolled students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab('attendance')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
          >
            <CalendarCheck className="w-3.5 h-3.5 mr-1" /> Mark Attendance
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigateTab('assignments')}
            className="bg-white text-purple-900 hover:bg-purple-50 text-xs font-bold"
          >
            <FileCheck className="w-3.5 h-3.5 mr-1" /> Assign Test
          </Button>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Assigned Batches</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
              {assignedBatches.length}
            </div>
            <p className="text-[10px] text-slate-400">Class schedules</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Enrolled Students</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
              {assignedStudents.length}
            </div>
            <p className="text-[10px] text-slate-400">Under your instruction</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Academic Action</span>
            <div className="text-sm font-bold text-emerald-600 mt-1">
              Active Session
            </div>
            <p className="text-[10px] text-slate-400">All systems normal</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* My Batches List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Your Allocated Batches & Timings
        </h3>

        {assignedBatches.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-400">
            No batches currently assigned to your instructor profile. Contact Institute Admin.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assignedBatches.map((b) => {
              const count = assignedStudents.filter((s) => s.batchId === b.id).length;
              return (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {b.name}
                      </h4>
                      <span className="font-mono text-[11px] text-purple-600 font-semibold">
                        {b.startTime} - {b.endTime}
                      </span>
                    </div>
                    <Badge variant="purple" size="sm" className="capitalize">
                      {b.shift}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-500">
                      <strong>{count}</strong> Active Students
                    </span>
                    <button
                      onClick={() => onNavigateTab('attendance', b.id)}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      Take Attendance <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
