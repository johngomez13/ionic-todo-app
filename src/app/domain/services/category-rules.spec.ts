import { Category } from '../models/category.model';
import { isDuplicateCategoryName, isSameCategoryName } from './category-rules';

describe('category-rules', () => {
  const category = (id: string, name: string): Category => ({ id, name, color: '#000000' });

  const categories: Category[] = [category('a', 'Casa'), category('b', 'Trabajo')];

  describe('isSameCategoryName', () => {
    it('should ignore differences in case', () => {
      expect(isSameCategoryName('Casa', 'casa')).toBeTrue();
      expect(isSameCategoryName('CASA', 'casa')).toBeTrue();
    });

    it('should ignore surrounding whitespace', () => {
      expect(isSameCategoryName('  Casa  ', 'Casa')).toBeTrue();
    });

    it('should ignore accents, so near duplicates are rejected too', () => {
      expect(isSameCategoryName('Café', 'Cafe')).toBeTrue();
    });

    it('should tell different names apart', () => {
      expect(isSameCategoryName('Casa', 'Trabajo')).toBeFalse();
    });
  });

  describe('isDuplicateCategoryName', () => {
    it('should detect an existing name', () => {
      expect(isDuplicateCategoryName('casa', categories)).toBeTrue();
    });

    it('should accept a new name', () => {
      expect(isDuplicateCategoryName('Ocio', categories)).toBeFalse();
    });

    it('should not consider a category a duplicate of itself when renaming', () => {
      expect(isDuplicateCategoryName('Casa', categories, 'a')).toBeFalse();
    });

    it('should still reject renaming onto another category name', () => {
      expect(isDuplicateCategoryName('Trabajo', categories, 'a')).toBeTrue();
    });
  });
});
