import { computed, effect, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { TASK_REPOSITORY } from '@application/providers/task.provider';
import { createTask, normalizeTitle, toggleCompletion } from '@domain/models/task.model';
import { TaskStatusFilter, countPending, filterTasksByStatus } from '@domain/services/task-filters';
import { initialTaskState } from './task.state';

export const TaskStore = signalStore(
  { providedIn: 'root' },

  withState(initialTaskState),

  withComputed(({ tasks, statusFilter }) => ({
    visibleTasks: computed(() => filterTasksByStatus(tasks(), statusFilter())),
    pendingCount: computed(() => countPending(tasks())),
  })),

  withMethods((store) => ({
    addTask(rawTitle: string): void {
      const title = normalizeTitle(rawTitle);

      if (title.length === 0) return;

      patchState(store, (state) => ({ tasks: [...state.tasks, createTask(title)] }));
    },

    toggleTask(id: string): void {
      patchState(store, (state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? toggleCompletion(task) : task)),
      }));
    },

    removeTask(id: string): void {
      patchState(store, (state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
    },

    setStatusFilter(statusFilter: TaskStatusFilter): void {
      patchState(store, { statusFilter });
    },
  })),

  withHooks({
    onInit(store, repository = inject(TASK_REPOSITORY)): void {
      patchState(store, { tasks: repository.getAll() });

      effect(() => {
        repository.save(store.tasks());
      });
    },
  }),
);
