import { Task } from '../models/task.model';
import { countPending, filterTasksByStatus } from './task-filters';

describe('task-filters', () => {
  const task = (id: string, completed: boolean): Task => ({ id, title: `Tarea ${id}`, completed });

  const tasks: Task[] = [task('a', false), task('b', true), task('c', false)];

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

    it('should handle an empty list', () => {
      expect(filterTasksByStatus([], 'pending')).toEqual([]);
    });
  });

  describe('countPending', () => {
    it('should count only the tasks that are not completed', () => {
      expect(countPending(tasks)).toBe(2);
    });

    it('should return zero for an empty list', () => {
      expect(countPending([])).toBe(0);
    });

    it('should return zero when everything is completed', () => {
      expect(countPending([task('a', true)])).toBe(0);
    });
  });
});
