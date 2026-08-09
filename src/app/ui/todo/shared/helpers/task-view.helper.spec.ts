import { Category } from '@domain/models/category.model';
import { Task } from '@domain/models/task.model';
import {
  buildCategoryAssignOptions,
  buildCategoryChips,
  completedOf,
  formatCompletedLabel,
  formatPendingLabel,
  indexCategoriesById,
  pendingOf,
  resolveEmptyMessage,
  toTaskViews,
} from './task-view.helper';

describe('task-view.helper', () => {
  const categories: Category[] = [
    { id: 'casa', name: 'Casa', color: '#e11d48' },
    { id: 'trabajo', name: 'Trabajo', color: '#0ea5e9' },
  ];

  const task = (id: string, categoryId: string | null, completed = false): Task => ({
    id,
    title: `Tarea ${id}`,
    completed,
    categoryId,
  });

  describe('indexCategoriesById', () => {
    it('should index every category by its identifier', () => {
      const index = indexCategoriesById(categories);

      expect(index.size).toBe(2);
      expect(index.get('casa')?.name).toBe('Casa');
    });
  });

  describe('toTaskViews', () => {
    it('should resolve the name and colour of the category', () => {
      const [view] = toTaskViews([task('a', 'casa')], categories);

      expect(view.categoryName).toBe('Casa');
      expect(view.categoryColor).toBe('#e11d48');
    });

    it('should leave both empty for an uncategorized task', () => {
      const [view] = toTaskViews([task('a', null)], categories);

      expect(view.categoryName).toBeNull();
      expect(view.categoryColor).toBeNull();
    });

    it('should survive a task pointing at a category that no longer exists', () => {
      const [view] = toTaskViews([task('a', 'borrada')], categories);

      expect(view.categoryName).toBeNull();
    });

    it('should build both accessible labels', () => {
      const [view] = toTaskViews([task('a', null)], categories);

      expect(view.removeLabel).toBe('Eliminar Tarea a');
      expect(view.assignLabel).toBe('Asignar categoría a Tarea a');
    });
  });

  describe('pendingOf / completedOf', () => {
    const tasks = [task('a', null), task('b', null, true), task('c', null)];

    it('should split the list without losing anything', () => {
      expect(pendingOf(tasks).map((item) => item.id)).toEqual(['a', 'c']);
      expect(completedOf(tasks).map((item) => item.id)).toEqual(['b']);
    });
  });

  describe('etiquetas', () => {
    it('should use the singular for exactly one', () => {
      expect(formatPendingLabel(1)).toBe('1 pendiente');
      expect(formatCompletedLabel(1)).toBe('1 completada');
    });

    it('should use the plural for zero and for many', () => {
      expect(formatPendingLabel(0)).toBe('0 pendientes');
      expect(formatCompletedLabel(4)).toBe('4 completadas');
    });
  });

  describe('resolveEmptyMessage', () => {
    it('should tell an empty app apart from an empty category', () => {
      expect(resolveEmptyMessage(0, 0, 0)).toBe('No hay tareas todavía.');
      expect(resolveEmptyMessage(5, 0, 0)).toBe('No hay tareas en esta categoría.');
    });

    it('should celebrate when everything visible is done', () => {
      expect(resolveEmptyMessage(5, 0, 3)).toBe('Todo listo por aquí.');
    });

    it('should stay silent when there is something pending to show', () => {
      expect(resolveEmptyMessage(5, 2, 3)).toBeNull();
    });
  });

  describe('buildCategoryChips', () => {
    const counts = new Map<string, number>([
      ['all', 5],
      ['none', 2],
      ['casa', 3],
    ]);

    it('should offer all and uncategorized before the real categories', () => {
      expect(buildCategoryChips(categories, counts).map((chip) => chip.value)).toEqual([
        'all',
        'none',
        'casa',
        'trabajo',
      ]);
    });

    it('should carry the pending count of each chip', () => {
      const chips = buildCategoryChips(categories, counts);

      expect(chips.map((chip) => chip.count)).toEqual([5, 2, 3, 0]);
    });

    it('should give every chip an accessible label', () => {
      const chips = buildCategoryChips(categories, counts);

      expect(chips[2].selectLabel).toBe('Ver Casa');
    });

    it('should only colour the chips that are a real category', () => {
      const chips = buildCategoryChips(categories, counts);

      expect(chips[0].color).toBeNull();
      expect(chips[1].color).toBeNull();
      expect(chips[2].color).toBe('#e11d48');
    });
  });

  describe('buildCategoryAssignOptions', () => {
    it('should not offer "all", because a task has one category or none', () => {
      expect(buildCategoryAssignOptions(categories).map((option) => option.value)).toEqual(['none', 'casa', 'trabajo']);
    });
  });
});
