import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TASK_REPOSITORY } from '@application/providers/task.provider';
import { Task } from '@domain/models/task.model';
import { TaskRepository } from '@domain/repositories/task.repository';
import { TaskStore } from './task.store';

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

describe('TaskStore', () => {
  const setup = (repository = new InMemoryTaskRepository()): { store: InstanceType<typeof TaskStore> } => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: TASK_REPOSITORY, useValue: repository }],
    });

    return { store: TestBed.inject(TaskStore) };
  };

  const flush = (): void => {
    TestBed.inject(ApplicationRef).tick();
  };

  it('should start from what the repository already had', () => {
    const stored: Task[] = [{ id: 'a', title: 'Tarea previa', completed: true }];
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

  it('should derive the visible list from the status filter', () => {
    const { store } = setup();
    store.addTask('Pendiente');
    store.addTask('Hecha');
    store.toggleTask(store.tasks()[1].id);

    expect(store.visibleTasks().map((task) => task.title)).toEqual(['Pendiente', 'Hecha']);

    store.setStatusFilter('pending');
    expect(store.visibleTasks().map((task) => task.title)).toEqual(['Pendiente']);

    store.setStatusFilter('completed');
    expect(store.visibleTasks().map((task) => task.title)).toEqual(['Hecha']);
  });

  it('should keep pendingCount in sync with completion', () => {
    const { store } = setup();
    store.addTask('Una');
    store.addTask('Otra');

    expect(store.pendingCount()).toBe(2);

    store.toggleTask(store.tasks()[0].id);

    expect(store.pendingCount()).toBe(1);
  });

  it('should persist through the repository on every change', () => {
    const repository = new InMemoryTaskRepository();
    const { store } = setup(repository);

    store.addTask('Comprar pan');
    flush();

    expect(repository.saved.map((task) => task.title)).toEqual(['Comprar pan']);

    store.removeTask(store.tasks()[0].id);
    flush();

    expect(repository.saved).toEqual([]);
  });

  it('should not persist the filter, which is view state and not data', () => {
    const repository = new InMemoryTaskRepository();
    const { store } = setup(repository);
    store.addTask('Comprar pan');
    flush();

    const afterAdd = repository.saved;
    store.setStatusFilter('completed');
    flush();

    expect(repository.saved).toEqual(afterAdd);
  });
});
