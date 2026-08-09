import { Task } from '@domain/models/task.model';

export interface TaskView extends Task {
  readonly removeLabel: string;
  readonly assignLabel: string;
  readonly categoryName: string | null;
  readonly categoryColor: string | null;
}

export interface CategoryOption {
  readonly value: string;
  readonly label: string;
  readonly color: string | null;
}

export interface CategoryChip extends CategoryOption {
  readonly count: number;
  readonly selectLabel: string;
}
