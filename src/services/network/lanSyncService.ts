import {
  TerminalNode,
  TerminalRole,
  TerminalStatus,
  LanSyncMessage,
  KioskViolationRecord,
} from '@/types/remington';

type MessageListener = (message: LanSyncMessage) => void;
type TerminalsListener = (terminals: TerminalNode[]) => void;

const BROADCAST_CHANNEL_NAME = 'tmp_lan_sync_channel';
const HEARTBEAT_INTERVAL_MS = 3000;
const NODE_TIMEOUT_MS = 10000;

class LanSyncService {
  private channel: BroadcastChannel | null = null;
  private messageListeners: Set<MessageListener> = new Set();
  private terminalsListeners: Set<TerminalsListener> = new Set();

  private role: TerminalRole = 'node';
  private currentNodeId: string = 'TERM-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  private hostname: string = 'LAB-PC-' + this.currentNodeId.slice(-4);
  private ipAddress: string = '192.168.1.' + Math.floor(10 + Math.random() * 80);
  private currentStatus: TerminalStatus = 'idle';

  // State maintained for Node
  private currentStudentInfo?: {
    id: string;
    name: string;
    rollNo: string;
    batchId?: string;
  };
  private currentExamInfo?: {
    title: string;
    wpm: number;
    accuracy: number;
    elapsedSeconds: number;
  };

