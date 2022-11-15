import { IFlatCustomField } from 'services/formCustomFields';
import { colors } from '@citizenlab/cl2-component-library';

export const isFieldSelected = (
  selectedFieldId: string | undefined,
  fieldId: string
) => {
  return selectedFieldId === fieldId;
};

export const getFieldBackgroundColor = (
  selectedFieldId: string | undefined,
  field: IFlatCustomField
) => {
  if (field.input_type === 'page') {
    return isFieldSelected(selectedFieldId, field.id)
      ? colors.primary
      : colors.background;
  }
  return undefined;
};

export const getTitleColor = (
  selectedFieldId: string | undefined,
  field: IFlatCustomField
) => {
  if (
    field.input_type === 'page' &&
    isFieldSelected(selectedFieldId, field.id)
  ) {
    return 'white';
  }
  return 'grey800';
};

export const getIndexTitleColor = (
  selectedFieldId: string | undefined,
  field: IFlatCustomField
) => {
  if (
    field.input_type === 'page' &&
    isFieldSelected(selectedFieldId, field.id)
  ) {
    return 'white';
  }
  return 'teal300';
};

export const getIndexForTitle = (
  formCustomFields: IFlatCustomField[],
  field: IFlatCustomField
) => {
  if (field.input_type === 'page') {
    const filteredPages = formCustomFields.filter(
      (customField) => customField.input_type === 'page'
    );
    return ` ${filteredPages.indexOf(field) + 1}`;
  } else {
    const filteredQuestion = formCustomFields.filter(
      (customField) => customField.input_type !== 'page'
    );
    return ` ${filteredQuestion.indexOf(field) + 1}`;
  }
};
