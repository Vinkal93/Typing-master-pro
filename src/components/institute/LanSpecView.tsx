'use client';

import React from 'react';
import {
  Network,
  Server,
  Monitor,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Cpu,
  WifiOff,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const LanSpecView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Multi-Terminal Computer Lab LAN Architecture
            </h3>
            <Badge variant="purple" size="sm">Phase 5 Specification Preview</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Architectural protocol blueprint for multi-PC computer labs without internet requirements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="green" size="sm">
            ● Single-Terminal Mode: Active & Offline
          </Badge>
        </div>
      </div>

      {/* Operational Notice */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Architectural Boundary & Standalone Guarantee</p>
          <p className="text-amber-800 dark:text-amber-300">
            Typing Master Pro is 100% operational as a standalone offline desktop application.
            The LAN protocol below is the standardized architectural roadmap designed for multi-terminal deployment across institute computer rooms.
          </p>
        </div>
      </div>

      {/* Topology Diagram Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 text-xs space-y-2">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold">
            <Server className="w-4 h-4" />
            <span>1. Master Institute Server</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Instructor terminal runs the local LAN daemon on port <strong>8765</strong>. It aggregates student attendance, publishes test assignments, and maintains the centralized laboratory record.
          </p>
          <div className="font-mono text-[10px] bg-white dark:bg-slate-900 p-2 rounded border border-purple-200 dark:border-purple-800">
            HTTP / WebSocket Server (Offline)
          </div>
        </div>

        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 text-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold">
            <Monitor className="w-4 h-4" />
            <span>2. Student Lab Terminals</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Client PCs discover the master server via UDP broadcast on port <strong>8766</strong> or through static IP configuration. Students type exams with zero network latency.
          </p>
          <div className="font-mono text-[10px] bg-white dark:bg-slate-900 p-2 rounded border border-blue-200 dark:border-blue-800">
            Local Outbox Queue & Offline Cache
          </div>
        </div>

        <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/20 text-xs space-y-2">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>3. Conflict & Integrity Model</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Exam submissions and attendance use immutable append-only records with SHA-256 HMAC packet signatures. If LAN cables disconnect, client stores exams locally and flushes upon reconnection.
          </p>
          <div className="font-mono text-[10px] bg-white dark:bg-slate-900 p-2 rounded border border-teal-200 dark:border-teal-800">
            Append-Only Vector Clock Protocol
          </div>
        </div>
      </div>
    </div>
  );
};
