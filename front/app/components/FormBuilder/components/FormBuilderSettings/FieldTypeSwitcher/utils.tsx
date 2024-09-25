import { ICustomFieldInputType } from 'api/custom_fields/types';

import messages from '../../messages';

export const getFieldSwitchOptions = (
  inputType: ICustomFieldInputType,
  formatMessage
) => {
  switch (inputType) {
    case 'select':
    case 'multiselect':
      return [
        { value: 'select', label: formatMessage(messages.singleChoice) },
        { value: 'multiselect', label: formatMessage(messages.multipleChoice) },
      ];
    case 'text':
    case 'multiline_text':
      return [
        { value: 'text', label: formatMessage(messages.shortAnswer) },
        { value: 'multiline_text', label: formatMessage(messages.longAnswer) },
      ];
    default:
      return [];
  }
};
