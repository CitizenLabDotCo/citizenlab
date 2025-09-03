import removeRequiredOtherFields from './removeRequiredOtherFields';

describe('removeRequiredOtherFields', () => {
  const schema = {
    // Omitting rest of schema for simplicity
    required: ['field1', 'field2_other'],
  } as any;

  describe('single select', () => {
    it('removes required other field when other is not selected', () => {
      const data = {
        field1: 'value',
        field2: 'value',
      };

      const result = removeRequiredOtherFields(schema, data);
      expect(result.required).toEqual(['field1']);
    });

    it('does not remove required other field when other is selected', () => {
      const data = {
        field1: 'value',
        field2: 'other',
      };

      const result = removeRequiredOtherFields(schema, data);
      expect(result.required).toEqual(['field1', 'field2_other']);
    });
  });

  describe('multi select', () => {
    it('removes required other field when other is not selected', () => {
      const data = {
        field1: 'value',
        field2: ['value'],
      };

      const result = removeRequiredOtherFields(schema, data);
      expect(result.required).toEqual(['field1']);
    });

    it('does not remove required other field when other is selected', () => {
      const data = {
        field1: 'value',
        field2: ['value', 'other'],
      };

      const result = removeRequiredOtherFields(schema, data);
      expect(result.required).toEqual(['field1', 'field2_other']);
    });
  });
});
