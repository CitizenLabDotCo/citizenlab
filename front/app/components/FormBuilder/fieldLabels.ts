import { MessageDescriptor } from 'react-intl';

import { ICustomFieldInputType } from 'api/custom_fields/types';

import messages from './components/messages';

// Kept apart from ../utils, which imports the settings components (and through
// them the map page), so pages that only need field labels stay light.
export const builtInFieldKeys = [
  'title_multiloc',
  'body_multiloc',
  'proposed_budget',
  'topic_ids',
  'location_description',
  'idea_images_attributes',
  'idea_files_attributes',
  'cosponsor_ids',
];

export type BuiltInKeyType = (typeof builtInFieldKeys)[number];

const getBuiltInFieldStringKey = (
  key: string
): MessageDescriptor | undefined => {
  let translatedStringKey: MessageDescriptor | undefined;
  switch (key) {
    case 'title_multiloc':
      translatedStringKey = messages.title;
      break;
    case 'body_multiloc':
      translatedStringKey = messages.description;
      break;
    case 'location_description':
      translatedStringKey = messages.locationDescription;
      break;
    case 'idea_images_attributes':
      translatedStringKey = messages.imageFileUpload;
      break;
    case 'idea_files_attributes':
      translatedStringKey = messages.fileUpload;
      break;
    case 'topic_ids':
      translatedStringKey = messages.tags;
      break;
    case 'cosponsor_ids':
      translatedStringKey = messages.cosponsors;
      break;
    case 'proposed_budget':
      translatedStringKey = messages.proposedBudget;
      break;
  }

  return translatedStringKey;
};

const getInputTypeStringKey = (
  inputType: ICustomFieldInputType
): MessageDescriptor | undefined => {
  let translatedStringKey: MessageDescriptor | undefined;
  switch (inputType) {
    case 'title_multiloc':
      translatedStringKey = messages.title;
      break;
    case 'text':
      translatedStringKey = messages.shortAnswer;
      break;
    case 'multiline_text':
      translatedStringKey = messages.longAnswer;
      break;
    case 'select':
      translatedStringKey = messages.singleChoice;
      break;
    case 'multiselect':
      translatedStringKey = messages.multipleChoice;
      break;
    case 'multiselect_image':
      translatedStringKey = messages.multipleChoiceImage;
      break;
    case 'page':
      translatedStringKey = messages.page;
      break;
    case 'number':
      translatedStringKey = messages.number;
      break;
    case 'linear_scale':
      translatedStringKey = messages.linearScale;
      break;
    case 'rating':
      translatedStringKey = messages.rating;
      break;
    case 'file_upload':
      translatedStringKey = messages.fileUpload;
      break;
    case 'shapefile_upload':
      translatedStringKey = messages.shapefileUpload;
      break;
    case 'point':
      translatedStringKey = messages.dropPin;
      break;
    case 'line':
      translatedStringKey = messages.drawRoute;
      break;
    case 'polygon':
      translatedStringKey = messages.drawArea;
      break;
    case 'multipoint':
      translatedStringKey = messages.dropMultiplePins;
      break;
    case 'ranking':
      translatedStringKey = messages.ranking;
      break;
    case 'matrix_linear_scale':
      translatedStringKey = messages.matrix;
      break;
    case 'sentiment_linear_scale':
      translatedStringKey = messages.sentiment;
      break;
  }

  return translatedStringKey;
};

export const getTranslatedStringKey = (
  inputType: ICustomFieldInputType,
  key: string
): MessageDescriptor | undefined => {
  return builtInFieldKeys.includes(key)
    ? getBuiltInFieldStringKey(key)
    : getInputTypeStringKey(inputType);
};
