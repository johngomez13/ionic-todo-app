import { Task } from '../models/task.model';

export interface TaskRepository {
  getAll(): Task[];
  save(tasks: readonly Task[]): void;
}
