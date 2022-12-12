import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
  IOptionsType,
} from 'services/formCustomFields';
import { colors } from '@citizenlab/cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';

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
  field: IFlatCustomField | IFlatCustomFieldWithIndex
) => {
  const fieldIndex = formCustomFields
    .filter((customField) => {
      return field.input_type === 'page'
        ? customField.input_type === 'page'
        : customField.input_type !== 'page';
    })
    .findIndex((f) => f.id === field.id);

  return ` ${fieldIndex + 1}`;
};

export const getOptionRule = (
  option: IOptionsType,
  field: IFlatCustomField
) => {
  const rules = field.logic?.rules;
  if (!isNilOrError(rules) && (option.id || option.temp_id)) {
    const rule = rules.find(
      (rule) => rule.if === option.id || rule.if === option.temp_id
    );
    if (rule && rule.if && rule.goto_page_id) {
      return rule;
    }
  }
  return undefined;
};

export const getLinearScaleRule = (
  option: { key: number; label: string },
  field: IFlatCustomField
) => {
  const rules = field.logic?.rules;
  if (!isNilOrError(rules) && option.key) {
    const rule = rules.find((rule) => rule.if === option.key);
    if (rule && rule.if && rule.goto_page_id) {
      return rule;
    }
  }
  return undefined;
};

export const getLinearScaleOptions = (maximum: number) => {
  const linearScaleOptionArray = Array.from(
    { length: maximum },
    (_, i) => i + 1
  );
  const answers = linearScaleOptionArray.map((option) => ({
    key: option,
    label: option.toString(),
  }));
  return answers;
};
