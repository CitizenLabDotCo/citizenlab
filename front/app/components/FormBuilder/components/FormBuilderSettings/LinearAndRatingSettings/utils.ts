import { ICustomFieldInputType } from 'api/custom_fields/types';

const SCALE_OFFSETS: Partial<Record<ICustomFieldInputType, number>> = {
  sentiment_linear_scale: -2, // We show a scale of from -2 in the UI for sentiment scales.
};

export const getNumberLabelForIndex = (
  inputType: ICustomFieldInputType,
  index: number
) => {
  return (SCALE_OFFSETS[inputType] ?? 1) + index;
};
