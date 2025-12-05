import { getPaginationParams, getPaginationMeta } from '../../../src/utils/pagination.js';

describe('Pagination Utils', () => {
  describe('getPaginationParams', () => {
    it('should return default values when no query params provided', () => {
      const result = getPaginationParams({});
      
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should parse page and limit from query params', () => {
      const query = { page: '2', limit: '20' };
      const result = getPaginationParams(query);
      
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(20); // (2-1) * 20
    });

    it('should calculate correct offset for different pages', () => {
      const query1 = { page: '1', limit: '10' };
      const query2 = { page: '3', limit: '15' };
      const query3 = { page: '5', limit: '25' };
      
      expect(getPaginationParams(query1).offset).toBe(0);
      expect(getPaginationParams(query2).offset).toBe(30); // (3-1) * 15
      expect(getPaginationParams(query3).offset).toBe(100); // (5-1) * 25
    });

    it('should enforce maximum limit of 100', () => {
      const query = { page: '1', limit: '200' };
      const result = getPaginationParams(query);
      
      expect(result.limit).toBe(100);
    });

    it('should enforce minimum limit of 1', () => {
      const query = { page: '1', limit: '0' };
      const result = getPaginationParams(query);
      
      expect(result.limit).toBe(1);
    });

    it('should enforce minimum page of 1', () => {
      const query = { page: '0', limit: '10' };
      const result = getPaginationParams(query);
      
      expect(result.page).toBe(1);
    });

    it('should handle negative page values', () => {
      const query = { page: '-5', limit: '10' };
      const result = getPaginationParams(query);
      
      expect(result.page).toBe(1);
    });

    it('should handle negative limit values', () => {
      const query = { page: '1', limit: '-10' };
      const result = getPaginationParams(query);
      
      expect(result.limit).toBe(1);
    });

    it('should handle non-numeric page values', () => {
      const query = { page: 'abc', limit: '10' };
      const result = getPaginationParams(query);
      
      expect(result.page).toBe(1);
    });

    it('should handle non-numeric limit values', () => {
      const query = { page: '1', limit: 'xyz' };
      const result = getPaginationParams(query);
      
      expect(result.limit).toBe(10);
    });

    it('should handle decimal values by converting to integers', () => {
      const query = { page: '2.7', limit: '15.3' };
      const result = getPaginationParams(query);
      
      expect(result.page).toBe(2);
      expect(result.limit).toBe(15);
    });
  });

  describe('getPaginationMeta', () => {
    it('should calculate correct metadata for first page', () => {
      const meta = getPaginationMeta(1, 10, 50);
      
      expect(meta.currentPage).toBe(1);
      expect(meta.totalPages).toBe(5);
      expect(meta.totalItems).toBe(50);
      expect(meta.itemsPerPage).toBe(10);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPreviousPage).toBe(false);
    });

    it('should calculate correct metadata for middle page', () => {
      const meta = getPaginationMeta(3, 10, 50);
      
      expect(meta.currentPage).toBe(3);
      expect(meta.totalPages).toBe(5);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPreviousPage).toBe(true);
    });

    it('should calculate correct metadata for last page', () => {
      const meta = getPaginationMeta(5, 10, 50);
      
      expect(meta.currentPage).toBe(5);
      expect(meta.totalPages).toBe(5);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPreviousPage).toBe(true);
    });

    it('should handle case when total items is less than limit', () => {
      const meta = getPaginationMeta(1, 10, 5);
      
      expect(meta.totalPages).toBe(1);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPreviousPage).toBe(false);
    });

    it('should handle case with exact multiple of limit', () => {
      const meta = getPaginationMeta(2, 10, 30);
      
      expect(meta.totalPages).toBe(3);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPreviousPage).toBe(true);
    });

    it('should handle zero total items', () => {
      const meta = getPaginationMeta(1, 10, 0);
      
      expect(meta.currentPage).toBe(1);
      expect(meta.totalPages).toBe(0);
      expect(meta.totalItems).toBe(0);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPreviousPage).toBe(false);
    });

    it('should calculate total pages with remainder correctly', () => {
      const meta = getPaginationMeta(1, 10, 95);
      
      expect(meta.totalPages).toBe(10); // ceil(95/10)
    });

    it('should return correct structure with all required fields', () => {
      const meta = getPaginationMeta(2, 15, 100);
      
      expect(meta).toHaveProperty('currentPage');
      expect(meta).toHaveProperty('totalPages');
      expect(meta).toHaveProperty('totalItems');
      expect(meta).toHaveProperty('itemsPerPage');
      expect(meta).toHaveProperty('hasNextPage');
      expect(meta).toHaveProperty('hasPreviousPage');
    });

    it('should handle large numbers correctly', () => {
      const meta = getPaginationMeta(50, 100, 5000);
      
      expect(meta.currentPage).toBe(50);
      expect(meta.totalPages).toBe(50);
      expect(meta.totalItems).toBe(5000);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPreviousPage).toBe(true);
    });
  });

  describe('Integration: getPaginationParams with getPaginationMeta', () => {
    it('should work together for complete pagination', () => {
      const query = { page: '3', limit: '20' };
      const { page, limit } = getPaginationParams(query);
      const totalItems = 100;
      const meta = getPaginationMeta(page, limit, totalItems);
      
      expect(meta.currentPage).toBe(3);
      expect(meta.itemsPerPage).toBe(20);
      expect(meta.totalPages).toBe(5);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPreviousPage).toBe(true);
    });
  });
});
