import { Task } from '../models/task.model';

export type TaskStatusFilter = 'all' | 'pending' | 'completed';

export const ALL_CATEGORIES = 'all';

export const WITHOUT_CATEGORY = 'none';

export function filterTasksByStatus(tasks: readonly Task[], filter: TaskStatusFilter): Task[] {
  if (filter === 'all') return [...tasks];

  const wantsCompleted = filter === 'completed';

  return tasks.filter((task) => task.completed === wantsCompleted);
}

export function filterTasksByCategory(tasks: readonly Task[], filter: string): Task[] {
  if (filter === ALL_CATEGORIES) return [...tasks];

  if (filter === WITHOUT_CATEGORY) return tasks.filter((task) => task.categoryId === null);

  return tasks.filter((task) => task.categoryId === filter);
}

export function filterTasks(tasks: readonly Task[], status: TaskStatusFilter, category: string): Task[] {
  return filterTasksByCategory(filterTasksByStatus(tasks, status), category);
}

export function countPendingByCategory(tasks: readonly Task[]): Map<string, number> {
  const counts = new Map<string, number>();
  const pending = tasks.filter((task) => !task.completed);

  counts.set(ALL_CATEGORIES, pending.length);

  for (const task of pending) {
    const key = task.categoryId ?? WITHOUT_CATEGORY;

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

export function countPending(tasks: readonly Task[]): number {
  return tasks.reduce((total, task) => (task.completed ? total : total + 1), 0);
}
