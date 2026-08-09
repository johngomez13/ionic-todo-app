import { Injectable } from '@angular/core';
import { CATEGORIES_STORAGE_KEY } from '@core/constants/storage-keys.const';
import { Category } from '@domain/models/category.model';
import { CategoryRepository } from '@domain/repositories/category.repository';

@Injectable({ providedIn: 'root' })
export class CategoryStorageService implements CategoryRepository {
  public getAll(): Category[] {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);

    if (raw === null) return [];

    try {
      const parsed: unknown = JSON.parse(raw);

      return Array.isArray(parsed) ? (parsed as Category[]) : [];
    } catch {
      return [];
    }
  }

  public save(categories: readonly Category[]): void {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }
}
