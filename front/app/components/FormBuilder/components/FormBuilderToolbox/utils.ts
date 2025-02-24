import styled from 'styled-components';

import { ICustomFieldInputType } from 'api/custom_fields/types';

import { MessageDescriptor } from 'utils/cl-intl';
import { FormatMessageValues } from 'utils/cl-intl/useIntl';

import messages from '../messages';

export const DraggableElement = styled.div`
  cursor: move;
`;

type InitialLinearScaleLabelProps = {
  value: number;
  inputType: ICustomFieldInputType;
  locale: string;
  formatMessage: (
    messageDescriptor: MessageDescriptor,
    values?: FormatMessageValues
  ) => string;
};

// Function to get the initial default labels for a linear scale field
export const getInitialLinearScaleLabel = ({
  value,
  inputType,
  locale,
  formatMessage,
}: InitialLinearScaleLabelProps) => {
  if (inputType === 'matrix_linear_scale') {
    switch (value) {
      case 1:
        return {
          [locale]: formatMessage(messages.stronglyDisagree),
        };
      case 2:
        return {
          [locale]: formatMessage(messages.disagree),
        };
      case 3:
        return {
          [locale]: formatMessage(messages.neutral),
        };
      case 4:
        return {
          [locale]: formatMessage(messages.agree),
        };
      case 5:
        return {
          [locale]: formatMessage(messages.stronglyAgree),
        };
    }
  } else if (inputType === 'sentiment_linear_scale') {
    switch (value) {
      case 1:
        return {
          [locale]: formatMessage(messages.veryBad),
        };
      case 2:
        return {
          [locale]: formatMessage(messages.bad),
        };
      case 3:
        return {
          [locale]: formatMessage(messages.ok),
        };
      case 4:
        return {
          [locale]: formatMessage(messages.good),
        };
      case 5:
        return {
          [locale]: formatMessage(messages.veryGood),
        };
    }
  }

  return {};
};
