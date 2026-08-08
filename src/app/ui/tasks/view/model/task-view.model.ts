import { Task } from '@domain/models/task.model';

export interface TaskView extends Task {
  readonly removeLabel: string;
}
