import { ICustomFieldInputType } from 'api/custom_fields/types';

export const SUPPORTED_INPUT_TYPES_ARRAY = [
  'select',
  'multiselect',
] satisfies ICustomFieldInputType[];

export const SUPPORTED_INPUT_TYPES = new Set<string>(
  SUPPORTED_INPUT_TYPES_ARRAY
);
