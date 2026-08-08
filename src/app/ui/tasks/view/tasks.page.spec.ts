import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import TasksPage, { Task } from './tasks.page';

const STORAGE_KEY = 'todo.tasks';

describe('TasksPage', () => {
  const createPage = async (): Promise<ComponentFixture<TasksPage>> => {
    await TestBed.configureTestingModule({
      imports: [TasksPage],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    const fixture = TestBed.createComponent(TasksPage);
    await fixture.whenStable();

    return fixture;
  };

  const addTask = async (fixture: ComponentFixture<TasksPage>, title: string): Promise<void> => {
    fixture.componentInstance.draft = title;
    fixture.componentInstance.addTask();
    await fixture.whenStable();
  };

  const firstTask = (fixture: ComponentFixture<TasksPage>): Task => {
    const [task] = fixture.componentInstance.tasks();

    return task;
  };

  const titlesOf = (fixture: ComponentFixture<TasksPage>): string[] =>
    fixture.componentInstance.tasks().map((task) => task.title);

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

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
  });

  it('should persist tasks in localStorage', async () => {
    const fixture = await createPage();
    await addTask(fixture, 'Comprar pan');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Task[];

    expect(stored.map((task) => task.title)).toEqual(['Comprar pan']);
  });

  it('should restore tasks persisted by a previous session', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 'a', title: 'Tarea previa', completed: true }]));

    const fixture = await createPage();

    expect(titlesOf(fixture)).toEqual(['Tarea previa']);
    expect(firstTask(fixture).completed).toBeTrue();
  });

  it('should start empty when the stored data is corrupt', async () => {
    localStorage.setItem(STORAGE_KEY, 'esto no es json');

    const fixture = await createPage();

    expect(titlesOf(fixture)).toEqual([]);
  });
});
