// services
import {
  ICustomFieldInputType,
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
  IOptionsType,
} from 'api/custom_fields/types';

// styling
import { colors, IconNames } from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { builtInFieldKeys } from 'components/FormBuilder/utils';
import { MessageDescriptor } from 'utils/cl-intl';

// types
import { Locale } from 'typings';
import { formEndOption } from '../FormBuilderSettings/utils';

// intl
import messages from '../messages';

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
  } else if (['page', 'section'].includes(field.input_type)) {
    return rgba(colors.coolGrey300, 0.15);
  }
  return undefined;
};

export const getIndexTitleColor = (inputType: ICustomFieldInputType) => {
  return ['page', 'section'].includes(inputType) ? 'blue500' : 'teal400';
};

export const getIndexForTitle = (
  formCustomFields: IFlatCustomField[],
  field: IFlatCustomField | IFlatCustomFieldWithIndex
) => {
  const fieldIndex = formCustomFields
    .filter((customField) => {
      if (field.input_type === 'section') {
        return customField.input_type === 'section';
      } else if (field.input_type === 'page') {
        return customField.input_type === 'page';
      }

      return !['page', 'section'].includes(customField.input_type);
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
  formEndMessage: string,
  pageMessage: string
) => {
  if (pageId) {
    // Return the related page title for the provided ID
    if (pageId === formEndOption) {
      return formEndMessage;
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

const getBuiltinFieldIcon = (key: string): IconNames => {
  switch (key) {
    case 'title_multiloc':
      return 'survey-short-answer';
    case 'location_description':
      return 'location-simple';
    case 'body_multiloc':
      return 'survey-long-answer-2';
    case 'idea_images_attributes':
      return 'image';
    case 'topic_ids':
      return 'label';
    case 'idea_files_attributes':
      return 'upload-file';
    case 'proposed_budget':
      return 'money-bag';
    default:
      return 'survey';
  }
};

// TODO: Rename icons in component library to "form" for clarity
const getCustomFieldIcon = (inputType: ICustomFieldInputType): IconNames => {
  switch (inputType) {
    case 'text':
    case 'title_multiloc':
      return 'survey-short-answer-2';
    case 'multiline_text':
      return 'survey-long-answer-2';
    case 'multiselect':
      return 'survey-multiple-choice-2';
    case 'select':
      return 'survey-single-choice';
    case 'number':
      return 'survey-number-field';
    case 'linear_scale':
      return 'survey-linear-scale';
    case 'section':
      return 'section';
    case 'file_upload':
    case 'files':
      return 'upload-file';
    default:
      return 'survey';
  }
};

export const getFieldIcon = (
  inputType: ICustomFieldInputType,
  key: string
): IconNames => {
  return builtInFieldKeys.includes(key)
    ? getBuiltinFieldIcon(key)
    : getCustomFieldIcon(inputType);
};

const getBuiltinFieldBadgeLabel = (key: string): MessageDescriptor => {
  switch (key) {
    case 'title_multiloc':
      return messages.shortAnswer;
    case 'idea_images_attributes':
      return messages.imageFileUpload;
    case 'location_description':
      return messages.locationDescription;
    case 'body_multiloc':
      return messages.longAnswer;
    case 'topic_ids':
      return messages.tags;
    case 'idea_files_attributes':
      return messages.fileUpload;
    case 'proposed_budget':
      return messages.proposedBudget;
    default:
      return messages.default;
  }
};

const getCustomFieldBadgeLabel = (
  inputType: ICustomFieldInputType
): MessageDescriptor => {
  switch (inputType) {
    case 'text':
    case 'title_multiloc':
      return messages.shortAnswer;
    case 'multiline_text':
      return messages.longAnswer;
    case 'multiselect':
      return messages.multipleChoice;
    case 'select':
      return messages.singleChoice;
    case 'page':
      return messages.page;
    case 'number':
      return messages.number;
    case 'linear_scale':
      return messages.linearScale;
    case 'file_upload':
      return messages.fileUpload;
    default:
      return messages.default;
  }
};

export const getTranslatedFieldBadgeLabel = (
  field: IFlatCustomField
): MessageDescriptor => {
  return builtInFieldKeys.includes(field.key)
    ? getBuiltinFieldBadgeLabel(field.key)
    : getCustomFieldBadgeLabel(field.input_type);
};
