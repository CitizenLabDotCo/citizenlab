import { ICustomFieldInputType } from 'api/custom_fields/types';

export const SUPPORTED_INPUT_TYPES = new Set<ICustomFieldInputType>([
  'select',
  'multiselect',
]);
