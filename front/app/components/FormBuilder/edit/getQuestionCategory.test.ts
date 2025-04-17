import { IFlatCustomField } from 'api/custom_fields/types';

import { getQuestionCategory } from './utils';

const createField = (
  id: string,
  key: string,
  input_type: string
): IFlatCustomField => ({
  id,
  input_type: input_type as any,
  key,
  type: '',
  title_multiloc: {},
  required: false,
  ordering: 0,
  enabled: true,
  created_at: '',
  updated_at: '',
  logic: {},
  description_multiloc: {},
  question_category: 'other',
});

describe('getQuestionCategory', () => {
  it('returns undefined for page-type fields', () => {
    const pageField = createField('1', 'page_quality_of_life', 'page');
    const result = getQuestionCategory(pageField, [pageField]);
    expect(result).toBeUndefined();
  });

  it('returns "quality_of_life" if previous page was quality_of_life', () => {
    const pageField = createField('1', 'page_quality_of_life', 'page');
    const questionField = createField(
      '2',
      'place_to_live',
      'sentiment_linear_scale'
    );

    const fields = [pageField, questionField];
    const result = getQuestionCategory(questionField, fields);

    expect(result).toBe('quality_of_life');
  });

  it('returns "service_delivery" if previous page was service_delivery', () => {
    const pageField1 = createField('1', 'page_quality_of_life', 'page');
    const questionField1 = createField(
      '2',
      'place_to_live',
      'sentiment_linear_scale'
    );
    const pageField2 = createField('3', 'page_service_delivery', 'page');
    const questionField2 = createField(
      '4',
      'quality_of_services',
      'sentiment_linear_scale'
    );

    const fields = [pageField1, questionField1, pageField2, questionField2];
    const result = getQuestionCategory(questionField2, fields);

    expect(result).toBe('service_delivery');
  });

  it('returns "undefined" if nearest page key is not in mapping', () => {
    const pageField1 = createField('1', 'page_quality_of_life', 'page');
    const unknownPage = createField('2', 'page_random_custom', 'page');
    const question = createField(
      '3',
      'unknown_question',
      'sentiment_linear_scale'
    );

    const result = getQuestionCategory(question, [
      pageField1,
      unknownPage,
      question,
    ]);

    expect(result).toBe(undefined);
  });
});
