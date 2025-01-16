import React from 'react';

import { colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

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
  logic,
}: Props) => {
  const { formatMessage } = useIntl();
  const inputTypeText = get(messages, inputType, '');

  const requiredOrOptionalText = required
    ? formatMessage(messages.required)
    : formatMessage(messages.optional);

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const inputTypeLabel = inputTypeText
    ? `${totalResponses}/${totalSubmissions} - ${formatMessage(
        inputTypeText
      )} - ${requiredOrOptionalText.toLowerCase()}`
    : '';

  return (
    <Text variant="bodyS" color="textSecondary" mt="12px" mb="12px">
      {inputTypeLabel}
      {logic && (
        <Icon
          fill={colors.coolGrey500}
          width="18px"
          name="logic"
          my="auto"
          ml="12px"
        />
      )}
    </Text>
  );
};

export default InputType;
