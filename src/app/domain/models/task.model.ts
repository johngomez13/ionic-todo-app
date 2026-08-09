export interface Task {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly categoryId: string | null;
}

export function createTask(title: string, categoryId: string | null = null): Task {
  return { id: crypto.randomUUID(), title, completed: false, categoryId };
}

export function toggleCompletion(task: Task): Task {
  return { ...task, completed: !task.completed };
}

export function assignCategory(task: Task, categoryId: string | null): Task {
  return { ...task, categoryId };
}

export function normalizeTitle(title: string): string {
  return title.trim();
}
