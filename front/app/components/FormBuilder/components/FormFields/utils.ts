// services
import {
  ICustomFieldInputType,
  IFlatCustomField,
} from 'api/custom_fields/types';

// styling
import { colors } from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';

// utils
import { builtInFieldKeys } from 'components/FormBuilder/utils';
import { MessageDescriptor } from 'utils/cl-intl';

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
