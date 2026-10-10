'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Plus,
  Calendar,
  Clock,
  Layers,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
} from 'lucide-react';
import { TestAssignment, Batch, UserRole } from '@/types/institute';
import { AssignmentService } from '@/services/institute/assignmentService';
import { InstituteService } from '@/services/institute/instituteService';
import { PassageLibraryService } from '@/services/exam/passageLibrary';
import { ExamAttemptRecord, ExamLanguage, ExamLayout } from '@/types/exam';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface TestAssignmentsViewProps {
  currentUser: { id: string; name: string; role: UserRole };
}

export const TestAssignmentsView: React.FC<TestAssignmentsViewProps> = ({
  currentUser,
}) => {
  const [assignments, setAssignments] = useState<TestAssignment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSubmissionsAssignment, setSelectedSubmissionsAssignment] = useState<TestAssignment | null>(null);
  const [submissions, setSubmissions] = useState<ExamAttemptRecord[]>([]);

  // Form
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<ExamLanguage>('Hindi');
  const [layout, setLayout] = useState<ExamLayout>('Hindi InScript');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [selectedPassageId, setSelectedPassageId] = useState('');
  const [scoringPolicy, setScoringPolicy] = useState<any>('cpct_hindi');
  const [backspacePolicy, setBackspacePolicy] = useState<any>('allowed');
  const [targetBatchId, setTargetBatchId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [minAccuracy, setMinAccuracy] = useState(85);
  const [minNetWpm, setMinNetWpm] = useState(25);
  const [formError, setFormError] = useState('');

  const builtInPassages = PassageLibraryService.getAllPassages();

  const loadData = async () => {
    setLoading(true);
    try {
      const aList = await AssignmentService.getAssignments();
      setAssignments(aList);
      const bList = await InstituteService.getBatches();
      setBatches(bList);
      if (bList.length > 0 && !targetBatchId) {
        setTargetBatchId(bList[0].id);
      }
      if (builtInPassages.length > 0 && !selectedPassageId) {
        setSelectedPassageId(builtInPassages[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDate(d.toISOString().split('T')[0]);
  }, []);

  const handleLanguageChange = (lang: ExamLanguage) => {
    setLanguage(lang);
    if (lang === 'Hindi') {
      setLayout('Hindi InScript');
      setScoringPolicy('cpct_hindi');
    } else {
      setLayout('English QWERTY');
      setScoringPolicy('ssc_cgl');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !selectedPassageId) {
      setFormError('Title and Target Passage are required.');
      return;
    }

    const passage = builtInPassages.find((p) => p.id === selectedPassageId);
    if (!passage) {
      setFormError('Selected passage not found.');
      return;
    }

    await AssignmentService.createAssignment(
      {
        title: title.trim(),
        passageId: passage.id,
        passageTitle: passage.title,
        passageContent: passage.text,
        language,
        layout,
        durationMinutes: Number(durationMinutes),
        scoringPolicy,
        backspacePolicy,
        assignedByTeacherId: currentUser.id,
        assignedByTeacherName: currentUser.name,
        targetType: 'batch',
        targetBatchId,
        dueDate,
        minAccuracy: Number(minAccuracy),
        minNetWpm: Number(minNetWpm),
      },
      currentUser
    );

    setIsCreateOpen(false);
    loadData();
  };

  const handleViewSubmissions = async (a: TestAssignment) => {
    setSelectedSubmissionsAssignment(a);
    const results = await AssignmentService.getSubmissionsForAssignment(a);
    setSubmissions(results);
  };

  const handleCloseAssignment = async (id: string) => {
    await AssignmentService.closeAssignment(id, currentUser);
    loadData();
  };

  const handleDeleteAssignment = async (id: string) => {
    if (window.confirm('Delete this test assignment?')) {
      await AssignmentService.deleteAssignment(id, currentUser);
      loadData();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Assigned Typing Examinations & Tasks
          </h3>
          <p className="text-xs text-slate-500">
            Publish official typing tests to batches and monitor student submissions.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => { setTitle(''); setFormError(''); setIsCreateOpen(true); }}
          className="bg-purple-600 hover:bg-purple-700 text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> New Test Assignment
        </Button>
      </div>

      {/* Assignment List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.length === 0 ? (
          <div className="col-span-2 p-8 text-center border border-dashed rounded-xl border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
            No active test assignments created yet. Click &quot;New Test Assignment&quot; to publish one.
          </div>
        ) : (
          assignments.map((a) => {
            const batch = batches.find((b) => b.id === a.targetBatchId);
            return (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {a.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Passage: <strong>{a.passageTitle}</strong>
                      </p>
                    </div>
                    <Badge variant={a.status === 'active' ? 'green' : 'gray'} size="sm">
                      {a.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{a.durationMinutes} Minutes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Batch: <strong>{batch ? batch.name : 'All'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: {a.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>Pass: {a.minNetWpm} WPM / {a.minAccuracy}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400">
                    Assigned by {a.assignedByTeacherName}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewSubmissions(a)}
                      className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> Submissions
                    </button>
                    {a.status === 'active' && (
                      <button
                        onClick={() => handleCloseAssignment(a.id)}
                        className="text-[11px] text-slate-400 hover:text-amber-600"
                        title="Close Assignment"
                      >
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAssignment(a.id)}
                      className="text-[11px] text-slate-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Typing Examination Assignment"
        subtitle="Configure passage, timer, scoring rules, and target batch"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Examination Assignment Title:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly InScript Speed Assessment 03"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Language:
              </label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Keyboard Layout:
              </label>
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {language === 'Hindi' ? (
                  <option value="Hindi InScript">Hindi Unicode InScript</option>
                ) : (
                  <option value="English QWERTY">English QWERTY</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Select Official Test Passage:
            </label>
            <select
              value={selectedPassageId}
              onChange={(e) => setSelectedPassageId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
            >
              {builtInPassages
                .filter((p) => p.language === language)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.wordCount} words • {p.difficulty})
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Duration (Min):
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value={1}>1 Minute (Sprint)</option>
                <option value={2}>2 Minutes</option>
                <option value={5}>5 Minutes (Institute)</option>
                <option value={10}>10 Minutes (High Court)</option>
                <option value={15}>15 Minutes (CPCT/SSC)</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Scoring Policy:
              </label>
              <select
                value={scoringPolicy}
                onChange={(e) => setScoringPolicy(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="cpct_hindi">MP CPCT Official Formula</option>
                <option value="ssc_cgl">SSC CGL Error Penalty</option>
                <option value="court_exam">High Court 1.5x Penalty</option>
                <option value="standard">Standard Typing Tutor</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Backspace Policy:
              </label>
              <select
                value={backspacePolicy}
                onChange={(e) => setBackspacePolicy(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="allowed">Allowed (Full Editing)</option>
                <option value="restricted_word">Restricted to Current Word</option>
                <option value="disabled">Disabled (Strict Exam)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Assign to Batch:
              </label>
              <select
                value={targetBatchId}
                onChange={(e) => setTargetBatchId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.shift})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Due Date:
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Pass Thresholds:
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minNetWpm}
                  onChange={(e) => setMinNetWpm(Number(e.target.value))}
                  placeholder="WPM"
                  title="Min Net WPM"
                  className="w-1/2 px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center"
                />
                <input
                  type="number"
                  value={minAccuracy}
                  onChange={(e) => setMinAccuracy(Number(e.target.value))}
                  placeholder="Acc %"
                  title="Min Accuracy %"
                  className="w-1/2 px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center"
                />
              </div>
            </div>
          </div>

          {formError && (
            <div className="p-2 rounded bg-red-50 text-red-600 text-xs">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-purple-600 hover:bg-purple-700">
              Publish Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submissions Modal */}
      {selectedSubmissionsAssignment && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSubmissionsAssignment(null)}
          title={`Submissions: ${selectedSubmissionsAssignment.title}`}
          subtitle={`Passage: ${selectedSubmissionsAssignment.passageTitle} • Due: ${selectedSubmissionsAssignment.dueDate}`}
          maxWidth="lg"
        >
          <div className="space-y-3 text-xs">
            <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="p-2.5">Candidate Name</th>
                    <th className="p-2.5">Net Speed</th>
                    <th className="p-2.5">Accuracy</th>
                    <th className="p-2.5">Mistakes</th>
                    <th className="p-2.5">Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        No submissions logged yet for this assignment.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((s) => (
                      <tr key={s.id}>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-100">
                          {s.studentName}
                        </td>
                        <td className="p-2.5 font-bold font-mono text-purple-600">
                          {s.scoring.netWpm} WPM
                        </td>
                        <td className="p-2.5">{s.scoring.accuracy}%</td>
                        <td className="p-2.5 text-slate-500">
                          {s.scoring.substitutions + s.scoring.omissions + s.scoring.insertions} errors
                        </td>
                        <td className="p-2.5">
                          <Badge variant={s.passed ? 'green' : 'red'} size="sm">
                            {s.passed ? 'Qualified' : 'Disqualified'}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedSubmissionsAssignment(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
