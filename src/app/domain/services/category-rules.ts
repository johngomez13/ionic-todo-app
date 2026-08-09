import { Category, normalizeCategoryName } from '../models/category.model';

export function isSameCategoryName(one: string, other: string): boolean {
  return (
    normalizeCategoryName(one).localeCompare(normalizeCategoryName(other), undefined, {
      sensitivity: 'base',
    }) === 0
  );
}

export function isDuplicateCategoryName(
  name: string,
  categories: readonly Category[],
  exceptId: string | null = null,
): boolean {
  return categories.some((category) => category.id !== exceptId && isSameCategoryName(category.name, name));
}
