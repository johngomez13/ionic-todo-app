import { InjectionToken, Provider } from '@angular/core';
import { TaskRepository } from '@domain/repositories/task.repository';
import { TaskStorageService } from '@infrastructure/storage/task-storage.service';

export const TASK_REPOSITORY = new InjectionToken<TaskRepository>('TaskRepository');

export const provideTaskRepository = (): Provider => ({
  provide: TASK_REPOSITORY,
  useClass: TaskStorageService,
});
