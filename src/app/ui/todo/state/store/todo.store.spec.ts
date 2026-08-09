import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CATEGORY_REPOSITORY } from '@application/providers/category.provider';
import { TASK_REPOSITORY } from '@application/providers/task.provider';
import { Category } from '@domain/models/category.model';
import { Task } from '@domain/models/task.model';
import { CategoryRepository } from '@domain/repositories/category.repository';
import { TaskRepository } from '@domain/repositories/task.repository';
import { TodoStore } from './todo.store';

class InMemoryTaskRepository implements TaskRepository {
  public saved: Task[] = [];

  constructor(private readonly stored: Task[] = []) {}

  public getAll(): Task[] {
    return [...this.stored];
  }

  public save(tasks: readonly Task[]): void {
    this.saved = [...tasks];
  }
}

class InMemoryCategoryRepository implements CategoryRepository {
  public saved: Category[] = [];

  constructor(private readonly stored: Category[] = []) {}

  public getAll(): Category[] {
    return [...this.stored];
  }

  public save(categories: readonly Category[]): void {
    this.saved = [...categories];
  }
}

describe('TodoStore', () => {
  const setup = (
    taskRepository = new InMemoryTaskRepository(),
    categoryRepository = new InMemoryCategoryRepository(),
  ): { store: InstanceType<typeof TodoStore> } => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: TASK_REPOSITORY, useValue: taskRepository },
        { provide: CATEGORY_REPOSITORY, useValue: categoryRepository },
      ],
    });

    return { store: TestBed.inject(TodoStore) };
  };

  const flush = (): void => {
    TestBed.inject(ApplicationRef).tick();
  };

  describe('tareas', () => {
    it('should start from what the repository already had', () => {
      const stored: Task[] = [{ id: 'a', title: 'Tarea previa', completed: true, categoryId: null }];
      const { store } = setup(new InMemoryTaskRepository(stored));

      expect(store.tasks().map((task) => task.title)).toEqual(['Tarea previa']);
    });

    it('should add a task as pending', () => {
      const { store } = setup();

      store.addTask('Comprar pan');

      expect(store.tasks().map((task) => task.title)).toEqual(['Comprar pan']);
      expect(store.pendingCount()).toBe(1);
    });

    it('should trim the title and reject empty ones', () => {
      const { store } = setup();

      store.addTask('  Comprar pan  ');
      store.addTask('   ');

      expect(store.tasks().map((task) => task.title)).toEqual(['Comprar pan']);
    });

    it('should toggle completion without mutating the previous task', () => {
      const { store } = setup();
      store.addTask('Comprar pan');
      const before = store.tasks()[0];

      store.toggleTask(before.id);

      expect(store.tasks()[0].completed).toBeTrue();
      expect(before.completed).toBeFalse();
    });

    it('should remove a task', () => {
      const { store } = setup();
      store.addTask('Comprar pan');

      store.removeTask(store.tasks()[0].id);

      expect(store.tasks()).toEqual([]);
    });
  });

  describe('categorías', () => {
    it('should add a category with its colour', () => {
      const { store } = setup();

      store.addCategory('Casa', '#16a34a');

      expect(store.categories()).toEqual([jasmine.objectContaining({ name: 'Casa', color: '#16a34a' })]);
      expect(store.categoryCount()).toBe(1);
    });

    it('should reject a duplicate name regardless of case', () => {
      const { store } = setup();

      store.addCategory('Casa', '#16a34a');
      store.addCategory('casa', '#0ea5e9');

      expect(store.categoryCount()).toBe(1);
    });

    it('should rename a category, including to the name it already had', () => {
      const { store } = setup();
      store.addCategory('Casa', '#16a34a');
      const { id } = store.categories()[0];

      store.renameCategory(id, 'Hogar');
      expect(store.categoryNames()).toEqual(['Hogar']);

      store.renameCategory(id, 'Hogar');
      expect(store.categoryNames()).toEqual(['Hogar']);
    });

    it('should reject renaming onto another existing name', () => {
      const { store } = setup();
      store.addCategory('Casa', '#16a34a');
      store.addCategory('Trabajo', '#0ea5e9');

      store.renameCategory(store.categories()[0].id, 'Trabajo');

      expect(store.categoryNames()).toEqual(['Casa', 'Trabajo']);
    });
  });

  describe('la invariante entre ambos', () => {
    it('should orphan the tasks of a removed category instead of deleting them', () => {
      const { store } = setup();
      store.addCategory('Casa', '#16a34a');
      store.addCategory('Trabajo', '#0ea5e9');
      const [casa, trabajo] = store.categories();
      store.addTask('De casa', casa.id);
      store.addTask('De trabajo', trabajo.id);

      store.removeCategory(casa.id);

      expect(store.categoryNames()).toEqual(['Trabajo']);
      expect(store.tasks()).toHaveSize(2);
      expect(store.tasks().map((task) => task.categoryId)).toEqual([null, trabajo.id]);
    });

    it('should assign a category to a task and let it be cleared again', () => {
      const { store } = setup();
      store.addTask('Comprar pan');
      const { id } = store.tasks()[0];

      store.assignCategory(id, 'casa');
      expect(store.tasks()[0].categoryId).toBe('casa');

      store.assignCategory(id, null);
      expect(store.tasks()[0].categoryId).toBeNull();
    });

    it('should narrow the visible list to the active category', () => {
      const { store } = setup();
      store.addTask('De casa', 'casa');
      store.addTask('De trabajo', 'trabajo');
      store.addTask('Suelta');

      store.setCategoryFilter('casa');
      expect(store.visibleTasks().map((task) => task.title)).toEqual(['De casa']);

      store.setCategoryFilter('none');
      expect(store.visibleTasks().map((task) => task.title)).toEqual(['Suelta']);

      store.setCategoryFilter('all');
      expect(store.visibleTasks()).toHaveSize(3);
    });

    it('should count pending tasks per category, and the total under "all"', () => {
      const { store } = setup();
      store.addTask('Una de casa', 'casa');
      store.addTask('Otra de casa', 'casa');
      store.addTask('Suelta');
      store.toggleTask(store.tasks()[1].id);

      const counts = store.pendingByCategory();

      expect(counts.get('all')).toBe(2);
      expect(counts.get('casa')).toBe(1);
      expect(counts.get('none')).toBe(1);
    });
  });

  describe('persistencia', () => {
    it('should hand tasks and categories to their own repositories', () => {
      const taskRepository = new InMemoryTaskRepository();
      const categoryRepository = new InMemoryCategoryRepository();
      const { store } = setup(taskRepository, categoryRepository);

      store.addTask('Comprar pan');
      store.addCategory('Casa', '#16a34a');
      flush();

      expect(taskRepository.saved.map((task) => task.title)).toEqual(['Comprar pan']);
      expect(categoryRepository.saved.map((category) => category.name)).toEqual(['Casa']);
    });

    it('should not persist the filter, which is view state and not data', () => {
      const taskRepository = new InMemoryTaskRepository();
      const { store } = setup(taskRepository);
      store.addTask('Comprar pan');
      flush();

      const afterAdd = taskRepository.saved;
      store.setCategoryFilter('none');
      flush();

      expect(taskRepository.saved).toEqual(afterAdd);
    });
  });
});
