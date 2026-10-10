import { TestAssignment, AssignmentStatus } from '@/types/institute';
import { ExamAttemptRecord } from '@/types/exam';
import { storageService } from '../storage/storageService';
import { AuditService } from './auditService';

export class AssignmentService {
  public static async getAssignments(status?: AssignmentStatus): Promise<TestAssignment[]> {
    const adapter = await storageService.getAdapter();
    let list = await adapter.getTestAssignments();
    if (status) {
      list = list.filter((a) => a.status === status);
    }
    return list;
  }

  public static async getAssignmentById(id: string): Promise<TestAssignment | null> {
    const adapter = await storageService.getAdapter();
    return adapter.getTestAssignmentById(id);
  }

  public static async createAssignment(
    data: Omit<TestAssignment, 'id' | 'createdAt' | 'status'>,
    actor: { id: string; name: string; role: any }
  ): Promise<TestAssignment> {
    const adapter = await storageService.getAdapter();
    const id = `assign_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const assignment: TestAssignment = {
      ...data,
      id,
      status: 'active',
      createdAt: Date.now(),
    };

    await adapter.saveTestAssignment(assignment);

    await AuditService.log(
      actor.id,
      actor.name,
      actor.role,
      'ASSIGN_TEST',
      `Assigned test '${assignment.title}' to ${assignment.targetType === 'batch' ? `Batch ${assignment.targetBatchId}` : 'Selected Students'}`,
      assignment.id
    );

    return assignment;
  }

  public static async closeAssignment(
    id: string,
    actor: { id: string; name: string; role: any }
  ): Promise<boolean> {
    const adapter = await storageService.getAdapter();
    const assignment = await adapter.getTestAssignmentById(id);
    if (!assignment) return false;

    assignment.status = 'closed';
    await adapter.saveTestAssignment(assignment);

    await AuditService.log(
      actor.id,
      actor.name,
      actor.role,
      'CLOSE_ASSIGNMENT',
      `Closed test assignment '${assignment.title}'`,
      id
    );

    return true;
  }

  public static async deleteAssignment(
    id: string,
    actor: { id: string; name: string; role: any }
  ): Promise<boolean> {
    const adapter = await storageService.getAdapter();
    const assignment = await adapter.getTestAssignmentById(id);
    if (!assignment) return false;

    await adapter.deleteTestAssignment(id);

    await AuditService.log(
      actor.id,
      actor.name,
      actor.role,
      'DELETE_ASSIGNMENT',
      `Deleted test assignment '${assignment.title}'`,
      id
    );

    return true;
  }

  public static async getSubmissionsForAssignment(
    assignment: TestAssignment
  ): Promise<ExamAttemptRecord[]> {
    const adapter = await storageService.getAdapter();
    const allResults = await adapter.getExamResults();

    return allResults.filter(
      (r) =>
        r.passageId === assignment.passageId ||
        r.presetTitle === assignment.title ||
        r.passageTitle === assignment.passageTitle
    );
  }
}
