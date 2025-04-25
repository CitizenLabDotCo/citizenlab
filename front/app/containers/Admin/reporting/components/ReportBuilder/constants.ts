import { IUserCustomFieldInputType } from 'api/user_custom_fields/types';

// Supported input types for questions
export const SURVEY_QUESTION_INPUT_TYPES = new Set([
  'select',
  'multiselect',
  'linear_scale',
  'rating',
  'multiselect_image',
  'matrix_linear_scale',
  'sentiment_linear_scale',
  'ranking',
  'point',
  'line',
  'polygon',
]);

// Supported input types for slice survey questions
export const SLICE_SURVEY_QUESTION_INPUT_TYPES = new Set([
  'select',
  'linear_scale',
  'sentiment_linear_scale',
  'rating',
]);

// Supported input types for registration fields
export const SLICE_REGISTRATION_FIELD_INPUT_TYPES: IUserCustomFieldInputType[] =
  ['select'];
