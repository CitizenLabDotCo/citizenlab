import { IFlatCustomField } from 'api/custom_fields/types';

export const makeCustomField = (
  attributes: Partial<IFlatCustomField> &
    Pick<IFlatCustomField, 'id' | 'input_type'>
): IFlatCustomField => ({
  type: 'custom_field',
  key: attributes.id,
  title_multiloc: { en: attributes.id },
  description_multiloc: {},
  required: false,
  answers_visible_to: 'moderators',
  show_as_filter: false,
  enabled: true,
  ordering: 0,
  created_at: '',
  updated_at: '',
  logic: {},
  ...attributes,
});
