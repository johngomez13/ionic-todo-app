import { Task } from '@domain/models/task.model';
import { buildRemoveLabel, formatPendingLabel, resolveEmptyMessage, toTaskView } from './task-view.helper';

describe('task-view.helper', () => {
  describe('buildRemoveLabel', () => {
    it('should name the task being removed', () => {
      expect(buildRemoveLabel('Comprar pan')).toBe('Eliminar Comprar pan');
    });
  });

  describe('toTaskView', () => {
    it('should keep every field of the task and add the remove label', () => {
      const task: Task = { id: 'a', title: 'Comprar pan', completed: true };

      expect(toTaskView(task)).toEqual({
        id: 'a',
        title: 'Comprar pan',
        completed: true,
        removeLabel: 'Eliminar Comprar pan',
      });
    });

    it('should not mutate the received task', () => {
      const task: Task = { id: 'a', title: 'Comprar pan', completed: false };

      toTaskView(task);

      expect(task).toEqual({ id: 'a', title: 'Comprar pan', completed: false });
    });
  });

  describe('formatPendingLabel', () => {
    it('should use the singular for exactly one pending task', () => {
      expect(formatPendingLabel(1)).toBe('1 pendiente');
    });

    it('should use the plural for zero', () => {
      expect(formatPendingLabel(0)).toBe('0 pendientes');
    });

    it('should use the plural for more than one', () => {
      expect(formatPendingLabel(7)).toBe('7 pendientes');
    });
  });

  describe('resolveEmptyMessage', () => {
    it('should report an empty list when there are no tasks at all', () => {
      expect(resolveEmptyMessage(0, 0)).toBe('No hay tareas todavía.');
    });

    it('should report the filter when there are tasks but none visible', () => {
      expect(resolveEmptyMessage(3, 0)).toBe('No hay tareas que coincidan con el filtro.');
    });

    it('should return null when there is something to render', () => {
      expect(resolveEmptyMessage(3, 2)).toBeNull();
    });
  });
});
