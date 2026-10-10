'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  LayoutDashboard,
  Users,
  Layers,
  GraduationCap,
  FileCheck,
  CalendarCheck,
  BarChart3,
  ShieldCheck,
  Network,
  Lock,
  LogOut,
  ArrowLeft,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { AuthSession } from '@/types/institute';
import { RbacService } from '@/services/security/rbacService';
import { InstituteDashboardView } from './InstituteDashboardView';
import { StudentManagementView } from './StudentManagementView';
import { BatchManagementView } from './BatchManagementView';
import { TeacherDashboardView } from './TeacherDashboardView';
import { TestAssignmentsView } from './TestAssignmentsView';
import { AttendanceRegisterView } from './AttendanceRegisterView';
import { InstituteReportsView } from './InstituteReportsView';
import { BackupRestoreView } from './BackupRestoreView';
import { LanSpecView } from './LanSpecView';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface InstitutePortalProps {
  initialSession: AuthSession;
  onExitToStudentDashboard: () => void;
}

export type InstitutePortalTab =
  | 'dashboard'
  | 'teacher_dashboard'
  | 'students'
  | 'batches'
  | 'assignments'
  | 'attendance'
  | 'reports'
  | 'backup'
  | 'lan_spec';

export const InstitutePortal: React.FC<InstitutePortalProps> = ({
  initialSession,
  onExitToStudentDashboard,
}) => {
  const [session, setSession] = useState<AuthSession>(initialSession);
  const [activeTab, setActiveTab] = useState<InstitutePortalTab>(
    initialSession.user.role === 'teacher' ? 'teacher_dashboard' : 'dashboard'
  );
  const [preselectedBatchId, setPreselectedBatchId] = useState<string | undefined>(undefined);

  // Lock screen PIN
  const [unlockSecret, setUnlockSecret] = useState('');
  const [unlockError, setUnlockError] = useState('');

  const isAdmin = session.user.role === 'admin';

  const handleLock = () => {
    RbacService.lockSession();
    setSession((prev) => ({ ...prev, isLocked: true }));
    setUnlockSecret('');
    setUnlockError('');
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError('');
    const ok = await RbacService.unlockSession(unlockSecret);
    if (ok) {
      setSession((prev) => ({ ...prev, isLocked: false }));
      setUnlockSecret('');
    } else {
      setUnlockError('Invalid password or PIN.');
    }
  };

  const handleLogout = () => {
    RbacService.logout();
    onExitToStudentDashboard();
  };

  const navigateTab = (tab: string, batchId?: string) => {
    setActiveTab(tab as InstitutePortalTab);
    if (batchId) {
      setPreselectedBatchId(batchId);
    }
  };

  // Render Session Lock Screen if locked
  if (session.isLocked) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <div className="w-full max-w-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Session Locked
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Logged in as <strong>{session.user.name}</strong> ({session.user.role})
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-3">
            <div className="relative">
              <input
                type="password"
                value={unlockSecret}
                onChange={(e) => { setUnlockSecret(e.target.value); setUnlockError(''); }}
                placeholder="Enter password or PIN to unlock"
                autoFocus
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-mono tracking-widest text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {unlockError && (
              <p className="text-xs text-red-600 font-medium">{unlockError}</p>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" type="button" onClick={handleLogout} className="flex-1 text-xs">
                Log Out
              </Button>
              <Button variant="primary" size="sm" type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-xs font-semibold">
                Unlock
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Institute Management Console
              </h2>
              <Badge variant={isAdmin ? 'purple' : 'blue'} size="sm" className="capitalize text-[10px]">
                {session.user.role}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              Logged in: <strong>{session.user.name}</strong> ({session.user.username})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLock}
            className="text-xs text-slate-600 hover:text-slate-900"
            title="Lock Session"
          >
            <Lock className="w-3.5 h-3.5 mr-1" /> Lock
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" /> Sign Out
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onExitToStudentDashboard}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-white font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Student Dashboard
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {isAdmin && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-2 font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Admin Overview
          </button>
        )}

        <button
          onClick={() => setActiveTab('teacher_dashboard')}
          className={`px-3 py-2 font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'teacher_dashboard'
              ? 'bg-purple-600 text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Faculty Portal
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-3 py-2 font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'students'
              ? 'bg-purple-600 text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Students & Roster
        </button>

        <button
          onClick={() => setActiveTab('batches')}
          className={`px-3 py-2 font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'batches'
              ? 'bg-purple-600 text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Batches & Shifts
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-3 py-2 font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'assignments'
              ? 'bg-purple-600 text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          Test Assignments
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3 py-2 font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'bg-purple-600 text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          Attendance
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3 py-2 font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'reports'
              ? 'bg-purple-600 text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Reports & Analytics
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-2 font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Backup & Recovery
          </button>
        )}

        <button
          onClick={() => setActiveTab('lan_spec')}
          className={`px-3 py-2 font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'lan_spec'
              ? 'bg-purple-600 text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          Lab LAN Topology
        </button>
      </div>

      {/* Tab Content Rendering */}
      <div>
        {activeTab === 'dashboard' && (
          <InstituteDashboardView onNavigateTab={navigateTab} />
        )}
        {activeTab === 'teacher_dashboard' && (
          <TeacherDashboardView currentUser={session.user} onNavigateTab={navigateTab} />
        )}
        {activeTab === 'students' && (
          <StudentManagementView currentUser={session.user} />
        )}
        {activeTab === 'batches' && (
          <BatchManagementView currentUser={session.user} />
        )}
        {activeTab === 'assignments' && (
          <TestAssignmentsView currentUser={session.user} />
        )}
        {activeTab === 'attendance' && (
          <AttendanceRegisterView currentUser={session.user} preselectedBatchId={preselectedBatchId} />
        )}
        {activeTab === 'reports' && (
          <InstituteReportsView />
        )}
        {activeTab === 'backup' && (
          <BackupRestoreView currentUser={session.user} />
        )}
        {activeTab === 'lan_spec' && (
          <LanSpecView />
        )}
      </div>
    </div>
  );
};
