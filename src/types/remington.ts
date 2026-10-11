import { Finger, Hand, KeyCategory } from '@/services/engine/inscriptMapping';

// ================= MODULE 1: REMINGTON GAIL ENGINE TYPES =================

export interface RemingtonKeyDef {
  code: string;                 // Physical event.code (e.g. 'KeyD', 'KeyK')
  enNormal: string;             // Physical key unshifted (e.g. 'd')
  enShift: string;              // Physical key shifted (e.g. 'D')
  hiNormal: string;             // Remington unshifted Unicode output (e.g. 'क्')
  hiShift: string;              // Remington shifted Unicode output (e.g. 'क')
  altCode?: string;             // Standard typewriter Alt code (e.g. '0161')
  hiAlt?: string;               // Alt code character output (e.g. 'ऋ')
  finger: Finger;
  hand: Hand;
  normalCategory: KeyCategory;
  shiftCategory: KeyCategory;
  row: 'number' | 'top' | 'home' | 'bottom' | 'space';
  isHomeKey?: boolean;
}

export interface RemingtonAltCodeDef {
  code: string;                 // e.g. "0161", "0179", "0216"
  keyCombo: string;             // e.g. "Alt + 0161"
  character: string;            // e.g. "ऋ", "द्ग", "क्त"
  nameHindi: string;
  usageExample: string;
}

// ================= MODULE 2: STRICT KIOSK LOCKDOWN TYPES =================

export type KioskViolationType =
  | 'tab_switch'
  | 'window_blur'
  | 'fullscreen_exit'
  | 'prohibited_key_attempt'
  | 'context_menu_attempt'
  | 'devtools_attempt';

export interface KioskViolationRecord {
  id: string;
  timestamp: number;
  type: KioskViolationType;
  details: string;
  durationMs?: number;
}

export interface KioskPolicy {
  enforceFullscreen: boolean;
  maxViolationsAllowed: number;       // e.g. 3 violations allowed before auto-submission/disqualification
  autoSubmitOnViolationLimit: boolean;
  blockAltTab: boolean;
  blockWindowsKey: boolean;
  blockContextMenu: boolean;
  blockClipboard: boolean;
  requireInstructorUnlockOnBreach: boolean;
}

export interface KioskSessionState {
  isActive: boolean;
  isFullscreen: boolean;
  violationCount: number;
  violations: KioskViolationRecord[];
  isLockedDueToBreach: boolean;
  isTerminated: boolean;
}

// ================= MODULE 3: MULTI-PC LAN SYNC TYPES =================

export type TerminalRole = 'master' | 'node';

export type TerminalStatus = 'idle' | 'in_practice' | 'in_exam' | 'exam_completed' | 'disconnected' | 'locked';

export interface TerminalNode {
  id: string;                         // e.g. "TERM-01", "TERM-LAB-04"
  ipAddress: string;
  hostname: string;
  role: TerminalRole;
  currentStudentId?: string;
  currentStudentName?: string;
  currentStudentRollNo?: string;
  batchId?: string;
  status: TerminalStatus;
  currentWpm?: number;
  currentAccuracy?: number;
  elapsedSeconds?: number;
  activeTestTitle?: string;
  lastHeartbeat: number;
  appVersion: string;
}

export interface LanSyncMessage {
  id: string;
  senderTerminalId: string;
  senderRole: TerminalRole;
  type:
    | 'HEARTBEAT'
    | 'TEST_STARTED'
    | 'TEST_PROGRESS'
    | 'TEST_SUBMITTED'
    | 'KIOSK_VIOLATION'
    | 'INSTRUCTOR_LOCK_COMMAND'
    | 'INSTRUCTOR_UNLOCK_COMMAND'
    | 'ATTENDANCE_UPDATE';
  payload: any;
  timestamp: number;
}
