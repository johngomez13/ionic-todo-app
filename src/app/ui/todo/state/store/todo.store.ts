import { inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { CATEGORY_REPOSITORY } from '@application/providers/category.provider';
import { TASK_REPOSITORY } from '@application/providers/task.provider';
import { buildTodoComputedSignals } from '../computed/todo-computed-signals';
import { registerTodoPersistence } from '../effects/todo-persistence.effects';
import { buildTodoMethods } from '../todo-methods';
import { initialTodoState } from '../todo.state';

export const TodoStore = signalStore(
  { providedIn: 'root' },
  withState(initialTodoState),
  withComputed(buildTodoComputedSignals),
  withMethods(buildTodoMethods),
  withHooks({
    onInit(store): void {
      const taskRepository = inject(TASK_REPOSITORY);
      const categoryRepository = inject(CATEGORY_REPOSITORY);

      patchState(store, { tasks: taskRepository.getAll(), categories: categoryRepository.getAll() });

      registerTodoPersistence(store, taskRepository, categoryRepository);
    },
  }),
);
