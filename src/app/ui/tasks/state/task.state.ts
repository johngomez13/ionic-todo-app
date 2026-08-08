import { Task } from '@domain/models/task.model';
import { TaskStatusFilter } from '@domain/services/task-filters';

export interface TaskState {
  readonly tasks: readonly Task[];
  readonly statusFilter: TaskStatusFilter;
}

export const initialTaskState: TaskState = {
  tasks: [],
  statusFilter: 'all',
};
