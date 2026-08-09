import { Category, normalizeCategoryName } from '@domain/models/category.model';
import { isDuplicateCategoryName } from '@domain/services/category-rules';
import { CategoryView } from '@ui/todo/shared/models/category-view.model';

const EMPTY_LIST_MESSAGE = 'No hay categorías todavía.';
const DUPLICATE_NAME_MESSAGE = 'Ya existe una categoría con ese nombre.';

export const buildRenameLabel = (name: string): string => `Renombrar ${name}`;

export const buildRemoveCategoryLabel = (name: string): string => `Eliminar ${name}`;

export const toCategoryView = (category: Category): CategoryView => ({
  ...category,
  renameLabel: buildRenameLabel(category.name),
  removeLabel: buildRemoveCategoryLabel(category.name),
});

export const resolveCategoriesEmptyMessage = (total: number): string | null =>
  total === 0 ? EMPTY_LIST_MESSAGE : null;

export const resolveNameError = (
  rawName: string,
  categories: readonly Category[],
  exceptId: string | null = null,
): string | null => {
  const name = normalizeCategoryName(rawName);

  if (name.length === 0) return null;

  return isDuplicateCategoryName(name, categories, exceptId) ? DUPLICATE_NAME_MESSAGE : null;
};
