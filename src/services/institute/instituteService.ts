import {
  InstituteStudent,
  Batch,
  InstituteUser,
  InstituteDashboardStats,
} from '@/types/institute';
import { StudentProfile } from '@/types';
import { storageService } from '../storage/storageService';
import { CryptoService } from '../security/cryptoService';
import { AuditService } from './auditService';

export class InstituteService {
  // --- Student Management ---

  public static async getStudents(
    filters?: { batchId?: string; status?: 'active' | 'archived'; searchQuery?: string }
  ): Promise<InstituteStudent[]> {
    const adapter = await storageService.getAdapter();
    let students = await adapter.getInstituteStudents();

    if (filters) {
      if (filters.status) {
        students = students.filter((s) => s.status === filters.status);
      }
      if (filters.batchId && filters.batchId !== 'all') {
        students = students.filter((s) => s.batchId === filters.batchId);
      }
      if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.toLowerCase().trim();
        students = students.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.rollNo.toLowerCase().includes(q) ||
            (s.phone && s.phone.includes(q))
        );
      }
    }

    return students;
  }

  public static async getStudentById(id: string): Promise<InstituteStudent | null> {
    const adapter = await storageService.getAdapter();
    return adapter.getInstituteStudentById(id);
  }

  public static async checkDuplicateRollNo(rollNo: string, excludeId?: string): Promise<boolean> {
    const adapter = await storageService.getAdapter();
    const existing = await adapter.getInstituteStudentByRollNo(rollNo.trim());
    if (!existing) return false;
    if (excludeId && existing.id === excludeId) return false;
    return true;
  }

  public static async addStudent(
    studentData: Omit<InstituteStudent, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'joinDate'> & {
      id?: string;
      status?: 'active' | 'archived';
      joinDate?: string;
    },
    actor: { id: string; name: string; role: any }
  ): Promise<{ success: boolean; student?: InstituteStudent; message?: string }> {
    const adapter = await storageService.getAdapter();

    const cleanRollNo = studentData.rollNo.trim();
    if (!cleanRollNo) {
      return { success: false, message: 'Roll Number is required.' };
    }

    const isDuplicate = await this.checkDuplicateRollNo(cleanRollNo);
    if (isDuplicate) {
      return { success: false, message: `A student with Roll Number '${cleanRollNo}' already exists.` };
    }

    const studentId = studentData.id || `stud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newStudent: InstituteStudent = {
      id: studentId,
      rollNo: cleanRollNo,
      name: studentData.name.trim(),
      batchId: studentData.batchId,
      courseId: studentData.courseId || 'course_level_1',
      status: studentData.status || 'active',
      phone: studentData.phone?.trim() || '',
      guardian: studentData.guardian?.trim() || '',
      joinDate: studentData.joinDate || new Date().toISOString().split('T')[0],
      notes: studentData.notes?.trim() || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await adapter.saveInstituteStudent(newStudent);

    // Sync corresponding StudentProfile for single-student login
    const existingProfile = await adapter.getProfileById(studentId);
    if (!existingProfile) {
      const profile: StudentProfile = {
        id: studentId,
        name: newStudent.name,
        avatar: 'avatar-scholar',
        instituteRollNo: newStudent.rollNo,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        preferences: {
          language: 'hindi',
          keyboardLayout: 'hindi_inscript',
          fontPreference: 'noto_sans_devanagari',
          dailyPracticeGoal: 20,
          theme: 'light',
          soundEffects: true,
          fontSize: 'normal',
        },
      };
      await adapter.saveProfile(profile);
    }

    await AuditService.log(
      actor.id,
      actor.name,
      actor.role,
      'CREATE_STUDENT',
      `Registered student ${newStudent.name} (${newStudent.rollNo})`,
      newStudent.id
    );

    return { success: true, student: newStudent };
  }

  public static async updateStudent(
    id: string,
    updates: Partial<Omit<InstituteStudent, 'id' | 'createdAt'>>,
    actor: { id: string; name: string; role: any }
  ): Promise<{ success: boolean; student?: InstituteStudent; message?: string }> {
    const adapter = await storageService.getAdapter();
    const student = await adapter.getInstituteStudentById(id);
    if (!student) {
      return { success: false, message: 'Student not found.' };
    }

    if (updates.rollNo && updates.rollNo.trim() !== student.rollNo) {
      const isDuplicate = await this.checkDuplicateRollNo(updates.rollNo, id);
      if (isDuplicate) {
        return { success: false, message: `Roll Number '${updates.rollNo}' is already taken.` };
      }
    }

    const updated: InstituteStudent = {
      ...student,
      ...updates,
      updatedAt: Date.now(),
    };

    await adapter.saveInstituteStudent(updated);

    // Update profile name & rollNo if changed
    const profile = await adapter.getProfileById(id);
    if (profile) {
      profile.name = updated.name;
      profile.instituteRollNo = updated.rollNo;
      await adapter.saveProfile(profile);
    }

    await AuditService.log(
      actor.id,
      actor.name,
      actor.role,
      'UPDATE_STUDENT',
      `Updated student details for ${updated.name} (${updated.rollNo})`,
      id
    );

    return { success: true, student: updated };
  }

  public static async archiveStudent(
    id: string,
    actor: { id: string; name: string; role: any }
  ): Promise<boolean> {
    const res = await this.updateStudent(id, { status: 'archived' }, actor);
    if (res.success) {
      await AuditService.log(
        actor.id,
        actor.name,
        actor.role,
        'ARCHIVE_STUDENT',
        `Archived student ID ${id}`,
        id
      );
    }
    return res.success;
  }

  public static async restoreStudent(
    id: string,
    actor: { id: string; name: string; role: any }
  ): Promise<boolean> {
    const res = await this.updateStudent(id, { status: 'active' }, actor);
    if (res.success) {
      await AuditService.log(
        actor.id,
        actor.name,
        actor.role,
        'RESTORE_STUDENT',
        `Restored student ID ${id}`,
        id
      );
    }
    return res.success;
  }

  public static async deleteStudentPermanently(
    id: string,
    actor: { id: string; name: string; role: any }
  ): Promise<boolean> {
    const adapter = await storageService.getAdapter();
    const student = await adapter.getInstituteStudentById(id);
    if (!student) return false;

    await adapter.deleteInstituteStudent(id);
    await adapter.deleteProfile(id);

    await AuditService.log(
      actor.id,
      actor.name,
      actor.role,
      'PERMANENT_DELETE_STUDENT',
      `Permanently deleted student ${student.name} (${student.rollNo})`,
      id
    );
    return true;
  }

  // --- Bulk CSV Import & Export ---

  public static parseStudentsCsv(csvText: string): Array<{
    rollNo: string;
    name: string;
    phone?: string;
    guardian?: string;
    courseId?: string;
  }> {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const parsed: Array<{ rollNo: string; name: string; phone?: string; guardian?: string; courseId?: string }> = [];

    // Parse header to find column indices
    const headerRow = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim().toLowerCase());
    const rollIdx = headerRow.findIndex((h) => h.includes('roll') || h.includes('id'));
    const nameIdx = headerRow.findIndex((h) => h.includes('name'));
    const phoneIdx = headerRow.findIndex((h) => h.includes('phone') || h.includes('mobile'));
    const guardianIdx = headerRow.findIndex((h) => h.includes('guardian') || h.includes('father'));
    const courseIdx = headerRow.findIndex((h) => h.includes('course'));

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((col) => col.replace(/^"|"$/g, '').trim());
      const rollNo = rollIdx >= 0 ? parts[rollIdx] : parts[0];
      const name = nameIdx >= 0 ? parts[nameIdx] : parts[1];

      if (rollNo && name) {
        parsed.push({
          rollNo,
          name,
          phone: phoneIdx >= 0 ? parts[phoneIdx] : undefined,
          guardian: guardianIdx >= 0 ? parts[guardianIdx] : undefined,
          courseId: courseIdx >= 0 ? parts[courseIdx] : undefined,
        });
      }
    }

    return parsed;
  }

  public static async importStudentsFromCsv(
    csvText: string,
    batchId: string,
    actor: { id: string; name: string; role: any }
  ): Promise<{ importedCount: number; skippedCount: number; errors: string[] }> {
    const rows = this.parseStudentsCsv(csvText);
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const r of rows) {
      const isDup = await this.checkDuplicateRollNo(r.rollNo);
      if (isDup) {
        skipped++;
        errors.push(`Roll number ${r.rollNo} (${r.name}) already exists. Skipped.`);
        continue;
      }

      const res = await this.addStudent(
        {
          rollNo: r.rollNo,
          name: r.name,
          batchId,
          courseId: r.courseId || 'course_level_1',
          phone: r.phone || '',
          guardian: r.guardian || '',
          joinDate: new Date().toISOString().split('T')[0],
        },
        actor
      );

      if (res.success) {
        imported++;
      } else {
        skipped++;
        if (res.message) errors.push(res.message);
      }
    }

    return { importedCount: imported, skippedCount: skipped, errors };
  }

  public static exportStudentsToCsv(students: InstituteStudent[], batches: Batch[]): string {
    const BOM = '\uFEFF';
    const batchMap = new Map(batches.map((b) => [b.id, b.name]));

    const headers = ['Roll Number', 'Full Name', 'Batch', 'Course ID', 'Status', 'Phone', 'Guardian', 'Join Date'];
    const rows = students.map((s) => [
      `"${s.rollNo}"`,
      `"${s.name}"`,
      `"${batchMap.get(s.batchId) || s.batchId}"`,
      `"${s.courseId}"`,
      `"${s.status}"`,
      `"${s.phone || ''}"`,
      `"${s.guardian || ''}"`,
      `"${s.joinDate}"`,
    ]);

    return BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }

  // --- Batch Management ---

  public static async getBatches(): Promise<Batch[]> {
    const adapter = await storageService.getAdapter();
    return adapter.getBatches();
  }

  public static async getBatchById(id: string): Promise<Batch | null> {
    const adapter = await storageService.getAdapter();
    return adapter.getBatchById(id);
  }

  public static async addBatch(
    batchData: Omit<Batch, 'id' | 'createdAt' | 'status'>,
    actor: { id: string; name: string; role: any }
  ): Promise<{ success: boolean; batch?: Batch; message?: string }> {
    const adapter = await storageService.getAdapter();

    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newBatch: Batch = {
      id: batchId,
      name: batchData.name.trim(),
      code: batchData.code.trim().toUpperCase(),
      shift: batchData.shift,
      startTime: batchData.startTime,
      endTime: batchData.endTime,
      teacherId: batchData.teacherId,
      assignedCourse: batchData.assignedCourse || 'All Courses',
      maxCapacity: batchData.maxCapacity || 30,
      status: 'active',
      createdAt: Date.now(),
      notes: batchData.notes || '',
    };

    await adapter.saveBatch(newBatch);

    await AuditService.log(
      actor.id,
      actor.name,
      actor.role,
      'CREATE_BATCH',
      `Created batch ${newBatch.name} (${newBatch.code})`,
      newBatch.id
    );

    return { success: true, batch: newBatch };
  }

  public static async updateBatch(
    id: string,
    updates: Partial<Omit<Batch, 'id' | 'createdAt'>>,
    actor: { id: string; name: string; role: any }
  ): Promise<{ success: boolean; batch?: Batch; message?: string }> {
    const adapter = await storageService.getAdapter();
    const batch = await adapter.getBatchById(id);
    if (!batch) {
      return { success: false, message: 'Batch not found.' };
    }

    const updated: Batch = {
      ...batch,
      ...updates,
    };

    await adapter.saveBatch(updated);

    await AuditService.log(
      actor.id,
      actor.name,
      actor.role,
      'UPDATE_BATCH',
      `Updated batch ${updated.name}`,
      id
    );

    return { success: true, batch: updated };
  }

  public static async deleteBatch(
    id: string,
    actor: { id: string; name: string; role: any }
  ): Promise<boolean> {
    const adapter = await storageService.getAdapter();
    const batch = await adapter.getBatchById(id);
    if (!batch) return false;

    await adapter.deleteBatch(id);

    await AuditService.log(
      actor.id,
      actor.name,
      actor.role,
      'DELETE_BATCH',
      `Deleted batch ${batch.name}`,
      id
    );

    return true;
  }

  // --- Teacher Management ---

  public static async getTeachers(): Promise<InstituteUser[]> {
    const adapter = await storageService.getAdapter();
    const users = await adapter.getInstituteUsers();
    return users.filter((u) => u.role === 'teacher');
  }

  public static async addTeacher(
    data: {
      username: string;
      name: string;
      secret: string; // password or PIN
      assignedBatchIds?: string[];
      phone?: string;
      email?: string;
    },
    actor: { id: string; name: string; role: any }
  ): Promise<{ success: boolean; user?: InstituteUser; message?: string }> {
    const adapter = await storageService.getAdapter();
    const cleanUsername = data.username.trim().toLowerCase();

    const existing = await adapter.getInstituteUserByUsername(cleanUsername);
    if (existing) {
      return { success: false, message: `Username '${cleanUsername}' already exists.` };
    }

    const salt = CryptoService.generateSalt();
    const passwordHash = await CryptoService.hashSecret(data.secret, salt);

    const newTeacher: InstituteUser = {
      id: `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername,
      name: data.name.trim(),
      role: 'teacher',
      passwordHash,
      salt,
      assignedBatchIds: data.assignedBatchIds || [],
      phone: data.phone || '',
      email: data.email || '',
      isActive: true,
      createdAt: Date.now(),
    };

    await adapter.saveInstituteUser(newTeacher);

    await AuditService.log(
      actor.id,
      actor.name,
      actor.role,
      'CREATE_TEACHER',
      `Created teacher account ${newTeacher.name} (${newTeacher.username})`,
      newTeacher.id
    );

    return { success: true, user: newTeacher };
  }

  public static async resetUserSecret(
    userId: string,
    newSecret: string,
    actor: { id: string; name: string; role: any }
  ): Promise<boolean> {
    const adapter = await storageService.getAdapter();
    const user = await adapter.getInstituteUserById(userId);
    if (!user) return false;

    const salt = CryptoService.generateSalt();
    user.salt = salt;
    user.passwordHash = await CryptoService.hashSecret(newSecret, salt);

    await adapter.saveInstituteUser(user);

    await AuditService.log(
      actor.id,
      actor.name,
      actor.role,
      'RESET_PASSWORD',
      `Reset credentials for staff ${user.name} (${user.username})`,
      userId
    );

    return true;
  }

  // --- Real Institute Dashboard Analytics ---

  public static async getDashboardStats(): Promise<InstituteDashboardStats> {
    const adapter = await storageService.getAdapter();

    const students = await adapter.getInstituteStudents();
    const batches = await adapter.getBatches();
    const users = await adapter.getInstituteUsers();
    const examResults = await adapter.getExamResults();
    const recentActivities = await adapter.getAuditLogs(10);

    const activeStudents = students.filter((s) => s.status === 'active');
    const archivedStudents = students.filter((s) => s.status === 'archived');
    const activeBatches = batches.filter((b) => b.status === 'active');
    const teachers = users.filter((u) => u.role === 'teacher');

    // Count all completed LMS lessons across student profiles
    let totalCompletedLessons = 0;
    for (const student of students) {
      const progress = await adapter.getLessonProgress(student.id);
      totalCompletedLessons += progress.filter((p) => p.isCompleted).length;
    }

    // Average speed & accuracy from exams
    let totalSpeed = 0;
    let totalAccuracy = 0;
    if (examResults.length > 0) {
      for (const r of examResults) {
        totalSpeed += r.scoring.netWpm;
        totalAccuracy += r.scoring.accuracy;
      }
    }
    const averageSpeedWpm = examResults.length > 0
      ? Math.round((totalSpeed / examResults.length) * 10) / 10
      : 0;
    const averageAccuracy = examResults.length > 0
      ? Math.round((totalAccuracy / examResults.length) * 10) / 10
      : 0;

    // Detect students needing attention (accuracy < 85% or speed < 20 in latest test, or 0 lessons completed)
    const studentsNeedingAttention: InstituteDashboardStats['studentsNeedingAttention'] = [];
    for (const student of activeStudents) {
      const studentExams = examResults.filter((r) => r.profileId === student.id);
      if (studentExams.length > 0) {
        const latest = studentExams[0];
        if (latest.scoring.accuracy < 85) {
          studentsNeedingAttention.push({
            student,
            reason: `Low test accuracy (${latest.scoring.accuracy}%) on ${latest.presetTitle || 'recent exam'}`,
            currentSpeed: latest.scoring.netWpm,
            currentAccuracy: latest.scoring.accuracy,
          });
        } else if (latest.scoring.netWpm < 15) {
          studentsNeedingAttention.push({
            student,
            reason: `Below target typing speed (${latest.scoring.netWpm} WPM)`,
            currentSpeed: latest.scoring.netWpm,
            currentAccuracy: latest.scoring.accuracy,
          });
        }
      }
    }

    return {
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      archivedStudents: archivedStudents.length,
      totalBatches: batches.length,
      activeBatches: activeBatches.length,
      totalTeachers: teachers.length,
      completedLessons: totalCompletedLessons,
      testsConducted: examResults.length,
      averageSpeedWpm,
      averageAccuracy,
      studentsNeedingAttention: studentsNeedingAttention.slice(0, 5),
      recentActivities,
    };
  }
}
