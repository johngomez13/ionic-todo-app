export interface CategoryColor {
  readonly value: string;
  readonly label: string;
}

export const CATEGORY_COLORS: readonly CategoryColor[] = [
  { value: '#e11d48', label: 'Rojo' },
  { value: '#f59e0b', label: 'Ámbar' },
  { value: '#16a34a', label: 'Verde' },
  { value: '#0ea5e9', label: 'Azul' },
  { value: '#6366f1', label: 'Índigo' },
  { value: '#a855f7', label: 'Violeta' },
];

export const DEFAULT_CATEGORY_COLOR = CATEGORY_COLORS[0].value;
