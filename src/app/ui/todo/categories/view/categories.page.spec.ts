import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CATEGORY_REPOSITORY } from '@application/providers/category.provider';
import { TASK_REPOSITORY } from '@application/providers/task.provider';
import { Category } from '@domain/models/category.model';
import { Task } from '@domain/models/task.model';
import { CategoryRepository } from '@domain/repositories/category.repository';
import { TaskRepository } from '@domain/repositories/task.repository';
import CategoriesPage from './categories.page';

class InMemoryTaskRepository implements TaskRepository {
  public getAll(): Task[] {
    return [];
  }

  public save(): void {
    // Las tareas no son el objeto de estas pruebas.
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

describe('CategoriesPage', () => {
  const createPage = async (
    repository = new InMemoryCategoryRepository(),
  ): Promise<ComponentFixture<CategoriesPage>> => {
    await TestBed.configureTestingModule({
      imports: [CategoriesPage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: CATEGORY_REPOSITORY, useValue: repository },
        { provide: TASK_REPOSITORY, useValue: new InMemoryTaskRepository() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CategoriesPage);
    await fixture.whenStable();

    return fixture;
  };

  const addCategory = async (fixture: ComponentFixture<CategoriesPage>, name: string): Promise<void> => {
    fixture.componentInstance.onDraftNameChange(name);
    fixture.componentInstance.addCategory();
    await fixture.whenStable();
  };

  const namesOf = (fixture: ComponentFixture<CategoriesPage>): string[] =>
    fixture.componentInstance.categories().map((category) => category.name);

  it('should create without zone.js', async () => {
    const fixture = await createPage();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render Ionic custom elements', async () => {
    const fixture = await createPage();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('ion-header')).not.toBeNull();
    expect(host.querySelector('ion-title')?.textContent).toContain('Categorías');
  });

  it('should add a category and clear the field', async () => {
    const fixture = await createPage();
    await addCategory(fixture, 'Casa');

    expect(namesOf(fixture)).toEqual(['Casa']);
    expect(fixture.componentInstance.draftName()).toBe('');
  });

  it('should block adding a duplicate and explain why', async () => {
    const fixture = await createPage();
    await addCategory(fixture, 'Casa');

    fixture.componentInstance.onDraftNameChange('casa');
    await fixture.whenStable();

    expect(fixture.componentInstance.nameError()).toBe('Ya existe una categoría con ese nombre.');
    expect(fixture.componentInstance.canAddCategory()).toBeFalse();
  });

  it('should stay silent while the field is empty', async () => {
    const fixture = await createPage();

    expect(fixture.componentInstance.nameError()).toBeNull();
    expect(fixture.componentInstance.canAddCategory()).toBeFalse();
  });

  it('should show the empty message only when there are no categories', async () => {
    const fixture = await createPage();

    expect(fixture.componentInstance.emptyMessage()).toBe('No hay categorías todavía.');

    await addCategory(fixture, 'Casa');

    expect(fixture.componentInstance.emptyMessage()).toBeNull();
  });

  it('should rename a category through the edit flow', async () => {
    const fixture = await createPage();
    await addCategory(fixture, 'Casa');

    const [category] = fixture.componentInstance.categories();
    fixture.componentInstance.startRename(category);

    expect(fixture.componentInstance.editingId()).toBe(category.id);
    expect(fixture.componentInstance.editingName()).toBe('Casa');

    fixture.componentInstance.onEditingNameChange('Hogar');
    fixture.componentInstance.confirmRename();
    await fixture.whenStable();

    expect(namesOf(fixture)).toEqual(['Hogar']);
    expect(fixture.componentInstance.editingId()).toBeNull();
  });

  it('should not allow confirming a rename onto another existing name', async () => {
    const fixture = await createPage();
    await addCategory(fixture, 'Casa');
    await addCategory(fixture, 'Trabajo');

    fixture.componentInstance.startRename(fixture.componentInstance.categories()[0]);
    fixture.componentInstance.onEditingNameChange('Trabajo');
    await fixture.whenStable();

    expect(fixture.componentInstance.editingError()).toBe('Ya existe una categoría con ese nombre.');
    expect(fixture.componentInstance.canConfirmRename()).toBeFalse();
  });

  it('should discard the edit when cancelled', async () => {
    const fixture = await createPage();
    await addCategory(fixture, 'Casa');

    fixture.componentInstance.startRename(fixture.componentInstance.categories()[0]);
    fixture.componentInstance.onEditingNameChange('Hogar');
    fixture.componentInstance.cancelRename();
    await fixture.whenStable();

    expect(namesOf(fixture)).toEqual(['Casa']);
    expect(fixture.componentInstance.editingId()).toBeNull();
  });

  it('should leave edit mode when the category being edited is removed', async () => {
    const fixture = await createPage();
    await addCategory(fixture, 'Casa');

    const [category] = fixture.componentInstance.categories();
    fixture.componentInstance.startRename(category);
    fixture.componentInstance.removeCategory(category.id);
    await fixture.whenStable();

    expect(namesOf(fixture)).toEqual([]);
    expect(fixture.componentInstance.editingId()).toBeNull();
  });
});
