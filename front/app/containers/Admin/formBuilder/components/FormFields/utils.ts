// services
import {
  ICustomFieldInputType,
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
  IOptionsType,
  QuestionRuleType,
} from 'services/formCustomFields';

// styling
import { colors } from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';

// utils
import { isNilOrError } from 'utils/helperUtils';

// types
import { Locale } from 'typings';
import { surveyEndOption } from '../FormBuilderSettings/utils';

export const isFieldSelected = (
  selectedFieldId: string | undefined,
  fieldId: string
) => {
  return selectedFieldId === fieldId;
};

export const getFieldBackgroundColor = (
  selectedFieldId: string | undefined,
  field: IFlatCustomField,
  hasErrors: boolean
) => {
  if (isFieldSelected(selectedFieldId, field.id)) {
    return rgba(colors.tealLight, 0.7);
  } else if (hasErrors) {
    return colors.errorLight;
  } else if (field.input_type === 'page') {
    return rgba(colors.coolGrey300, 0.15);
  }
  return undefined;
};

export const getIndexTitleColor = (inputType: ICustomFieldInputType) => {
  return inputType === 'page' ? 'blue500' : 'teal400';
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
      return rule as QuestionRuleType;
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

export const getTitleFromAnswerId = (
  field: IFlatCustomField,
  answerId: string | number | undefined,
  locale: Locale | undefined | null | Error
) => {
  if (answerId && !isNilOrError(locale)) {
    // If number, this is a linear scale option. Return the value as a string.
    if (typeof answerId === 'number') {
      return answerId.toString();
    }
    // Otherwise this is an option ID, return the related option title
    const option = field?.options?.find(
      (option) => option.id === answerId || option.temp_id === answerId
    );
    return option?.title_multiloc[locale];
  }
  return undefined;
};

export const getTitleFromPageId = (
  formCustomFields: IFlatCustomField[],
  pageId: string | number | undefined,
  surveyEndMessage: string,
  pageMessage: string
) => {
  if (pageId) {
    // Return the related page title for the provided ID
    if (pageId === surveyEndOption) {
      return surveyEndMessage;
    }
    const page = formCustomFields.find(
      (field) => field.id === pageId || field.temp_id === pageId
    );
    if (!isNilOrError(page)) {
      return `${pageMessage} ${getIndexForTitle(formCustomFields, page)}`;
    }
  }
  return undefined;
};
