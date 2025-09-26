import { parseNumberFieldResponse } from '../parse';

describe('parseNumberFieldResponse', () => {
  const blankLabel = 'Unknown';

  describe('Empty or no data scenarios', () => {
    it('should handle empty series data', () => {
      const series = {};
      const result = parseNumberFieldResponse(series, blankLabel);

      expect(result.data).toEqual([{ [blankLabel]: 0 }]);
      expect(result.percentages).toEqual([100]);
      expect(result.columns).toEqual([blankLabel]);
      expect(result.labels).toEqual([blankLabel]);
    });

    it('should handle only blank values', () => {
      const series = { _blank: 50 };
      const result = parseNumberFieldResponse(series, blankLabel);

      expect(result.data).toEqual([{ [blankLabel]: 50 }]);
      expect(result.percentages).toEqual([100]);
      expect(result.columns).toEqual([blankLabel]);
    });

    it('should handle no numeric values (all non-numeric keys)', () => {
      const series = { invalid: 10, 'not-a-number': 5, _blank: 3 };
      const result = parseNumberFieldResponse(series, blankLabel);

      expect(result.data).toEqual([{ [blankLabel]: 3 }]);
      expect(result.percentages).toEqual([100]);
      expect(result.columns).toEqual([blankLabel]);
    });
  });

  describe('Small range scenarios (≤10 range, ≤20 unique values)', () => {
    it('should create individual bins for household size (1-6)', () => {
      const series = {
        1: 16,
        2: 8,
        3: 11,
        4: 10,
        5: 19,
        6: 15,
        _blank: 0,
      };
      const result = parseNumberFieldResponse(series, blankLabel);

      expect(result.columns).toEqual(['1', '2', '3', '4', '5', '6']);
      expect(result.data[0]).toEqual({
        1: 16,
        2: 8,
        3: 11,
        4: 10,
        5: 19,
        6: 15,
      });
      expect(result.percentages).toHaveLength(6);
      expect(result.percentages.reduce((sum, p) => sum + p, 0)).toBeCloseTo(
        100,
        1
      );
    });

    it('should create individual bins for rating scale (1-5)', () => {
      const series = {
        1: 5,
        2: 8,
        3: 12,
        4: 15,
        5: 10,
        _blank: 2,
      };
      const result = parseNumberFieldResponse(series, blankLabel);

      expect(result.columns).toEqual(['1', '2', '3', '4', '5', blankLabel]);
      expect(result.data[0]).toEqual({
        1: 5,
        2: 8,
        3: 12,
        4: 15,
        5: 10,
        [blankLabel]: 2,
      });
    });

    it('should handle sparse data with gaps', () => {
      const series = {
        1: 10,
        3: 5,
        5: 8,
        7: 12,
        _blank: 1,
      };
      const result = parseNumberFieldResponse(series, blankLabel);

      // For sparse data with gaps, it creates individual bins for each value
      expect(result.columns).toEqual([
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        blankLabel,
      ]);
      expect(result.data[0]).toEqual({
        1: 10,
        2: 0,
        3: 5,
        4: 0,
        5: 8,
        6: 0,
        7: 12,
        [blankLabel]: 1,
      });
    });
  });

  describe('Medium range scenarios (≤50 range)', () => {
    it('should create bins of size 5 for age groups (18-45)', () => {
      const series = {
        18: 5,
        19: 3,
        20: 8,
        21: 4,
        22: 6,
        25: 7,
        26: 5,
        27: 9,
        28: 3,
        29: 4,
        30: 8,
        31: 6,
        32: 5,
        33: 7,
        34: 4,
        35: 6,
        36: 5,
        37: 8,
        38: 4,
        39: 3,
        40: 5,
        41: 4,
        42: 6,
        43: 3,
        44: 2,
        45: 1,
        _blank: 2,
      };
      const result = parseNumberFieldResponse(series, blankLabel);

      // Should create bins: 18-22, 23-27, 28-32, 33-37, 38-42, 43-45
      expect(result.columns).toContain('18-22');
      expect(result.columns).toContain('23-27');
      expect(result.columns).toContain('28-32');
      expect(result.columns).toContain('33-37');
      expect(result.columns).toContain('38-42');
      expect(result.columns).toContain('43-45');
      expect(result.columns).toContain(blankLabel);

      // Check that values are summed correctly
      expect(result.data[0]['18-22']).toBe(26); // 5+3+8+4+6
      expect(result.data[0]['23-27']).toBe(21); // 7+5+9 (only 25, 26, 27 exist in data)
      expect(result.data[0]['28-32']).toBe(26); // 8+6+5+7 (only 30, 31, 32, 33 exist in data)
    });

    it('should handle income ranges (1000-50000)', () => {
      const series = {
        1000: 2,
        2000: 3,
        3000: 5,
        4000: 4,
        5000: 6,
        10000: 8,
        15000: 7,
        20000: 9,
        25000: 6,
        30000: 5,
        35000: 4,
        40000: 3,
        45000: 2,
        50000: 1,
        _blank: 1,
      };
      const result = parseNumberFieldResponse(series, blankLabel);

      // The actual binning creates different ranges based on the algorithm
      expect(result.columns.length).toBeGreaterThan(5);
      expect(result.columns.length).toBeLessThan(15);
      expect(result.columns).toContain(blankLabel);

      // All non-blank columns should be ranges
      const nonBlankColumns = result.columns.filter(
        (col) => col !== blankLabel
      );
      nonBlankColumns.forEach((column) => {
        expect(column).toMatch(/^\d+-\d+$/); // Should be in format "start-end"
      });
    });
  });

  describe('Large range scenarios (>50 range)', () => {
    it('should create 5-7 bins for large datasets (1-1000)', () => {
      const series: Record<string, number> = { _blank: 5 };

      // Create a large dataset with values from 1 to 1000
      for (let i = 1; i <= 1000; i += 10) {
        series[i.toString()] = Math.floor(Math.random() * 10) + 1;
      }

      const result = parseNumberFieldResponse(series, blankLabel);

      // Should create 5-7 bins
      expect(result.columns.length).toBeGreaterThanOrEqual(5);
      expect(result.columns.length).toBeLessThanOrEqual(8); // 5-7 bins + blank

      // All bins should be ranges (not individual numbers for large datasets)
      const nonBlankColumns = result.columns.filter(
        (col) => col !== blankLabel
      );
      nonBlankColumns.forEach((column) => {
        expect(column).toMatch(/^\d+-\d+$/); // Should be in format "start-end"
      });
    });

    it('should handle very large ranges (1-10000)', () => {
      const series: Record<string, number> = { _blank: 2 };

      // Create sparse data across a very large range
      for (let i = 100; i <= 10000; i += 500) {
        series[i.toString()] = Math.floor(Math.random() * 20) + 1;
      }

      const result = parseNumberFieldResponse(series, blankLabel);

      expect(result.columns.length).toBeGreaterThanOrEqual(5);
      expect(result.columns.length).toBeLessThanOrEqual(8);

      // Check that bins are reasonable sizes
      const nonBlankColumns = result.columns.filter(
        (col) => col !== blankLabel
      );
      nonBlankColumns.forEach((column) => {
        const [start, end] = column.split('-').map(Number);
        const binSize = end - start + 1;
        expect(binSize).toBeGreaterThan(0);
        expect(binSize).toBeLessThan(5000); // Reasonable bin size
      });
    });
  });

  describe('Edge cases and special scenarios', () => {
    it('should handle single value', () => {
      const series = { 42: 100, _blank: 0 };
      const result = parseNumberFieldResponse(series, blankLabel);

      expect(result.columns).toEqual(['42']);
      expect(result.data[0]).toEqual({ 42: 100 });
      expect(result.percentages).toEqual([100]);
    });

    it('should handle two values', () => {
      const series = { 10: 60, 20: 40, _blank: 0 };
      const result = parseNumberFieldResponse(series, blankLabel);

      // For range 10-20 (range=10), it creates individual bins
      expect(result.columns).toEqual([
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
      ]);
      expect(result.data[0]['10']).toBe(60);
      expect(result.data[0]['20']).toBe(40);
      expect(result.data[0]['11']).toBe(0); // Empty bins
    });

    it('should handle negative numbers', () => {
      const series = { '-10': 5, '-5': 8, 0: 10, 5: 7, _blank: 2 };
      const result = parseNumberFieldResponse(series, blankLabel);

      // For range -10 to 5 (range=15), it creates bins of size 5
      expect(result.columns).toContain('-10--6');
      expect(result.columns).toContain('-5--1');
      expect(result.columns).toContain('0-4');
      expect(result.columns).toContain('5-5');
      expect(result.columns).toContain(blankLabel);
    });

    it('should handle decimal numbers (stored as strings)', () => {
      const series = { 1.5: 5, 2.5: 8, 3.5: 7, _blank: 1 };
      const result = parseNumberFieldResponse(series, blankLabel);

      expect(result.columns).toEqual(['1.5', '2.5', '3.5', blankLabel]);
      expect(result.data[0]).toEqual({
        1.5: 5,
        2.5: 8,
        3.5: 7,
        [blankLabel]: 1,
      });
    });

    it('should handle very large numbers', () => {
      const series = { 1000000: 5, 2000000: 3, 3000000: 2, _blank: 1 };
      const result = parseNumberFieldResponse(series, blankLabel);

      // For range 1000000-3000000 (range=2000000), it creates large bins
      expect(result.columns.length).toBeGreaterThan(4);
      expect(result.columns.length).toBeLessThan(8);
      expect(result.columns).toContain(blankLabel);

      // Should have ranges for large numbers
      const nonBlankColumns = result.columns.filter(
        (col) => col !== blankLabel
      );
      nonBlankColumns.forEach((column) => {
        expect(column).toMatch(/^\d+-\d+$/); // Should be in format "start-end"
      });
    });

    it('should sort numeric values correctly', () => {
      const series = { 10: 5, 2: 8, 100: 3, 1: 10, _blank: 2 };
      const result = parseNumberFieldResponse(series, blankLabel);

      // For range 1-100 (range=99), it creates ~5-7 bins
      expect(result.columns.length).toBeGreaterThan(5);
      expect(result.columns.length).toBeLessThan(10);
      expect(result.columns).toContain(blankLabel);

      // Check that bins are in order
      const nonBlankColumns = result.columns.filter(
        (col) => col !== blankLabel
      );
      const firstBin = nonBlankColumns[0];
      const lastBin = nonBlankColumns[nonBlankColumns.length - 1];
      expect(firstBin).toMatch(/^1-/); // Should start with 1
      expect(lastBin).toMatch(/100$/); // Should end with 100
    });

    it('should handle mixed numeric and non-numeric keys', () => {
      const series = {
        1: 5,
        invalid: 2,
        2: 8,
        'not-number': 1,
        3: 7,
        _blank: 1,
      };
      const result = parseNumberFieldResponse(series, blankLabel);

      expect(result.columns).toEqual(['1', '2', '3', blankLabel]);
      expect(result.data[0]).toEqual({
        1: 5,
        2: 8,
        3: 7,
        [blankLabel]: 1,
      });
    });
  });

  describe('Data integrity and formatting', () => {
    it('should maintain correct percentages', () => {
      const series = { 1: 25, 2: 25, 3: 25, 4: 25, _blank: 0 };
      const result = parseNumberFieldResponse(series, blankLabel);

      expect(result.percentages).toEqual([25, 25, 25, 25]);
      expect(result.percentages.reduce((sum, p) => sum + p, 0)).toBe(100);
    });

    it('should include blank values in percentages', () => {
      const series = { 1: 20, 2: 20, 3: 20, 4: 20, _blank: 20 };
      const result = parseNumberFieldResponse(series, blankLabel);

      expect(result.percentages).toEqual([20, 20, 20, 20, 20]);
      expect(result.percentages.reduce((sum, p) => sum + p, 0)).toBe(100);
    });

    it('should create proper legend items', () => {
      const series = { 1: 10, 2: 20, _blank: 5 };
      const result = parseNumberFieldResponse(series, blankLabel);

      expect(result.legendItems).toHaveLength(3);
      expect(result.legendItems[0]).toMatchObject({
        icon: 'circle',
        label: '1',
        value: 10,
      });
      expect(result.legendItems[1]).toMatchObject({
        icon: 'circle',
        label: '2',
        value: 20,
      });
      expect(result.legendItems[2]).toMatchObject({
        icon: 'circle',
        label: blankLabel,
        value: 5,
      });
    });

    it('should assign different colors to different bins', () => {
      const series = { 1: 10, 2: 20, 3: 30, _blank: 5 };
      const result = parseNumberFieldResponse(series, blankLabel);

      const colors = Object.values(result.statusColorById);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(4); // Should have 4 different colors
    });
  });
});
