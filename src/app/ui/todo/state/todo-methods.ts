import { StateSignals, WritableStateSource, patchState } from '@ngrx/signals';
import { createCategory, normalizeCategoryName, renameCategory } from '@domain/models/category.model';
import { assignCategory, createTask, normalizeTitle, toggleCompletion } from '@domain/models/task.model';
import { isDuplicateCategoryName } from '@domain/services/category-rules';
import { detachCategory } from '@domain/services/task-rules';
import { TodoState } from './todo.state';

export type TodoStoreSource = StateSignals<TodoState> & WritableStateSource<TodoState>;

export type TodoMethods = {
  addTask(rawTitle: string, categoryId?: string | null): void;
  toggleTask(id: string): void;
  removeTask(id: string): void;
  assignCategory(id: string, categoryId: string | null): void;
  addCategory(rawName: string, color: string): void;
  renameCategory(id: string, rawName: string): void;
  removeCategory(id: string): void;
  setCategoryFilter(categoryFilter: string): void;
};

export const buildTodoMethods = (store: TodoStoreSource): TodoMethods => ({
  addTask(rawTitle: string, categoryId: string | null = null): void {
    const title = normalizeTitle(rawTitle);

    if (title.length === 0) return;

    patchState(store, (state) => ({ tasks: [...state.tasks, createTask(title, categoryId)] }));
  },

  toggleTask(id: string): void {
    patchState(store, (state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? toggleCompletion(task) : task)),
    }));
  },

  removeTask(id: string): void {
    patchState(store, (state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
  },

  assignCategory(id: string, categoryId: string | null): void {
    patchState(store, (state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? assignCategory(task, categoryId) : task)),
    }));
  },

  addCategory(rawName: string, color: string): void {
    const name = normalizeCategoryName(rawName);

    if (name.length === 0 || isDuplicateCategoryName(name, store.categories())) return;

    patchState(store, (state) => ({ categories: [...state.categories, createCategory(name, color)] }));
  },

  renameCategory(id: string, rawName: string): void {
    const name = normalizeCategoryName(rawName);

    if (name.length === 0 || isDuplicateCategoryName(name, store.categories(), id)) return;

    patchState(store, (state) => ({
      categories: state.categories.map((category) => (category.id === id ? renameCategory(category, name) : category)),
    }));
  },

  removeCategory(id: string): void {
    patchState(store, (state) => ({
      categories: state.categories.filter((category) => category.id !== id),
      tasks: detachCategory(state.tasks, id),
    }));
  },

  setCategoryFilter(categoryFilter: string): void {
    patchState(store, { categoryFilter });
  },
});
