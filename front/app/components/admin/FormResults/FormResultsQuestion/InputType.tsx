import React from 'react';

import { BoxMarginProps, Text } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';

import messages from 'containers/Admin/projects/project/nativeSurvey/messages';

import { useIntl } from 'utils/cl-intl';

import inputTypeMessages from '../messages';

interface Props {
  inputType: string;
  required: boolean;
  totalSubmissions: number;
  totalResponses: number;
  logic?: boolean;
}

const InputType = ({
  inputType,
  required,
  totalResponses,
  totalSubmissions,
  ...props
}: Props & BoxMarginProps) => {
  const { formatMessage } = useIntl();
  const inputTypeText = get(messages, inputType, '');

  const requiredOrOptionalText = required
    ? formatMessage(inputTypeMessages.required)
    : formatMessage(inputTypeMessages.optional);

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const inputTypeLabel = inputTypeText
    ? `${totalResponses}/${totalSubmissions} - ${formatMessage(
        inputTypeText
      )} - ${requiredOrOptionalText.toLowerCase()}`
    : '';

  return (
    <Text variant="bodyS" color="textSecondary" mt="12px" mb="12px" {...props}>
      {inputTypeLabel}
    </Text>
  );
};

export default InputType;
