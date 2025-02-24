import { ICustomFieldInputType } from 'api/custom_fields/types';

export const getNumberLabelForIndex = (
  inputType: ICustomFieldInputType,
  index: number
) => {
  if (inputType === 'sentiment_linear_scale') {
    return index - 2; // We show a scale of -2 to 2 in the UI for sentiment scales.
  }
  return index + 1; // Show a scale of 1 to 11 in the UI for other field types.
};
