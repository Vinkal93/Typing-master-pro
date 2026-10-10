import { AttendanceRecord, AttendanceStatus, Batch, InstituteStudent } from '@/types/institute';
import { storageService } from '../storage/storageService';
import { AuditService } from './auditService';

export class AttendanceService {
  public static async getBatchAttendanceForDate(batchId: string, date: string): Promise<AttendanceRecord[]> {
    const adapter = await storageService.getAdapter();
    return adapter.getAttendanceRecords(batchId, date);
  }

  public static async markAttendanceRecord(
    record: Omit<AttendanceRecord, 'id' | 'markedAt'>,
    actor: { id: string; name: string; role: any }
  ): Promise<AttendanceRecord> {
    const adapter = await storageService.getAdapter();
    const id = `att_${record.date}_${record.studentId}`;
    const fullRecord: AttendanceRecord = {
      ...record,
      id,
      markedAt: Date.now(),
      markedByTeacherId: actor.id,
    };

    await adapter.saveAttendanceRecord(fullRecord);

    await AuditService.log(
      actor.id,
      actor.name,
      actor.role,
      'MARK_ATTENDANCE',
      `Marked ${record.studentName} as ${record.status} on ${record.date}`,
      record.studentId
    );

    return fullRecord;
  }

  public static async markAllBatchPresent(
    batchId: string,
    date: string,
    students: InstituteStudent[],
    actor: { id: string; name: string; role: any }
  ): Promise<void> {
    const adapter = await storageService.getAdapter();
    const records: AttendanceRecord[] = students.map((s) => ({
      id: `att_${date}_${s.id}`,
      date,
      batchId,
      studentId: s.id,
      studentName: s.name,
      studentRollNo: s.rollNo,
      status: 'present',
      markedByTeacherId: actor.id,
      markedAt: Date.now(),
    }));

    await adapter.saveAttendanceBatch(records);

    await AuditService.log(
      actor.id,
      actor.name,
      actor.role,
      'BULK_ATTENDANCE',
      `Marked all ${students.length} students present for batch ID ${batchId} on ${date}`,
      batchId
    );
  }

  public static async getStudentMonthlyAttendanceSummary(
    studentId: string,
    yearMonth: string // YYYY-MM
  ): Promise<{ present: number; absent: number; late: number; total: number; percentage: number }> {
    const adapter = await storageService.getAdapter();
    const all = await adapter.getAttendanceRecords();
    const studentRecords = all.filter(
      (r) => r.studentId === studentId && r.date.startsWith(yearMonth)
    );

    let present = 0;
    let absent = 0;
    let late = 0;

    for (const r of studentRecords) {
      if (r.status === 'present') present++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'late') late++;
    }

    const total = studentRecords.length;
    const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0;

    return { present, absent, late, total, percentage };
  }

  public static exportAttendanceToCsv(
    records: AttendanceRecord[],
    batch: Batch | null,
    date: string
  ): string {
    const BOM = '\uFEFF';
    const headers = ['Date', 'Roll Number', 'Student Name', 'Batch', 'Status', 'Remarks'];
    const rows = records.map((r) => [
      `"${r.date}"`,
      `"${r.studentRollNo}"`,
      `"${r.studentName}"`,
      `"${batch ? batch.name : r.batchId}"`,
      `"${r.status.toUpperCase()}"`,
      `"${r.remarks || ''}"`,
    ]);

    return BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }
}