  // State maintained for Master
  private activeNodes: Map<string, TerminalNode> = new Map();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      if ('BroadcastChannel' in window) {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.handleIncomingMessage(event.data);
        };
      }
    } catch (e) {
      console.warn('[LanSyncService] BroadcastChannel not supported, falling back to local mode', e);
    }

    this.startHeartbeat();
    this.startMasterCleanupLoop();
    this.isInitialized = true;
  }

  public setRole(role: TerminalRole): void {
    this.role = role;
    if (role === 'master') {
      // Re-trigger terminals list to listeners
      this.notifyTerminalsUpdated();
    }
  }

  public getRole(): TerminalRole {
    return this.role;
  }

  public getCurrentTerminalId(): string {
    return this.currentNodeId;
  }

  public setTerminalId(id: string): void {
    this.currentNodeId = id;
    this.broadcastHeartbeat();
  }

  public setStudentContext(student: { id: string; name: string; rollNo: string; batchId?: string } | undefined): void {
    this.currentStudentInfo = student;
    this.broadcastHeartbeat();
  }

  public updateExamProgress(title: string, wpm: number, accuracy: number, elapsedSeconds: number, status: TerminalStatus = 'in_exam'): void {
    this.currentStatus = status;
    this.currentExamInfo = { title, wpm, accuracy, elapsedSeconds };

    this.broadcastMessage({
      type: 'TEST_PROGRESS',
      payload: {
        title,
        wpm,
        accuracy,
        elapsedSeconds,
        student: this.currentStudentInfo,
        status,
      },
    });

    this.broadcastHeartbeat();
  }

  public reportKioskViolation(violation: KioskViolationRecord, totalViolations: number): void {
    this.broadcastMessage({
      type: 'KIOSK_VIOLATION',
      payload: {
        violation,
        totalViolations,
        student: this.currentStudentInfo,
        nodeId: this.currentNodeId,
      },
    });
  }

  public setStatus(status: TerminalStatus): void {
    this.currentStatus = status;
    this.broadcastHeartbeat();
  }

  public sendInstructorCommand(targetTerminalId: string, command: 'LOCK' | 'UNLOCK' | 'FORCE_SUBMIT'): void {
    const msgType = command === 'LOCK'
      ? 'INSTRUCTOR_LOCK_COMMAND'
      : command === 'UNLOCK'
      ? 'INSTRUCTOR_UNLOCK_COMMAND'
      : 'INSTRUCTOR_LOCK_COMMAND';

    this.broadcastMessage({
      type: msgType,
      payload: {
        targetTerminalId,
        command,
      },
    });
  }

  public subscribeMessages(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  public subscribeTerminals(listener: TerminalsListener): () => void {
    this.terminalsListeners.add(listener);
    // Send immediate snapshot
    listener(Array.from(this.activeNodes.values()));
    return () => {
      this.terminalsListeners.delete(listener);
    };
  }

  public getActiveTerminals(): TerminalNode[] {
    return Array.from(this.activeNodes.values());
  }

  // --- Private Helpers ---

  private startHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      this.broadcastHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);
  }

  private startMasterCleanupLoop(): void {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      let changed = false;

      this.activeNodes.forEach((node, id) => {
        if (now - node.lastHeartbeat > NODE_TIMEOUT_MS && node.status !== 'disconnected') {
          node.status = 'disconnected';
          changed = true;
        }
      });

      if (changed) {
        this.notifyTerminalsUpdated();
      }
    }, 4000);
  }

  private broadcastHeartbeat(): void {
    const nodeState: TerminalNode = {
      id: this.currentNodeId,
      ipAddress: this.ipAddress,
      hostname: this.hostname,
      role: this.role,
      status: this.currentStatus,
      currentStudentId: this.currentStudentInfo?.id,
      currentStudentName: this.currentStudentInfo?.name,
      currentStudentRollNo: this.currentStudentInfo?.rollNo,
      batchId: this.currentStudentInfo?.batchId,
      currentWpm: this.currentExamInfo?.wpm,
      currentAccuracy: this.currentExamInfo?.accuracy,
      elapsedSeconds: this.currentExamInfo?.elapsedSeconds,
      activeTestTitle: this.currentExamInfo?.title,
      lastHeartbeat: Date.now(),
      appVersion: '7.0.0',
    };

    // Keep self updated in master list too
    if (this.role === 'master' || true) {
      this.activeNodes.set(nodeState.id, nodeState);
      this.notifyTerminalsUpdated();
    }

    this.broadcastMessage({
      type: 'HEARTBEAT',
      payload: nodeState,
    });
  }

  private broadcastMessage(params: { type: LanSyncMessage['type']; payload: any }): void {
    const msg: LanSyncMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderTerminalId: this.currentNodeId,
      senderRole: this.role,
      type: params.type,
      payload: params.payload,
      timestamp: Date.now(),
    };

    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (err) {
        console.error('[LanSyncService] Broadcast error:', err);
      }
    }

    // Also dispatch locally
    this.handleIncomingMessage(msg, true);
  }

  private handleIncomingMessage(msg: LanSyncMessage, isLocalEcho = false): void {
    // Notify general message subscribers
    this.messageListeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (e) {
        console.error('[LanSyncService] Listener error:', e);
      }
    });

    // Update activeNodes if this is a heartbeat or progress
    if (msg.type === 'HEARTBEAT' && msg.payload && msg.payload.id) {
      const node: TerminalNode = msg.payload;
      this.activeNodes.set(node.id, {
        ...node,
        lastHeartbeat: Date.now(),
      });
      this.notifyTerminalsUpdated();
    } else if (msg.type === 'TEST_PROGRESS' && msg.payload) {
      const existing = this.activeNodes.get(msg.senderTerminalId);
      if (existing) {
        existing.status = msg.payload.status || 'in_exam';
        existing.currentWpm = msg.payload.wpm;
        existing.currentAccuracy = msg.payload.accuracy;
        existing.elapsedSeconds = msg.payload.elapsedSeconds;
        existing.activeTestTitle = msg.payload.title;
        existing.lastHeartbeat = Date.now();
        this.notifyTerminalsUpdated();
      }
    } else if (msg.type === 'KIOSK_VIOLATION' && msg.payload) {
      const existing = this.activeNodes.get(msg.senderTerminalId);
      if (existing) {
        if (msg.payload.totalViolations >= 3) {
          existing.status = 'locked';
        }
        this.notifyTerminalsUpdated();
      }
    }
  }

  private notifyTerminalsUpdated(): void {
    const list = Array.from(this.activeNodes.values());
    this.terminalsListeners.forEach((listener) => {
      try {
        listener(list);
      } catch (e) {
        console.error('[LanSyncService] Terminals listener error:', e);
      }
    });
  }

  public destroy(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    if (this.channel) {
      try {
        this.channel.close();
      } catch {}
    }
    this.messageListeners.clear();
    this.terminalsListeners.clear();
    this.isInitialized = false;
  }
}

export const lanSyncService = new LanSyncService();
