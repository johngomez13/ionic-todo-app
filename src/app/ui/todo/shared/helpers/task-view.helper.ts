import { Category } from '@domain/models/category.model';
import { Task } from '@domain/models/task.model';
import { ALL_CATEGORIES, WITHOUT_CATEGORY, filterTasksByStatus } from '@domain/services/task-filters';
import { CategoryChip, CategoryOption, TaskView } from '@ui/todo/shared/models/task-view.model';

const EMPTY_LIST_MESSAGE = 'No hay tareas todavía.';
const EMPTY_CATEGORY_MESSAGE = 'No hay tareas en esta categoría.';
const ALL_DONE_MESSAGE = 'Todo listo por aquí.';

const ALL_CATEGORIES_LABEL = 'Todas';
const NO_CATEGORY_LABEL = 'Sin categoría';

export const buildRemoveLabel = (title: string): string => `Eliminar ${title}`;

export const buildAssignLabel = (title: string): string => `Asignar categoría a ${title}`;

export const indexCategoriesById = (categories: readonly Category[]): Map<string, Category> =>
  new Map(categories.map((category) => [category.id, category]));

export const toTaskView = (task: Task, categories: Map<string, Category>): TaskView => {
  const category = task.categoryId === null ? undefined : categories.get(task.categoryId);

  return {
    ...task,
    removeLabel: buildRemoveLabel(task.title),
    assignLabel: buildAssignLabel(task.title),
    categoryName: category?.name ?? null,
    categoryColor: category?.color ?? null,
  };
};

export const toTaskViews = (tasks: readonly Task[], categories: readonly Category[]): TaskView[] => {
  const index = indexCategoriesById(categories);

  return tasks.map((task) => toTaskView(task, index));
};

export const pendingOf = (tasks: readonly Task[]): Task[] => filterTasksByStatus(tasks, 'pending');

export const completedOf = (tasks: readonly Task[]): Task[] => filterTasksByStatus(tasks, 'completed');

export const formatPendingLabel = (pending: number): string =>
  pending === 1 ? '1 pendiente' : `${pending} pendientes`;

export const formatCompletedLabel = (completed: number): string =>
  completed === 1 ? '1 completada' : `${completed} completadas`;

export const resolveEmptyMessage = (total: number, pending: number, completed: number): string | null => {
  if (total === 0) return EMPTY_LIST_MESSAGE;

  if (pending === 0 && completed === 0) return EMPTY_CATEGORY_MESSAGE;

  if (pending === 0) return ALL_DONE_MESSAGE;

  return null;
};

export const buildCategoryChips = (
  categories: readonly Category[],
  pendingByCategory: Map<string, number>,
): CategoryChip[] => [
  {
    value: ALL_CATEGORIES,
    label: ALL_CATEGORIES_LABEL,
    color: null,
    count: pendingByCategory.get(ALL_CATEGORIES) ?? 0,
    selectLabel: `Ver todas`,
  },
  {
    value: WITHOUT_CATEGORY,
    label: NO_CATEGORY_LABEL,
    color: null,
    count: pendingByCategory.get(WITHOUT_CATEGORY) ?? 0,
    selectLabel: `Ver tareas sin categoría`,
  },
  ...categories.map((category) => ({
    value: category.id,
    label: category.name,
    color: category.color,
    count: pendingByCategory.get(category.id) ?? 0,
    selectLabel: `Ver ${category.name}`,
  })),
];

export const buildCategoryAssignOptions = (categories: readonly Category[]): CategoryOption[] => [
  { value: WITHOUT_CATEGORY, label: NO_CATEGORY_LABEL, color: null },
  ...categories.map((category) => ({ value: category.id, label: category.name, color: category.color })),
];
