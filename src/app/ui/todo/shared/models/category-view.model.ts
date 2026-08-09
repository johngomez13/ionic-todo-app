import { Category } from '@domain/models/category.model';

export interface CategoryView extends Category {
  readonly renameLabel: string;
  readonly removeLabel: string;
}
