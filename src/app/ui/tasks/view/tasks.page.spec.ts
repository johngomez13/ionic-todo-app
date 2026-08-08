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

  const firstTask = (fixture: ComponentFixture<TasksPage>): Task => {
    const [task] = fixture.componentInstance.tasks();

    return task;
  };

  const titlesOf = (fixture: ComponentFixture<TasksPage>): string[] =>
    fixture.componentInstance.tasks().map((task) => task.title);

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

  it('should add a task as pending', async () => {
    const fixture = await createPage();
    await addTask(fixture, 'Comprar pan');

    expect(titlesOf(fixture)).toEqual(['Comprar pan']);
    expect(firstTask(fixture).completed).toBeFalse();
  });

  it('should ignore titles that are empty or only whitespace', async () => {
    const fixture = await createPage();
    await addTask(fixture, '   ');

    expect(titlesOf(fixture)).toEqual([]);
  });

  it('should trim the title before storing it', async () => {
    const fixture = await createPage();
    await addTask(fixture, '  Comprar pan  ');

    expect(titlesOf(fixture)).toEqual(['Comprar pan']);
  });

  it('should only allow adding when the draft has content', async () => {
    const fixture = await createPage();

    expect(fixture.componentInstance.canAddTask()).toBeFalse();

    fixture.componentInstance.onDraftChange('  ');
    expect(fixture.componentInstance.canAddTask()).toBeFalse();

    fixture.componentInstance.onDraftChange('Comprar pan');
    expect(fixture.componentInstance.canAddTask()).toBeTrue();
  });

  it('should expose a remove label for every task', async () => {
    const fixture = await createPage();
    await addTask(fixture, 'Comprar pan');

    expect(fixture.componentInstance.taskViews().map((view) => view.removeLabel)).toEqual(['Eliminar Comprar pan']);
  });

  it('should toggle completion', async () => {
    const fixture = await createPage();
    await addTask(fixture, 'Comprar pan');

    fixture.componentInstance.toggleTask(firstTask(fixture).id);
    await fixture.whenStable();

    expect(firstTask(fixture).completed).toBeTrue();
  });

  it('should remove a task', async () => {
    const fixture = await createPage();
    await addTask(fixture, 'Comprar pan');

    fixture.componentInstance.removeTask(firstTask(fixture).id);
    await fixture.whenStable();

    expect(titlesOf(fixture)).toEqual([]);
    expect(fixture.componentInstance.isEmpty()).toBeTrue();
  });

  it('should hand every change to the repository', async () => {
    const repository = new InMemoryTaskRepository();
    const fixture = await createPage(repository);
    await addTask(fixture, 'Comprar pan');

    expect(repository.saved.map((task) => task.title)).toEqual(['Comprar pan']);
  });

  it('should start from whatever the repository already had', async () => {
    const stored: Task[] = [{ id: 'a', title: 'Tarea previa', completed: true }];
    const fixture = await createPage(new InMemoryTaskRepository(stored));

    expect(titlesOf(fixture)).toEqual(['Tarea previa']);
    expect(firstTask(fixture).completed).toBeTrue();
  });
});
