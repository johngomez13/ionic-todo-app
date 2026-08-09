import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CATEGORIES_STORAGE_KEY } from '@core/constants/storage-keys.const';
import { Category } from '@domain/models/category.model';
import { CategoryStorageService } from './category-storage.service';

describe('CategoryStorageService', () => {
  let service: CategoryStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(CategoryStorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return an empty list when nothing was stored', () => {
    expect(service.getAll()).toEqual([]);
  });

  it('should read back what it saved', () => {
    const categories: Category[] = [{ id: 'a', name: 'Casa', color: '#e11d48' }];

    service.save(categories);

    expect(service.getAll()).toEqual(categories);
  });

  it('should use a key of its own, separate from the tasks one', () => {
    service.save([{ id: 'a', name: 'Casa', color: '#e11d48' }]);

    expect(localStorage.getItem(CATEGORIES_STORAGE_KEY)).not.toBeNull();
    expect(localStorage.getItem('todo.tasks')).toBeNull();
  });

  it('should return an empty list when the stored data is not valid JSON', () => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, 'esto no es json');

    expect(service.getAll()).toEqual([]);
  });
});
