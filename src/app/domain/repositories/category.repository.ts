import { Category } from '../models/category.model';

export interface CategoryRepository {
  getAll(): Category[];
  save(categories: readonly Category[]): void;
}
