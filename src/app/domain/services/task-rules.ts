import { Task, assignCategory } from '../models/task.model';

export function detachCategory(tasks: readonly Task[], categoryId: string): Task[] {
  return tasks.map((task) => (task.categoryId === categoryId ? assignCategory(task, null) : task));
}
