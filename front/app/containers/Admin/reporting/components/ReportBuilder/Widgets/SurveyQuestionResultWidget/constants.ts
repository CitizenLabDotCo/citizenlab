import { IUserCustomFieldInputType } from 'api/user_custom_fields/types';

export const SUPPORTED_INPUT_TYPES_ARRAY: IUserCustomFieldInputType[] = [
  'select',
  'multiselect',
];

export const SUPPORTED_INPUT_TYPES = new Set<string>(
  SUPPORTED_INPUT_TYPES_ARRAY
);
