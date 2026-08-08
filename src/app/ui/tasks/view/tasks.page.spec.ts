import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TASK_REPOSITORY } from '@application/providers/task.provider';
import { Task } from '@domain/models/task.model';
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

describe('TasksPage', () => {
  const createPage = async (repository = new InMemoryTaskRepository()): Promise<ComponentFixture<TasksPage>> => {
    await TestBed.configureTestingModule({
      imports: [TasksPage],
      providers: [provideZonelessChangeDetection(), { provide: TASK_REPOSITORY, useValue: repository }],
    }).compileComponents();

    const fixture = TestBed.createComponent(TasksPage);
    await fixture.whenStable();

    return fixture;
  };

  const addTask = async (fixture: ComponentFixture<TasksPage>, title: string): Promise<void> => {
    fixture.componentInstance.onDraftChange(title);
    fixture.componentInstance.addTask();
    await fixture.whenStable();
  };

  const titlesOf = (fixture: ComponentFixture<TasksPage>): string[] =>
    fixture.componentInstance.visibleTasks().map((task) => task.title);

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

  it('should add a task and clear the draft', async () => {
    const fixture = await createPage();
    await addTask(fixture, 'Comprar pan');

    expect(titlesOf(fixture)).toEqual(['Comprar pan']);
    expect(fixture.componentInstance.draft()).toBe('');
  });

  it('should only allow adding when the draft has content', async () => {
    const fixture = await createPage();

    expect(fixture.componentInstance.canAddTask()).toBeFalse();

    fixture.componentInstance.onDraftChange('  ');
    expect(fixture.componentInstance.canAddTask()).toBeFalse();

    fixture.componentInstance.onDraftChange('Comprar pan');
    expect(fixture.componentInstance.canAddTask()).toBeTrue();
  });

  it('should expose a remove label for every visible task', async () => {
    const fixture = await createPage();
    await addTask(fixture, 'Comprar pan');

    expect(fixture.componentInstance.visibleTasks().map((view) => view.removeLabel)).toEqual(['Eliminar Comprar pan']);
  });

  it('should show a different message when the list is empty than when the filter hides everything', async () => {
    const fixture = await createPage();

    expect(fixture.componentInstance.emptyMessage()).toBe('No hay tareas todavía.');

    await addTask(fixture, 'Comprar pan');
    expect(fixture.componentInstance.emptyMessage()).toBeNull();

    fixture.componentInstance.setStatusFilter('completed');
    await fixture.whenStable();

    expect(fixture.componentInstance.emptyMessage()).toBe('No hay tareas que coincidan con el filtro.');
  });

  it('should pluralize the pending counter', async () => {
    const fixture = await createPage();

    expect(fixture.componentInstance.pendingLabel()).toBe('0 pendientes');

    await addTask(fixture, 'Una');
    expect(fixture.componentInstance.pendingLabel()).toBe('1 pendiente');

    await addTask(fixture, 'Otra');
    expect(fixture.componentInstance.pendingLabel()).toBe('2 pendientes');
  });

  it('should filter the visible list', async () => {
    const fixture = await createPage();
    await addTask(fixture, 'Pendiente');
    await addTask(fixture, 'Hecha');

    const done = fixture.componentInstance.visibleTasks()[1];
    fixture.componentInstance.toggleTask(done.id);
    await fixture.whenStable();

    fixture.componentInstance.setStatusFilter('pending');
    await fixture.whenStable();

    expect(titlesOf(fixture)).toEqual(['Pendiente']);
  });

  it('should remove a task', async () => {
    const fixture = await createPage();
    await addTask(fixture, 'Comprar pan');

    fixture.componentInstance.removeTask(fixture.componentInstance.visibleTasks()[0].id);
    await fixture.whenStable();

    expect(titlesOf(fixture)).toEqual([]);
  });
});
