import { Task } from '../models/task.model';

export type TaskStatusFilter = 'all' | 'pending' | 'completed';

export function filterTasksByStatus(tasks: readonly Task[], filter: TaskStatusFilter): Task[] {
  if (filter === 'all') return [...tasks];

  const wantsCompleted = filter === 'completed';

  return tasks.filter((task) => task.completed === wantsCompleted);
}

export function countPending(tasks: readonly Task[]): number {
  return tasks.reduce((total, task) => (task.completed ? total : total + 1), 0);
}
