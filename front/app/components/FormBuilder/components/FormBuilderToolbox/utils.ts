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
  const SCALE_LABELS: Record<
    'matrix_linear_scale' | 'sentiment_linear_scale',
    Record<number, MessageDescriptor>
  > = {
    matrix_linear_scale: {
      1: messages.stronglyDisagree,
      2: messages.disagree,
      3: messages.neutral,
      4: messages.agree,
      5: messages.stronglyAgree,
    },
    sentiment_linear_scale: {
      1: messages.veryBad,
      2: messages.bad,
      3: messages.ok,
      4: messages.good,
      5: messages.veryGood,
    },
  };

  return SCALE_LABELS[inputType]?.[value]
    ? { [locale]: formatMessage(SCALE_LABELS[inputType][value]) }
    : {};
};
