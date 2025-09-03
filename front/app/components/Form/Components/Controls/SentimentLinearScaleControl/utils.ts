import { ControlElement } from '@jsonforms/core';
import { MessageDescriptor } from 'react-intl';

import { FormatMessageValues } from 'utils/cl-intl/useIntl';

import messages from '../messages';

type GetAriaValueTextProps = {
  uischema: ControlElement;
  formatMessage: (
    messageDescriptor: MessageDescriptor,
    values?: FormatMessageValues
  ) => string;
  value: number;
  total: number;
};

export const getAriaValueText = ({
  uischema,
  formatMessage,
  value,
  total,
}: GetAriaValueTextProps) => {
  // If the value has a label, read it out
  if (uischema.options?.[`linear_scale_label${value}`]) {
    return formatMessage(messages.valueOutOfTotalWithLabel, {
      value,
      total,
      label: uischema.options[`linear_scale_label${value}`],
    });
  }
  // If we don't have a label but we do have a maximum, read out the current value & maximum label
  else if (uischema.options?.[`linear_scale_label${5}`]) {
    return formatMessage(messages.valueOutOfTotalWithMaxExplanation, {
      value,
      total,
      maxValue: 5,
      maxLabel: uischema.options[`linear_scale_label${5}`],
    });
  }
  // Otherwise, just read out the value and the maximum value
  return formatMessage(messages.valueOutOfTotal, { value, total });
};
