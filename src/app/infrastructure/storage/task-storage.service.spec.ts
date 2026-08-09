import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TASKS_STORAGE_KEY } from '@core/constants/storage-keys.const';
import { Task } from '@domain/models/task.model';
import { TaskStorageService } from './task-storage.service';

describe('TaskStorageService', () => {
  let service: TaskStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(TaskStorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return an empty list when nothing was stored', () => {
    expect(service.getAll()).toEqual([]);
  });

  it('should read back what it saved', () => {
    const tasks: Task[] = [{ id: 'a', title: 'Comprar pan', completed: false, categoryId: null }];

    service.save(tasks);

    expect(service.getAll()).toEqual(tasks);
  });

  it('should return an empty list when the stored data is not valid JSON', () => {
    localStorage.setItem(TASKS_STORAGE_KEY, 'esto no es json');

    expect(service.getAll()).toEqual([]);
  });

  it('should return an empty list when the stored data is not an array', () => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify({ title: 'no soy una lista' }));

    expect(service.getAll()).toEqual([]);
  });
});
