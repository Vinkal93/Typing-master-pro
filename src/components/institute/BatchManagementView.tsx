'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Clock,
  Users,
  GraduationCap,
  Edit,
  Trash2,
  Calendar,
} from 'lucide-react';
import { Batch, InstituteStudent, InstituteUser, ShiftType, UserRole } from '@/types/institute';
import { InstituteService } from '@/services/institute/instituteService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface BatchManagementViewProps {
  currentUser: { id: string; name: string; role: UserRole };
}

export const BatchManagementView: React.FC<BatchManagementViewProps> = ({
  currentUser,
}) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<InstituteStudent[]>([]);
  const [teachers, setTeachers] = useState<InstituteUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  // Form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [shift, setShift] = useState<ShiftType>('morning');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:30 AM');
  const [teacherId, setTeacherId] = useState('');
  const [assignedCourse, setAssignedCourse] = useState('Level 1-6 Master Course');
  const [maxCapacity, setMaxCapacity] = useState(30);
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const bList = await InstituteService.getBatches();
      setBatches(bList);
      const sList = await InstituteService.getStudents({ status: 'active' });
      setStudents(sList);
      const tList = await InstituteService.getTeachers();
      setTeachers(tList);
      if (tList.length > 0 && !teacherId) {
        setTeacherId(tList[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingBatch(null);
    setName('');
    setCode(`B-${Math.floor(10 + Math.random() * 90)}`);
    setShift('morning');
    setStartTime('09:00 AM');
    setEndTime('10:30 AM');
    setTeacherId(teachers.length > 0 ? teachers[0].id : '');
    setAssignedCourse('Level 1-6 Master Course');
    setMaxCapacity(30);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Batch) => {
    setEditingBatch(b);
    setName(b.name);
    setCode(b.code);
    setShift(b.shift);
    setStartTime(b.startTime);
    setEndTime(b.endTime);
    setTeacherId(b.teacherId);
    setAssignedCourse(b.assignedCourse);
    setMaxCapacity(b.maxCapacity);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !code.trim()) {
      setFormError('Batch Name and Code are required.');
      return;
    }

    if (editingBatch) {
      const res = await InstituteService.updateBatch(
        editingBatch.id,
        {
          name: name.trim(),
          code: code.trim(),
          shift,
          startTime,
          endTime,
          teacherId,
          assignedCourse,
          maxCapacity: Number(maxCapacity),
        },
        currentUser
      );
      if (res.success) {
        setIsModalOpen(false);
        loadData();
      } else {
        setFormError(res.message || 'Error updating batch.');
      }
    } else {
      const res = await InstituteService.addBatch(
        {
          name: name.trim(),
          code: code.trim(),
          shift,
          startTime,
          endTime,
          teacherId,
          assignedCourse,
          maxCapacity: Number(maxCapacity),
        },
        currentUser
      );
      if (res.success) {
        setIsModalOpen(false);
        loadData();
      } else {
        setFormError(res.message || 'Error adding batch.');
      }
    }
  };

  const handleDelete = async (id: string, batchName: string) => {
    if (window.confirm(`Are you sure you want to delete batch '${batchName}'?`)) {
      await InstituteService.deleteBatch(id, currentUser);
      loadData();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Active Batch Schedules & Roster
          </h3>
          <p className="text-xs text-slate-500">
            Organize lab shifts, instructor assignments, and student seat capacity.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenAdd} className="bg-purple-600 hover:bg-purple-700 text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Create Batch
        </Button>
      </div>

      {/* Batch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map((b) => {
          const batchStudents = students.filter((s) => s.batchId === b.id);
          const teacher = teachers.find((t) => t.id === b.teacherId);
          const isFull = batchStudents.length >= b.maxCapacity;

          return (
            <div
              key={b.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {b.name}
                    </h4>
                    <span className="font-mono text-[11px] text-purple-600 font-semibold">
                      [{b.code}]
                    </span>
                  </div>
                  <Badge
                    variant={
                      b.shift === 'morning'
                        ? 'amber'
                        : b.shift === 'afternoon'
                        ? 'blue'
                        : 'purple'
                    }
                    size="sm"
                    className="capitalize"
                  >
                    {b.shift} Shift
                  </Badge>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.startTime} – {b.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>Instructor: <strong>{teacher ? teacher.name : 'Unassigned'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Enrolled: <strong>{batchStudents.length} / {b.maxCapacity} Seats</strong>
                    </span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${isFull ? 'bg-red-500' : 'bg-purple-600'}`}
                    style={{ width: `${Math.min(100, (batchStudents.length / b.maxCapacity) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[11px] text-slate-400 font-mono">
                  {b.assignedCourse}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit Batch"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(b.id, b.name)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete Batch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Batch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBatch ? `Edit Batch: ${editingBatch.name}` : 'Create New Batch'}
        subtitle="Configure schedule shifts, capacity, and teacher"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Batch Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Morning CPCT Hindi"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Batch Code:
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. M-CPCT-01"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Shift:
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Start Time:
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                End Time:
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="10:30 AM"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Assign Instructor:
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.username})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Seat Capacity:
              </label>
              <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                min={1}
                max={200}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Assigned Course Track:
            </label>
            <input
              type="text"
              value={assignedCourse}
              onChange={(e) => setAssignedCourse(e.target.value)}
              placeholder="e.g. Level 1-6 Master Course"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          {formError && (
            <div className="p-2 rounded bg-red-50 text-red-600 text-xs">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-purple-600 hover:bg-purple-700">
              {editingBatch ? 'Save Changes' : 'Create Batch'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
