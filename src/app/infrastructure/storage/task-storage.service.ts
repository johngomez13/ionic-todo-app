import { Injectable } from '@angular/core';
import { TASKS_STORAGE_KEY } from '@core/constants/storage-keys.const';
import { Task } from '@domain/models/task.model';
import { TaskRepository } from '@domain/repositories/task.repository';

@Injectable({ providedIn: 'root' })
export class TaskStorageService implements TaskRepository {
  public getAll(): Task[] {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);

    if (raw === null) return [];

    try {
      const parsed: unknown = JSON.parse(raw);

      return Array.isArray(parsed) ? (parsed as Task[]) : [];
    } catch {
      return [];
    }
  }

  public save(tasks: readonly Task[]): void {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }
}
