import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CATEGORY_REPOSITORY } from '@application/providers/category.provider';
import { TASK_REPOSITORY } from '@application/providers/task.provider';
import { Category } from '@domain/models/category.model';
import { Task } from '@domain/models/task.model';
import { CategoryRepository } from '@domain/repositories/category.repository';
import { TaskRepository } from '@domain/repositories/task.repository';
import TasksPage from './tasks.page';

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
  constructor(private readonly stored: Category[] = []) {}

  public getAll(): Category[] {
    return [...this.stored];
  }

  public save(): void {
    // La persistencia real se prueba en el test del servicio de almacenamiento.
  }
}

describe('TasksPage', () => {
  const casa: Category = { id: 'casa', name: 'Casa', color: '#e11d48' };
  const trabajo: Category = { id: 'trabajo', name: 'Trabajo', color: '#0ea5e9' };

  const createPage = async (
    repository = new InMemoryTaskRepository(),
    categories: Category[] = [],
  ): Promise<ComponentFixture<TasksPage>> => {
    await TestBed.configureTestingModule({
      imports: [TasksPage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: TASK_REPOSITORY, useValue: repository },
        { provide: CATEGORY_REPOSITORY, useValue: new InMemoryCategoryRepository(categories) },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TasksPage);
    await fixture.whenStable();

    return fixture;
  };

  const addTask = async (fixture: ComponentFixture<TasksPage>, title: string): Promise<void> => {
    fixture.componentInstance.startAdding();
    fixture.componentInstance.onDraftChange(title);
    fixture.componentInstance.addTask();
    await fixture.whenStable();
  };

  const pendingTitles = (fixture: ComponentFixture<TasksPage>): string[] =>
    fixture.componentInstance.pendingTasks().map((task) => task.title);

  const completedTitles = (fixture: ComponentFixture<TasksPage>): string[] =>
    fixture.componentInstance.completedTasks().map((task) => task.title);

  it('should create without zone.js', async () => {
    const fixture = await createPage();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render Ionic custom elements', async () => {
    const fixture = await createPage();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('ion-header')).not.toBeNull();
    expect(host.querySelector('ion-content')).not.toBeNull();
    expect(host.querySelector('ion-title')?.textContent).toContain('Tareas');
  });

  it('should keep the add form hidden until it is asked for', async () => {
    const fixture = await createPage();

    expect(fixture.componentInstance.isAdding()).toBeFalse();

    fixture.componentInstance.startAdding();
    await fixture.whenStable();

    expect(fixture.componentInstance.isAdding()).toBeTrue();
  });

  it('should add a task and clear the field without closing the form', async () => {
    const fixture = await createPage();
    await addTask(fixture, 'Comprar pan');

    expect(pendingTitles(fixture)).toEqual(['Comprar pan']);
    expect(fixture.componentInstance.draft()).toBe('');
    expect(fixture.componentInstance.isAdding()).toBeTrue();
  });

  it('should discard the draft when the form is closed', async () => {
    const fixture = await createPage();
    fixture.componentInstance.startAdding();
    fixture.componentInstance.onDraftChange('A medias');
    fixture.componentInstance.cancelAdding();
    await fixture.whenStable();

    expect(fixture.componentInstance.isAdding()).toBeFalse();
    expect(fixture.componentInstance.draft()).toBe('');
    expect(pendingTitles(fixture)).toEqual([]);
  });

  it('should only allow adding when the draft has content', async () => {
    const fixture = await createPage();

    expect(fixture.componentInstance.canAddTask()).toBeFalse();

    fixture.componentInstance.onDraftChange('  ');
    expect(fixture.componentInstance.canAddTask()).toBeFalse();

    fixture.componentInstance.onDraftChange('Comprar pan');
    expect(fixture.componentInstance.canAddTask()).toBeTrue();
  });

  it('should create the task inside the category being viewed', async () => {
    const fixture = await createPage(new InMemoryTaskRepository(), [casa, trabajo]);

    fixture.componentInstance.selectCategory('trabajo');
    await addTask(fixture, 'Informe');

    expect(fixture.componentInstance.pendingTasks()[0].categoryId).toBe('trabajo');
  });

  it('should create the task uncategorized while viewing all or uncategorized', async () => {
    const fixture = await createPage(new InMemoryTaskRepository(), [casa]);

    await addTask(fixture, 'Suelta');
    expect(fixture.componentInstance.pendingTasks()[0].categoryId).toBeNull();

    fixture.componentInstance.selectCategory('none');
    await addTask(fixture, 'Otra suelta');

    expect(fixture.componentInstance.pendingTasks().every((task) => task.categoryId === null)).toBeTrue();
  });

  it('should offer a chip per category with its pending count', async () => {
    const fixture = await createPage(new InMemoryTaskRepository(), [casa, trabajo]);
    fixture.componentInstance.selectCategory('casa');
    await addTask(fixture, 'Una de casa');
    await addTask(fixture, 'Otra de casa');

    const chips = fixture.componentInstance.chips();

    expect(chips.map((chip) => chip.label)).toEqual(['Todas', 'Sin categoría', 'Casa', 'Trabajo']);
    expect(chips.find((chip) => chip.value === 'casa')?.count).toBe(2);
    expect(chips.find((chip) => chip.value === 'trabajo')?.count).toBe(0);
  });

  it('should split pending from completed instead of filtering by status', async () => {
    const fixture = await createPage();
    await addTask(fixture, 'Pendiente');
    await addTask(fixture, 'Hecha');

    fixture.componentInstance.toggleTask(fixture.componentInstance.pendingTasks()[1].id);
    await fixture.whenStable();

    expect(pendingTitles(fixture)).toEqual(['Pendiente']);
    expect(completedTitles(fixture)).toEqual(['Hecha']);
    expect(fixture.componentInstance.hasCompleted()).toBeTrue();
  });

  it('should keep the completed section collapsed until it is opened', async () => {
    const fixture = await createPage();
    await addTask(fixture, 'Hecha');
    fixture.componentInstance.toggleTask(fixture.componentInstance.pendingTasks()[0].id);
    await fixture.whenStable();

    expect(fixture.componentInstance.showCompleted()).toBeFalse();
    expect(fixture.componentInstance.completedLabel()).toBe('1 completada');

    fixture.componentInstance.toggleCompleted();
    expect(fixture.componentInstance.showCompleted()).toBeTrue();
  });

  it('should only repeat the category on each row while viewing all of them', async () => {
    const fixture = await createPage(new InMemoryTaskRepository(), [casa]);

    expect(fixture.componentInstance.showsCategoryOnRow()).toBeTrue();

    fixture.componentInstance.selectCategory('casa');
    await fixture.whenStable();

    expect(fixture.componentInstance.showsCategoryOnRow()).toBeFalse();
  });

  it('should tell an empty app apart from an empty category and from being done', async () => {
    const fixture = await createPage(new InMemoryTaskRepository(), [casa]);

    expect(fixture.componentInstance.emptyMessage()).toBe('No hay tareas todavía.');

    await addTask(fixture, 'Suelta');
    expect(fixture.componentInstance.emptyMessage()).toBeNull();

    fixture.componentInstance.selectCategory('casa');
    await fixture.whenStable();
    expect(fixture.componentInstance.emptyMessage()).toBe('No hay tareas en esta categoría.');

    fixture.componentInstance.selectCategory('all');
    fixture.componentInstance.toggleTask(fixture.componentInstance.pendingTasks()[0].id);
    await fixture.whenStable();
    expect(fixture.componentInstance.emptyMessage()).toBe('Todo listo por aquí.');
  });

  it('should reassign a task and close the assign mode', async () => {
    const fixture = await createPage(new InMemoryTaskRepository(), [casa]);
    await addTask(fixture, 'Suelta');
    const { id } = fixture.componentInstance.pendingTasks()[0];

    fixture.componentInstance.startAssign(id);
    expect(fixture.componentInstance.assigningId()).toBe(id);

    fixture.componentInstance.assignCategory(id, 'casa');
    await fixture.whenStable();

    expect(fixture.componentInstance.assigningId()).toBeNull();
    expect(fixture.componentInstance.pendingTasks()[0].categoryName).toBe('Casa');
  });

  it('should leave the assign mode when the task being assigned is removed', async () => {
    const fixture = await createPage(new InMemoryTaskRepository(), [casa]);
    await addTask(fixture, 'Suelta');
    const { id } = fixture.componentInstance.pendingTasks()[0];

    fixture.componentInstance.startAssign(id);
    fixture.componentInstance.removeTask(id);
    await fixture.whenStable();

    expect(fixture.componentInstance.assigningId()).toBeNull();
    expect(pendingTitles(fixture)).toEqual([]);
  });

  it('should pluralize the pending counter', async () => {
    const fixture = await createPage();

    expect(fixture.componentInstance.pendingLabel()).toBe('0 pendientes');

    await addTask(fixture, 'Una');
    expect(fixture.componentInstance.pendingLabel()).toBe('1 pendiente');

    await addTask(fixture, 'Otra');
    expect(fixture.componentInstance.pendingLabel()).toBe('2 pendientes');
  });

  it('should hand every change to the repository', async () => {
    const repository = new InMemoryTaskRepository();
    const fixture = await createPage(repository);
    await addTask(fixture, 'Comprar pan');

    expect(repository.saved.map((task) => task.title)).toEqual(['Comprar pan']);
  });
});
