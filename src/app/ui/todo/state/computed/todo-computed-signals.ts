import { Signal, computed } from '@angular/core';
import { StateSignals } from '@ngrx/signals';
import { Task } from '@domain/models/task.model';
import { countPending, countPendingByCategory, filterTasksByCategory } from '@domain/services/task-filters';
import { TodoState } from '../todo.state';

export type TodoComputedSignals = {
  readonly visibleTasks: Signal<Task[]>;
  readonly pendingCount: Signal<number>;
  readonly pendingByCategory: Signal<Map<string, number>>;
  readonly categoryNames: Signal<string[]>;
  readonly categoryCount: Signal<number>;
};

export const buildTodoComputedSignals = (store: StateSignals<TodoState>): TodoComputedSignals => ({
  visibleTasks: computed(() => filterTasksByCategory(store.tasks(), store.categoryFilter())),
  pendingCount: computed(() => countPending(store.tasks())),
  pendingByCategory: computed(() => countPendingByCategory(store.tasks())),
  categoryNames: computed(() => store.categories().map((category) => category.name)),
  categoryCount: computed(() => store.categories().length),
});
