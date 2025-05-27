import { IFlatCustomField } from 'api/custom_fields/types';

import { get } from 'utils/helperUtils';

type ValidLabelNumbers = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

const isValidLabelNumber = (
  labelNumber: number
): labelNumber is ValidLabelNumbers => labelNumber >= 1 && labelNumber <= 11;

export const getLinearScaleLabel = (
  question: IFlatCustomField,
  labelNumber: number
) => {
  if (!isValidLabelNumber(labelNumber)) return undefined;
  const label = get(question, `linear_scale_label_${labelNumber}_multiloc`);
  return label;
};
