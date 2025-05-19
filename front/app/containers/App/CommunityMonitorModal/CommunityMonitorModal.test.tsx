import { isAllowedOnUrl } from './utils';

// Jest Unit Tests
const {
  findFirstSentimentLinearScale,
  schemaWithRequiredFirstQuestion,
} = require('./utils.ts');

describe('findFirstSentimentLinearScale', () => {
  test('should return the first sentiment_linear_scale element (from the 1st page)', () => {
    const data = {
      type: 'Categorization',
      options: { formId: 'idea-form', inputTerm: 'idea' },
      elements: [
        {
          type: 'Page',
          options: {
            input_type: 'page',
            id: 'page-1',
            title: '',
            description: 'description',
            page_layout: 'default',
            map_config_id: null,
          },
          elements: [
            {
              type: 'Control',
              options: { input_type: 'sentiment_linear_scale' },
            },
          ],
        },
        {
          type: 'Page',
          options: {
            input_type: 'page',
            id: 'page-2',
            title: '',
            description: 'description',
            page_layout: 'default',
            map_config_id: null,
          },
          elements: [],
        },
      ],
    };
    expect(findFirstSentimentLinearScale(data)).toEqual(
      data.elements[0].elements[0]
    );
  });

  test('should return the first sentiment_linear_scale element (from the 2nd page)', () => {
    const data = {
      type: 'Categorization',
      options: { formId: 'idea-form', inputTerm: 'idea' },
      elements: [
        {
          type: 'Page',
          options: {
            input_type: 'page',
            id: 'page-1',
            title: '',
            description: 'description',
            page_layout: 'default',
            map_config_id: null,
          },
          elements: [],
        },
        {
          type: 'Page',
          options: {
            input_type: 'page',
            id: 'page-2',
            title: '',
            description: 'description',
            page_layout: 'default',
            map_config_id: null,
          },
          elements: [
            {
              type: 'Control',
              options: { input_type: 'sentiment_linear_scale' },
            },
          ],
        },
      ],
    };
    expect(findFirstSentimentLinearScale(data)).toEqual(
      data.elements[1].elements[0]
    );
  });

  test('should return null if no sentiment_linear_scale element exists', () => {
    const data = {
      type: 'Categorization',
      options: { formId: 'idea-form', inputTerm: 'idea' },
      elements: [
        {
          type: 'Page',
          options: {
            input_type: 'page',
            id: 'page-1',
            title: '',
            description: 'description',
            page_layout: 'default',
            map_config_id: null,
          },
          elements: [],
        },
      ],
    };
    expect(findFirstSentimentLinearScale(data)).toBeNull();
  });

  test('should return null if input is null', () => {
    expect(findFirstSentimentLinearScale(null)).toBeNull();
  });

  test('should return null if elements array is missing', () => {
    expect(findFirstSentimentLinearScale({})).toBeNull();
  });
});

describe('schemaWithRequiredFirstQuestion', () => {
  test('should make the first question required', () => {
    const schema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        question1: { type: 'number', minimum: 1, maximum: 5 },
        question2: { type: 'string' },
      },
    };

    const updatedSchema = schemaWithRequiredFirstQuestion(schema);
    expect(updatedSchema.required).toEqual(['question1']);
  });

  test('should handle schemas with multiple properties', () => {
    const schema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        first_question: { type: 'string' },
        second_question: { type: 'number', minimum: 1, maximum: 10 },
        third_question: { type: 'boolean' },
      },
    };

    const updatedSchema = schemaWithRequiredFirstQuestion(schema);
    expect(updatedSchema.required).toEqual(['first_question']);
  });

  test('should return the same schema if properties are empty', () => {
    const schema = {
      type: 'object',
      additionalProperties: false,
      properties: {},
    };

    const updatedSchema = schemaWithRequiredFirstQuestion(schema);
    expect(updatedSchema).toEqual(schema);
  });
});

describe('isAllowedOnUrl', () => {
  it('should return true for URLs containing /pages/', () => {
    expect(isAllowedOnUrl('/pages/custom-page')).toBeTruthy();
    expect(isAllowedOnUrl('/pages/about-us')).toBeTruthy();
  });

  it('should return true for homepage URLs with language prefix', () => {
    expect(isAllowedOnUrl('/en/')).toBeTruthy();
    expect(isAllowedOnUrl('/fr/')).toBeTruthy();
    expect(isAllowedOnUrl('/de/')).toBeTruthy();
  });

  it('should return false for URLs that are not custom pages or homepages', () => {
    expect(isAllowedOnUrl('/en/dashboard')).toBeFalsy();
    expect(isAllowedOnUrl('/api/data')).toBeFalsy();
    expect(isAllowedOnUrl('/random/path')).toBeFalsy();
  });

  it('should handle edge cases correctly', () => {
    expect(isAllowedOnUrl('/pages-fake/')).toBeFalsy(); // Should not match "/pages-fake/"
    expect(isAllowedOnUrl('/pagesanything')).toBeFalsy(); // Should not match "/pagesanything"
    expect(isAllowedOnUrl('/')).toBeFalsy(); // Root without language prefix
    expect(isAllowedOnUrl('/en')).toBeFalsy(); // Missing trailing slash
  });
});
