import { Category } from '@domain/models/category.model';
import { Task } from '@domain/models/task.model';
import { ALL_CATEGORIES } from '@domain/services/task-filters';

export interface TodoState {
  readonly tasks: readonly Task[];
  readonly categories: readonly Category[];
  readonly categoryFilter: string;
}

export const initialTodoState: TodoState = {
  tasks: [],
  categories: [],
  categoryFilter: ALL_CATEGORIES,
};
