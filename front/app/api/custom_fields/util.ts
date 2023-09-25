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
  'maximum_label_multiloc',
  'minimum_label_multiloc',
  'maximum',
  'options',
  'enabled',
  'index',
];

export const isNewCustomFieldObject = (
  element: unknown
): element is IFlatCustomFieldWithIndex =>
  doesObjectHaveProperties(element, properties);
