import { getFieldNameFromPath, getElementType } from './JSONFormUtils';

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

describe('getElementType function', () => {
  const uiSchema = {
    elements: [
      {
        elements: [
          { scope: 'someScope', options: { input_type: 'text' } },
          { scope: 'otherScope', options: { input_type: 'number' } },
        ],
      },
    ],
  };

  it('should return the correct element type when found', () => {
    expect(getElementType(uiSchema, 'someScope')).toBe('text');
    expect(getElementType(uiSchema, 'otherScope')).toBe('number');
  });

  it('should return undefined if the element is not found', () => {
    expect(getElementType(uiSchema, 'nonExistentScope')).toBeUndefined();
  });

  it('should return undefined if the uiSchema is empty', () => {
    expect(getElementType({}, 'someScope')).toBeUndefined();
  });

  it('should return undefined if the name parameter is not found in the uiSchema', () => {
    expect(getElementType(uiSchema, 'nonExistentScope')).toBeUndefined();
  });
});
