import { Task } from '../models/task.model';
import { detachCategory } from './task-rules';

describe('task-rules', () => {
  const task = (id: string, categoryId: string | null): Task => ({
    id,
    title: `Tarea ${id}`,
    completed: false,
    categoryId,
  });

  describe('detachCategory', () => {
    it('should keep the tasks and only clear their category', () => {
      const tasks: Task[] = [task('a', 'casa'), task('b', 'trabajo'), task('c', null)];

      const result = detachCategory(tasks, 'casa');

      expect(result).toHaveSize(3);
      expect(result.map((item) => item.categoryId)).toEqual([null, 'trabajo', null]);
    });

    it('should leave the list untouched when nobody uses that category', () => {
      const tasks: Task[] = [task('a', 'casa')];

      expect(detachCategory(tasks, 'ocio')).toEqual(tasks);
    });

    it('should not mutate the original tasks', () => {
      const original = task('a', 'casa');

      detachCategory([original], 'casa');

      expect(original.categoryId).toBe('casa');
    });
  });
});
