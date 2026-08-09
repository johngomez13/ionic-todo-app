import { Category } from '@domain/models/category.model';
import { resolveCategoriesEmptyMessage, resolveNameError, toCategoryView } from './category-view.helper';

describe('category-view.helper', () => {
  const categories: Category[] = [{ id: 'a', name: 'Casa', color: '#e11d48' }];

  describe('toCategoryView', () => {
    it('should keep the category and add both accessible labels', () => {
      expect(toCategoryView(categories[0])).toEqual({
        id: 'a',
        name: 'Casa',
        color: '#e11d48',
        renameLabel: 'Renombrar Casa',
        removeLabel: 'Eliminar Casa',
      });
    });
  });

  describe('resolveCategoriesEmptyMessage', () => {
    it('should report the empty list', () => {
      expect(resolveCategoriesEmptyMessage(0)).toBe('No hay categorías todavía.');
    });

    it('should return null when there is something to render', () => {
      expect(resolveCategoriesEmptyMessage(2)).toBeNull();
    });
  });

  describe('resolveNameError', () => {
    it('should stay silent while the field is empty', () => {
      expect(resolveNameError('', categories)).toBeNull();
      expect(resolveNameError('   ', categories)).toBeNull();
    });

    it('should report a duplicate name', () => {
      expect(resolveNameError('casa', categories)).toBe('Ya existe una categoría con ese nombre.');
    });

    it('should accept a free name', () => {
      expect(resolveNameError('Ocio', categories)).toBeNull();
    });

    it('should let a category keep its own name while renaming', () => {
      expect(resolveNameError('Casa', categories, 'a')).toBeNull();
    });
  });
});
