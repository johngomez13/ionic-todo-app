import { Task } from '../models/task.model';
import {
  ALL_CATEGORIES,
  WITHOUT_CATEGORY,
  countPending,
  filterTasks,
  filterTasksByCategory,
  filterTasksByStatus,
} from './task-filters';

describe('task-filters', () => {
  const task = (id: string, completed: boolean, categoryId: string | null = null): Task => ({
    id,
    title: `Tarea ${id}`,
    completed,
    categoryId,
  });

  const tasks: Task[] = [task('a', false, 'casa'), task('b', true, 'casa'), task('c', false, null)];

  describe('filterTasksByStatus', () => {
    it('should return every task when the filter is "all"', () => {
      expect(filterTasksByStatus(tasks, 'all').map((item) => item.id)).toEqual(['a', 'b', 'c']);
    });

    it('should return only pending tasks', () => {
      expect(filterTasksByStatus(tasks, 'pending').map((item) => item.id)).toEqual(['a', 'c']);
    });

    it('should return only completed tasks', () => {
      expect(filterTasksByStatus(tasks, 'completed').map((item) => item.id)).toEqual(['b']);
    });

    it('should not mutate the received list', () => {
      const original = [...tasks];

      filterTasksByStatus(tasks, 'pending');

      expect(tasks).toEqual(original);
    });
  });

  describe('filterTasksByCategory', () => {
    it('should return every task for ALL_CATEGORIES', () => {
      expect(filterTasksByCategory(tasks, ALL_CATEGORIES).map((item) => item.id)).toEqual(['a', 'b', 'c']);
    });

    it('should return only uncategorized tasks for WITHOUT_CATEGORY', () => {
      expect(filterTasksByCategory(tasks, WITHOUT_CATEGORY).map((item) => item.id)).toEqual(['c']);
    });

    it('should return only the tasks of a given category', () => {
      expect(filterTasksByCategory(tasks, 'casa').map((item) => item.id)).toEqual(['a', 'b']);
    });

    it('should return nothing for a category nobody uses', () => {
      expect(filterTasksByCategory(tasks, 'trabajo')).toEqual([]);
    });
  });

  describe('filterTasks', () => {
    it('should combine both filters', () => {
      expect(filterTasks(tasks, 'pending', 'casa').map((item) => item.id)).toEqual(['a']);
      expect(filterTasks(tasks, 'completed', 'casa').map((item) => item.id)).toEqual(['b']);
    });

    it('should return nothing when the two filters exclude each other', () => {
      expect(filterTasks(tasks, 'completed', WITHOUT_CATEGORY)).toEqual([]);
    });

    it('should behave like no filter at all when both are permissive', () => {
      expect(filterTasks(tasks, 'all', ALL_CATEGORIES).map((item) => item.id)).toEqual(['a', 'b', 'c']);
    });
  });

  describe('countPending', () => {
    it('should count only the tasks that are not completed', () => {
      expect(countPending(tasks)).toBe(2);
    });

    it('should return zero for an empty list', () => {
      expect(countPending([])).toBe(0);
    });
  });
});
