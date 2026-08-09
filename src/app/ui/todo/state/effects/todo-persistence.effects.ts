import { effect } from '@angular/core';
import { StateSignals } from '@ngrx/signals';
import { CategoryRepository } from '@domain/repositories/category.repository';
import { TaskRepository } from '@domain/repositories/task.repository';
import { TodoState } from '../todo.state';

export const registerTodoPersistence = (
  store: StateSignals<TodoState>,
  taskRepository: TaskRepository,
  categoryRepository: CategoryRepository,
): void => {
  effect(() => {
    taskRepository.save(store.tasks());
  });

  effect(() => {
    categoryRepository.save(store.categories());
  });
};
