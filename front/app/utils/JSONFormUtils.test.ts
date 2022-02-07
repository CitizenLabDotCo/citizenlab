import { getFieldNameFromPath } from './JSONFormUtils';

const simpleFields = ['field', 'another.field', 'an_other.field'];
const multilocFields = [
  'field_multiloc.en',
  'field_multiloc.fr-BE',
  'field_multiloc',
];

describe('getFieldNameFromPath', () => {
  test.each(simpleFields)(
    'returns last segment for simple fields',
    (val: any) => {
      expect(getFieldNameFromPath(val)).toBe('field');
    }
  );
  test.each(multilocFields)(
    'returns false when passed in some other errors',
    (val: any) => {
      expect(getFieldNameFromPath(val)).toBe('field_multiloc');
    }
  );
});
