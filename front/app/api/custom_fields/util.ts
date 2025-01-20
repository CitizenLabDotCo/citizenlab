import { IFlatCustomFieldWithIndex } from './types';

const doesObjectHaveProperties = (
  element: unknown,
  propertyNames: string[]
): boolean => {
  let hasProperties = true;
  propertyNames.forEach((propertyName) => {
    if (!Object.prototype.hasOwnProperty.call(element, propertyName)) {
      hasProperties = false;
    }
  });
  return hasProperties;
};

const properties = [
  'id',
  'input_type',
  'description_multiloc',
  'required',
  'title_multiloc',
  'linear_scale_label_1_multiloc',
  'linear_scale_label_2_multiloc',
  'linear_scale_label_3_multiloc',
  'linear_scale_label_4_multiloc',
  'linear_scale_label_5_multiloc',
  'linear_scale_label_6_multiloc',
  'linear_scale_label_7_multiloc',
  'linear_scale_label_8_multiloc',
  'linear_scale_label_9_multiloc',
  'linear_scale_label_10_multiloc',
  'linear_scale_label_11_multiloc',
  'maximum',
  'options',
  'enabled',
  'index',
];

export const isNewCustomFieldObject = (
  element: unknown
): element is IFlatCustomFieldWithIndex =>
  doesObjectHaveProperties(element, properties);
