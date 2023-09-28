import { IconNames } from '@citizenlab/cl2-component-library';
import { ICustomFieldInputType } from 'api/custom_fields/types';
import { builtInFieldKeys } from 'components/FormBuilder/utils';

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
