import { InjectionToken, Provider } from '@angular/core';
import { CategoryRepository } from '@domain/repositories/category.repository';
import { CategoryStorageService } from '@infrastructure/storage/category-storage.service';

export const CATEGORY_REPOSITORY = new InjectionToken<CategoryRepository>('CategoryRepository');

export const provideCategoryRepository = (): Provider => ({
  provide: CATEGORY_REPOSITORY,
  useClass: CategoryStorageService,
});
