'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  Archive,
  RefreshCcw,
  Trash2,
  Edit,
  Eye,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { InstituteStudent, Batch, UserRole } from '@/types/institute';
import { InstituteService } from '@/services/institute/instituteService';
import { AttendanceService } from '@/services/institute/attendanceService';
import { InstituteReportService } from '@/services/institute/instituteReportService';
import { storageService } from '@/services/storage/storageService';
import { ExamAttemptRecord } from '@/types/exam';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface StudentManagementViewProps {
  currentUser: { id: string; name: string; role: UserRole };
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  currentUser,
}) => {
  const [students, setStudents] = useState<InstituteStudent[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<InstituteStudent | null>(null);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importBatchId, setImportBatchId] = useState('');
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  // Student Details / Dossier Modal
  const [selectedStudentForView, setSelectedStudentForView] = useState<InstituteStudent | null>(null);
  const [studentExams, setStudentExams] = useState<ExamAttemptRecord[]>([]);

  // Form fields
  const [formRollNo, setFormRollNo] = useState('');
  const [formName, setFormName] = useState('');
  const [formBatchId, setFormBatchId] = useState('');
  const [formCourseId, setFormCourseId] = useState('course_level_1');
  const [formPhone, setFormPhone] = useState('');
  const [formGuardian, setFormGuardian] = useState('');
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const bList = await InstituteService.getBatches();
      setBatches(bList);
      if (bList.length > 0 && !importBatchId) {
        setImportBatchId(bList[0].id);
      }
      const sList = await InstituteService.getStudents({
        batchId: selectedBatch,
        status: selectedStatus,
        searchQuery,
      });
      setStudents(sList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBatch, selectedStatus, searchQuery]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormRollNo(`TMP-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormName('');
    setFormBatchId(batches.length > 0 ? batches[0].id : '');
    setFormCourseId('course_level_1');
    setFormPhone('');
    setFormGuardian('');
    setFormError('');
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (s: InstituteStudent) => {
    setEditingStudent(s);
    setFormRollNo(s.rollNo);
    setFormName(s.name);
    setFormBatchId(s.batchId);
    setFormCourseId(s.courseId);
    setFormPhone(s.phone || '');
    setFormGuardian(s.guardian || '');
    setFormError('');
    setIsAddEditOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formRollNo.trim() || !formName.trim()) {
      setFormError('Roll Number and Student Name are required.');
      return;
    }

    if (editingStudent) {
      const res = await InstituteService.updateStudent(
        editingStudent.id,
        {
          rollNo: formRollNo.trim(),
          name: formName.trim(),
          batchId: formBatchId,
          courseId: formCourseId,
          phone: formPhone.trim(),
          guardian: formGuardian.trim(),
        },
        currentUser
      );
      if (res.success) {
        setIsAddEditOpen(false);
        loadData();
      } else {
        setFormError(res.message || 'Error updating student.');
      }
    } else {
      const res = await InstituteService.addStudent(
        {
          rollNo: formRollNo.trim(),
          name: formName.trim(),
          batchId: formBatchId,
          courseId: formCourseId,
          phone: formPhone.trim(),
          guardian: formGuardian.trim(),
        },
        currentUser
      );
      if (res.success) {
        setIsAddEditOpen(false);
        loadData();
      } else {
        setFormError(res.message || 'Error creating student.');
      }
    }
  };

  const handleArchive = async (id: string) => {
    await InstituteService.archiveStudent(id, currentUser);
    loadData();
  };

  const handleRestore = async (id: string) => {
    await InstituteService.restoreStudent(id, currentUser);
    loadData();
  };

  const handleDeletePermanent = async (id: string, name: string) => {
    if (window.confirm(`Are you completely sure you want to permanently delete '${name}'? This cannot be undone.`)) {
      await InstituteService.deleteStudentPermanently(id, currentUser);
      loadData();
    }
  };

  const handleExportCsv = () => {
    const csv = InstituteService.exportStudentsToCsv(students, batches);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Students_Roster_${selectedStatus}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = async () => {
    if (!csvText.trim()) return;
    const res = await InstituteService.importStudentsFromCsv(csvText, importBatchId, currentUser);
    setImportResult({ imported: res.importedCount, skipped: res.skippedCount, errors: res.errors });
    loadData();
  };

  const handleViewDossier = async (s: InstituteStudent) => {
    setSelectedStudentForView(s);
    const adapter = await storageService.getAdapter();
    const results = await adapter.getExamResults(s.id);
    setStudentExams(results);
  };

  const handlePrintDossier = async () => {
    if (!selectedStudentForView) return;
    const batch = batches.find((b) => b.id === selectedStudentForView.batchId);
    const attStats = await AttendanceService.getStudentMonthlyAttendanceSummary(
      selectedStudentForView.id,
      new Date().toISOString().slice(0, 7)
    );
    const html = InstituteReportService.generateStudentDossierHtml(
      selectedStudentForView,
      batch ? batch.name : 'General Batch',
      studentExams,
      { present: attStats.present, total: attStats.total, percentage: attStats.percentage }
    );
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(html);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => printWin.print(), 300);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, roll no, or phone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            <option value="all">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            <option value="active">Active Students</option>
            <option value="archived">Archived Students</option>
          </select>

          <Button variant="outline" size="sm" onClick={handleExportCsv} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => { setIsCsvImportOpen(true); setImportResult(null); setCsvText(''); }}
            className="text-xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1" /> Import CSV
          </Button>

          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="text-xs bg-purple-600 hover:bg-purple-700">
            <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Student
          </Button>
        </div>
      </div>

      {/* Student Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Batch</th>
                <th className="py-2.5 px-3">Course</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const batch = batches.find((b) => b.id === s.batchId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono font-bold text-purple-600">
                        {s.rollNo}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                        {s.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {batch ? batch.name : 'Unassigned'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {s.courseId}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {s.phone || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={s.status === 'active' ? 'green' : 'gray'} size="sm">
                          {s.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewDossier(s)}
                            title="View Dossier & Performance"
                            className="p-1 rounded text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            title="Edit Student"
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {s.status === 'active' ? (
                            <button
                              onClick={() => handleArchive(s.id)}
                              title="Archive Student"
                              className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestore(s.id)}
                              title="Restore Student"
                              className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <RefreshCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => handleDeletePermanent(s.id, s.name)}
                              title="Delete Permanently"
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingStudent ? `Edit Student: ${editingStudent.name}` : 'Register New Student'}
        subtitle="Manage student enrollment and batch allocation"
        maxWidth="md"
      >
        <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Institute Roll Number / Student ID:
            </label>
            <input
              type="text"
              value={formRollNo}
              onChange={(e) => setFormRollNo(e.target.value)}
              placeholder="e.g. TMP-101"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Full Student Name:
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Assigned Batch:
              </label>
              <select
                value={formBatchId}
                onChange={(e) => setFormBatchId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-600"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.shift})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Course Track:
              </label>
              <select
                value={formCourseId}
                onChange={(e) => setFormCourseId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-600"
              >
                <option value="course_level_1">Level 1-6 Master Course</option>
                <option value="course_cpct_special">CPCT Hindi InScript Fast Track</option>
                <option value="course_court_dictation">High Court Steno & Judgment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Phone Number (Optional):
              </label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+91..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Guardian / Father Name:
              </label>
              <input
                type="text"
                value={formGuardian}
                onChange={(e) => setFormGuardian(e.target.value)}
                placeholder="Guardian name"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          {formError && (
            <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddEditOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-purple-600 hover:bg-purple-700">
              {editingStudent ? 'Save Changes' : 'Register Student'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk CSV Import Modal */}
      <Modal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        title="Bulk Student CSV Import"
        subtitle="Import multiple students into an assigned batch"
        maxWidth="lg"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Select Batch for Imported Students:
            </label>
            <select
              value={importBatchId}
              onChange={(e) => setImportBatchId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.shift})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Paste CSV Data (Columns: RollNo, Name, Phone, Guardian):
            </label>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`RollNo,Name,Phone,Guardian\nTMP-201,Aman Verma,9876543210,Ramesh Verma\nTMP-202,Pooja Patel,9876543211,Suresh Patel`}
              className="w-full p-2.5 font-mono text-[11px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {importResult && (
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <p className="font-bold text-slate-900 dark:text-slate-100">
                Import Complete: {importResult.imported} added, {importResult.skipped} skipped.
              </p>
              {importResult.errors.length > 0 && (
                <ul className="text-[11px] text-amber-600 list-disc list-inside">
                  {importResult.errors.slice(0, 3).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsCsvImportOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={handleImportCsv} className="bg-purple-600 hover:bg-purple-700">
              Process & Import CSV
            </Button>
          </div>
        </div>
      </Modal>

      {/* Student Dossier Modal */}
      {selectedStudentForView && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedStudentForView(null)}
          title={`Student Performance Dossier: ${selectedStudentForView.name}`}
          subtitle={`Roll No: ${selectedStudentForView.rollNo} • Enrolled: ${selectedStudentForView.joinDate}`}
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Tests Taken</span>
                <p className="text-xl font-bold font-mono text-purple-600 mt-0.5">{studentExams.length}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Peak Speed</span>
                <p className="text-xl font-bold font-mono text-blue-600 mt-0.5">
                  {studentExams.length > 0 ? Math.max(...studentExams.map((e) => e.scoring.netWpm)) : 0} WPM
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Pass Rate</span>
                <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
                  {studentExams.length > 0
                    ? Math.round((studentExams.filter((e) => e.passed).length / studentExams.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Examination Attempts:</h4>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Title</th>
                      <th className="p-2">Net WPM</th>
                      <th className="p-2">Accuracy</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentExams.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">
                          No typing examinations completed yet.
                        </td>
                      </tr>
                    ) : (
                      studentExams.map((e) => (
                        <tr key={e.id}>
                          <td className="p-2">{new Date(e.completedAt).toLocaleDateString()}</td>
                          <td className="p-2 font-medium">{e.presetTitle || e.passageTitle}</td>
                          <td className="p-2 font-bold font-mono">{e.scoring.netWpm}</td>
                          <td className="p-2">{e.scoring.accuracy}%</td>
                          <td className="p-2 font-bold" style={{ color: e.passed ? '#059669' : '#dc2626' }}>
                            {e.passed ? 'PASSED' : 'FAILED'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={handlePrintDossier}>
                🖨️ Print Full Official Report Card
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedStudentForView(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
