'use client';

import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Wifi,
  WifiOff,
  Lock,
  Unlock,
  AlertTriangle,
  Play,
  RotateCcw,
  Shield,
  Activity,
  Users,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TerminalNode, TerminalStatus } from '@/types/remington';
import { lanSyncService } from '@/services/network/lanSyncService';

export const LiveTerminalMonitor: React.FC = () => {
  const [terminals, setTerminals] = useState<TerminalNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    // Set this machine's role as Master
    lanSyncService.setRole('master');

    const unsubscribe = lanSyncService.subscribeTerminals((updatedList) => {
      setTerminals(updatedList);
      setLastUpdated(new Date());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRemoteCommand = (terminalId: string, cmd: 'LOCK' | 'UNLOCK' | 'FORCE_SUBMIT') => {
    lanSyncService.sendInstructorCommand(terminalId, cmd);
  };

  const handleEmergencyLockAll = () => {
    terminals.forEach((term) => {
      lanSyncService.sendInstructorCommand(term.id, 'LOCK');
    });
  };

  const handleUnlockAll = () => {
    terminals.forEach((term) => {
      lanSyncService.sendInstructorCommand(term.id, 'UNLOCK');
    });
  };

  const filteredTerminals = terminals.filter((term) => {
    const matchesSearch =
      term.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (term.currentStudentName && term.currentStudentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (term.currentStudentRollNo && term.currentStudentRollNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      term.ipAddress.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && (term.status === 'in_exam' || term.status === 'in_practice')) ||
      (statusFilter === 'locked' && term.status === 'locked') ||
      (statusFilter === 'idle' && term.status === 'idle');

    return matchesSearch && matchesStatus;
  });

  const activeExamsCount = terminals.filter((t) => t.status === 'in_exam').length;
  const lockedCount = terminals.filter((t) => t.status === 'locked').length;
  const onlineCount = terminals.filter((t) => t.status !== 'disconnected').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">सक्रिय टर्मिनल (Online)</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{onlineCount}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
              <Monitor className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">चल रही परीक्षाएं (In Exam)</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{activeExamsCount}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">सुरक्षा लॉक (Locked)</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{lockedCount}</h3>
            </div>
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">LAN सिंक स्थिति</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  मास्टर हब सक्रिय
                </span>
              </div>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
              <Wifi className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            placeholder="टर्मिनल आईडी, छात्र नाम, रोल नंबर या आईपी से खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-sm px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">सभी टर्मिनल</option>
            <option value="active">सक्रिय परीक्षा / अभ्यास</option>
            <option value="locked">सुरक्षा लॉक</option>
            <option value="idle">आइडल (उपलब्ध)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleUnlockAll}
            className="text-xs border-emerald-300 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950"
          >
            <Unlock className="w-3.5 h-3.5 mr-1" />
            सभी अनलॉक करें
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleEmergencyLockAll}
            className="text-xs border-rose-300 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950"
          >
            <Lock className="w-3.5 h-3.5 mr-1" />
            आपातकालीन लॉक (Emergency Lock)
          </Button>
        </div>
      </div>

      {/* Terminals Grid */}
      {filteredTerminals.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 space-y-3">
          <Monitor className="w-12 h-12 mx-auto text-slate-400" />
          <h4 className="font-semibold text-slate-700 dark:text-slate-300">कोई टर्मिनल कनेक्ट नहीं है</h4>
          <p className="text-xs max-w-md mx-auto">
            जब छात्र कंप्यूटर लैब में Typing Master Pro खोलते हैं, तो उनके टर्मिनल स्वचालित रूप से यहाँ रीयल-टाइम दिखाई देंगे।
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTerminals.map((term) => {
            const isOnline = term.status !== 'disconnected';
            const isExam = term.status === 'in_exam';
            const isLocked = term.status === 'locked';

            return (
              <Card
                key={term.id}
                className={`p-4 transition-all border ${
                  isLocked
                    ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20'
                    : isExam
                    ? 'border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{term.id}</h4>
                      <p className="text-[10px] text-slate-500">{term.ipAddress}</p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      isLocked ? 'red' : isExam ? 'green' : isOnline ? 'blue' : 'gray'
                    }
                    size="sm"
                  >
                    {isLocked
                      ? 'सुरक्षा लॉक'
                      : isExam
                      ? 'परीक्षा जारी'
                      : term.status === 'in_practice'
                      ? 'अभ्यास जारी'
                      : isOnline
                      ? 'आइडल'
                      : 'ऑफ़लाइन'}
                  </Badge>
                </div>

                {/* Body: Student & Exam info */}
                <div className="py-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">विद्यार्थी:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {term.currentStudentName || 'लॉगिन नहीं'}
                      {term.currentStudentRollNo ? ` (${term.currentStudentRollNo})` : ''}
                    </span>
                  </div>

                  {term.activeTestTitle && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">परीक्षा शीर्षक:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                        {term.activeTestTitle}
                      </span>
                    </div>
                  )}

                  {/* Real-time typing stats */}
                  {(isExam || term.status === 'in_practice') && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                      <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                        <span className="text-[10px] text-slate-500 block">लाइव गति (Speed)</span>
                        <span className="text-base font-bold text-blue-600">
                          {term.currentWpm || 0} <span className="text-[10px]">WPM</span>
                        </span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                        <span className="text-[10px] text-slate-500 block">सटीकता (Accuracy)</span>
                        <span className="text-base font-bold text-emerald-600">
                          {term.currentAccuracy || 0}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">
                    हार्टबीट: {new Date(term.lastHeartbeat).toLocaleTimeString()}
                  </span>

                  <div className="flex items-center gap-1">
                    {isLocked ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleRemoteCommand(term.id, 'UNLOCK')}
                        className="text-[11px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Unlock className="w-3 h-3 mr-1" />
                        अनलॉक करें
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoteCommand(term.id, 'LOCK')}
                        className="text-[11px] py-1 px-2.5 border-rose-300 text-rose-600 hover:bg-rose-50"
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        लॉक करें
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
