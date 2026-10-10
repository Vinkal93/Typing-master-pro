/**
 * Multi-PC Computer Lab Local Area Network (LAN) Architecture Specification
 *
 * This document defines the protocol, security model, and synchronization semantics
 * for the optional computer institute multi-terminal LAN expansion.
 *
 * NOTICE: Single-device operation remains 100% standalone and offline-first.
 * LAN synchronization is an optional extension layer.
 */

export interface LanDeviceNode {
  deviceId: string;
  terminalNumber: number;
  hostName: string;
  ipAddress: string;
  role: 'lab_server' | 'student_client';
  lastSeenAt: number;
  syncStatus: 'synced' | 'pending' | 'offline';
  clientVersion: string;
}

export interface LanSyncPacket {
  packetId: string;
  senderDeviceId: string;
  timestamp: number;
  vectorClock: Record<string, number>;
  entityType: 'student' | 'batch' | 'exam_result' | 'attendance' | 'assignment';
  operation: 'UPSERT' | 'ARCHIVE' | 'DELETE';
  payloadJson: string;
  signature: string;
}

export interface LanServerConfig {
  isEnabled: boolean;
  serverPort: number; // Default 8765
  udpDiscoveryPort: number; // Default 8766
  authToken: string;
  manualServerIp?: string;
  conflictResolutionStrategy: 'server_wins' | 'latest_timestamp' | 'crdt_merge';
}

export class LanArchitectureSpecification {
  public static readonly DEFAULT_CONFIG: LanServerConfig = {
    isEnabled: false,
    serverPort: 8765,
    udpDiscoveryPort: 8766,
    authToken: 'TMP_LAB_SECURE_LAN_SECRET',
    conflictResolutionStrategy: 'latest_timestamp',
  };

  /**
   * Technical Architectural Whitepaper.
   */
  public static getSpecificationDocument(): string {
    return `# Multi-Terminal Computer Lab LAN Synchronization Specification

## 1. Executive Overview
In professional computer training institutes (such as CPCT coaching centers and government exam institutes), 20 to 100 client PCs run in an isolated Local Area Network (LAN) without internet access.

The Typing Master Pro LAN Architecture enables:
- One Master Teacher PC acting as the local Institute Lab Server.
- Student Terminal PCs running the standard Typing Master Pro client.
- Zero external internet dependency.
- Local broadcast discovery and offline queuing.

---

## 2. Network Topology & Discovery

\`\`\`mermaid
flowchart TD
    TeacherServer["🖥️ Teacher Master Terminal<br/>(Local Server: 192.168.1.100:8765)"]
    Switch["🔀 Institute LAN Switch / Router (No Internet)"]
    TeacherServer --- Switch

    Switch --- Client1["💻 Student Terminal 01<br/>(Client: 192.168.1.101)"]
    Switch --- Client2["💻 Student Terminal 02<br/>(Client: 192.168.1.102)"]
    Switch --- Client3["💻 Student Terminal 03<br/>(Client: 192.168.1.103)"]
    Switch --- ClientN["💻 Student Terminal N...<br/>(Client: 192.168.1.X)"]
\`\`\`

### Discovery Mechanism:
1. **UDP Broadcast Probe**:
   - Master Server broadcasts heartbeat beacon on UDP port 8766 every 5 seconds:
     \`{"app": "TypingMasterPro", "role": "server", "port": 8765, "clusterId": "TMP-LAB-01"}\`
   - Client terminals listen on UDP port 8766 to auto-discover server IP.
2. **Static Fallback**:
   - For labs with broadcast filtering enabled, clients accept a manually configured Static IP (e.g., \`192.168.1.100:8765\`).

---

## 3. Security & Terminal Registration
1. **Challenge-Response Pairing**:
   - On first boot, client presents Terminal Number (e.g., PC-07) and Machine Hardware UUID.
   - Master teacher approves the terminal from the Teacher Console with a 6-digit Lab Pairing Code.
2. **Local Token Authentication**:
   - Authenticated sessions exchange SHA-256 HMAC signed sync packets over local HTTP/WebSocket.

---

## 4. Offline Client Queue & Eventual Consistency
- **Disconnected Tolerance**:
  - If network cable is unplugged during a typing examination, the client continues uninterrupted.
  - Completed exam results and LMS progress records are written immediately to local IndexedDB/SQLite.
  - Unsynchronized records enter an \`outbox_queue\` table.
- **Reconnection Flush**:
  - When connection is re-established, the queue flushes in chronological order using idempotency keys (\`record.id\`).

---

## 5. Conflict Resolution Strategy
- **Exam Attempts & Attendance**:
  - Append-only immutable log. Never overwritten. Duplicate attempts reconciled by record UUID.
- **Student Profile Edits**:
  - Lamport timestamp comparison (\`updatedAt > existing.updatedAt\`).
- **Batches & Assignments**:
  - Server Authoritative. Master PC changes always take precedence.

---

## 6. Current Implementation Status
- **Current Mode**: Single-Terminal Standalone Engine (Active & Verified).
- **LAN Module**: Specification & Interface definition completed (Phase 5). Protocol engine stubbed ready for Phase 6 socket daemon.`;
  }
}
