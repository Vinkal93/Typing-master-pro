'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Check,
  Users,
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, Batch, InstituteStudent, UserRole } from '@/types/institute';
import { AttendanceService } from '@/services/institute/attendanceService';
import { InstituteService } from '@/services/institute/instituteService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface AttendanceRegisterViewProps {
  currentUser: { id: string; name: string; role: UserRole };
  preselectedBatchId?: string;
}

export const AttendanceRegisterView: React.FC<AttendanceRegisterViewProps> = ({
  currentUser,
  preselectedBatchId,
}) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(preselectedBatchId || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [batchStudents, setBatchStudents] = useState<InstituteStudent[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const bList = await InstituteService.getBatches();
      setBatches(bList);
      const activeBatchId = selectedBatchId || (bList.length > 0 ? bList[0].id : '');
      if (!selectedBatchId && activeBatchId) {
        setSelectedBatchId(activeBatchId);
      }

      if (activeBatchId) {
        const sList = await InstituteService.getStudents({ batchId: activeBatchId, status: 'active' });
        setBatchStudents(sList);

        const records = await AttendanceService.getBatchAttendanceForDate(activeBatchId, selectedDate);
        const map: Record<string, AttendanceStatus> = {};
        for (const r of records) {
          map[r.studentId] = r.status;
        }
        setAttendanceMap(map);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBatchId, selectedDate]);

  const handleMarkStatus = async (student: InstituteStudent, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({ ...prev, [student.id]: status }));
    await AttendanceService.markAttendanceRecord(
      {
        date: selectedDate,
        batchId: selectedBatchId,
        studentId: student.id,
        studentName: student.name,
        studentRollNo: student.rollNo,
        status,
        markedByTeacherId: currentUser.id,
      },
      currentUser
    );
  };

  const handleMarkAllPresent = async () => {
    const map: Record<string, AttendanceStatus> = {};
    for (const s of batchStudents) {
      map[s.id] = 'present';
    }
    setAttendanceMap(map);
    await AttendanceService.markAllBatchPresent(selectedBatchId, selectedDate, batchStudents, currentUser);
  };

  const handleExportCsv = () => {
    const records: AttendanceRecord[] = batchStudents.map((s) => ({
      id: `att_${selectedDate}_${s.id}`,
      date: selectedDate,
      batchId: selectedBatchId,
      studentId: s.id,
      studentName: s.name,
      studentRollNo: s.rollNo,
      status: attendanceMap[s.id] || 'absent',
      markedByTeacherId: currentUser.id,
      markedAt: Date.now(),
    }));

    const batch = batches.find((b) => b.id === selectedBatchId) || null;
    const csv = AttendanceService.exportAttendanceToCsv(records, batch, selectedDate);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${selectedDate}_Batch_${batch ? batch.code : 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const presentCount = Object.values(attendanceMap).filter((s) => s === 'present').length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === 'late').length;
  const absentCount = batchStudents.length - presentCount - lateCount;

  return (
    <div className="space-y-4">
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Select Batch:</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.shift})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Session Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1" /> Export Attendance
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleMarkAllPresent}
            disabled={batchStudents.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Mark All Present
          </Button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Total Enrolled</span>
          <p className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">{batchStudents.length}</p>
        </div>
        <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-950 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
          <span className="text-[10px] uppercase text-emerald-600 font-bold">Present</span>
          <p className="text-xl font-bold font-mono text-emerald-600">{presentCount}</p>
        </div>
        <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-950 bg-amber-50/50 dark:bg-amber-950/20 text-center">
          <span className="text-[10px] uppercase text-amber-600 font-bold">Late</span>
          <p className="text-xl font-bold font-mono text-amber-600">{lateCount}</p>
        </div>
        <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-950 bg-rose-50/50 dark:bg-rose-950/20 text-center">
          <span className="text-[10px] uppercase text-rose-600 font-bold">Absent / Unmarked</span>
          <p className="text-xl font-bold font-mono text-rose-600">{absentCount}</p>
        </div>
      </div>

      {/* Attendance Register Roster */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Current Status</th>
                <th className="py-2.5 px-3 text-right">Quick Mark Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {batchStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No active students enrolled in this batch.
                  </td>
                </tr>
              ) : (
                batchStudents.map((s) => {
                  const currentStatus = attendanceMap[s.id] || 'absent';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="py-2.5 px-3 font-mono font-bold text-purple-600">
                        {s.rollNo}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                        {s.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={
                            currentStatus === 'present'
                              ? 'green'
                              : currentStatus === 'late'
                              ? 'amber'
                              : 'red'
                          }
                          size="sm"
                          className="capitalize"
                        >
                          {currentStatus}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
                          <button
                            onClick={() => handleMarkStatus(s, 'present')}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white'
                                : 'text-slate-600 hover:text-emerald-600'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleMarkStatus(s, 'late')}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                              currentStatus === 'late'
                                ? 'bg-amber-600 text-white'
                                : 'text-slate-600 hover:text-amber-600'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => handleMarkStatus(s, 'absent')}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white'
                                : 'text-slate-600 hover:text-rose-600'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
