import { Task } from '@domain/models/task.model';
import { TaskView } from '@ui/tasks/view/model/task-view.model';

const EMPTY_LIST_MESSAGE = 'No hay tareas todavía.';
const FILTERED_OUT_MESSAGE = 'No hay tareas que coincidan con el filtro.';

export const buildRemoveLabel = (title: string): string => `Eliminar ${title}`;

export const toTaskView = (task: Task): TaskView => ({ ...task, removeLabel: buildRemoveLabel(task.title) });

export const formatPendingLabel = (pending: number): string =>
  pending === 1 ? '1 pendiente' : `${pending} pendientes`;

export const resolveEmptyMessage = (totalTasks: number, visibleTasks: number): string | null => {
  if (totalTasks === 0) return EMPTY_LIST_MESSAGE;

  if (visibleTasks === 0) return FILTERED_OUT_MESSAGE;

  return null;
};
