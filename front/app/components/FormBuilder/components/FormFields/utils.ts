import { colors } from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';

import {
  ICustomFieldInputType,
  IFlatCustomField,
} from 'api/custom_fields/types';

import { builtInFieldKeys } from 'components/FormBuilder/utils';

import { MessageDescriptor } from 'utils/cl-intl';

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
  } else if (field.input_type === 'page') {
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
    case 'cosponsor_ids':
      return messages.cosponsors;
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
    case 'multiselect_image':
      return messages.multipleChoiceImage;
    case 'select':
      return messages.singleChoice;
    case 'page':
      return messages.page;
    case 'number':
      return messages.number;
    case 'linear_scale':
      return messages.linearScale;
    case 'rating':
      return messages.rating;
    case 'shapefile_upload':
      return messages.shapefileUpload;
    case 'file_upload':
      return messages.fileUpload;
    case 'point':
      return messages.dropPin;
    case 'line':
      return messages.drawRoute;
    case 'polygon':
      return messages.drawArea;
    case 'ranking':
      return messages.ranking;
    case 'matrix_linear_scale':
      return messages.matrix;
    case 'sentiment_linear_scale':
      return messages.sentiment;
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
