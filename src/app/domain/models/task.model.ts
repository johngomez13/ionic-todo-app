export interface Task {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
}

export function createTask(title: string): Task {
  return { id: crypto.randomUUID(), title, completed: false };
}

export function toggleCompletion(task: Task): Task {
  return { ...task, completed: !task.completed };
}

export function normalizeTitle(title: string): string {
  return title.trim();
}
