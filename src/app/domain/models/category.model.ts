export interface Category {
  readonly id: string;
  readonly name: string;
  readonly color: string;
}

export function createCategory(name: string, color: string): Category {
  return { id: crypto.randomUUID(), name, color };
}

export function renameCategory(category: Category, name: string): Category {
  return { ...category, name };
}

export function normalizeCategoryName(name: string): string {
  return name.trim();
}
