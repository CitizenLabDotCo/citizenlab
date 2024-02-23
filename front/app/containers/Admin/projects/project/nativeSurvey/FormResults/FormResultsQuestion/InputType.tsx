import React from 'react';

// components
import { Text } from '@citizenlab/cl2-component-library';

// i18n
import messages from '../../messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { get } from 'lodash-es';

interface Props {
  inputType: string;
  required: boolean;
  totalSubmissions: number;
  totalResponses: number;
}

const InputType = ({
  inputType,
  required,
  totalResponses,
  totalSubmissions,
}: Props) => {
  const { formatMessage } = useIntl();
  const inputTypeText = get(messages, inputType, '');

  const requiredOrOptionalText = required
    ? formatMessage(messages.required)
    : formatMessage(messages.optional);

  const inputTypeLabel = `${totalResponses}/${totalSubmissions} - ${formatMessage(
    inputTypeText
  )} - ${requiredOrOptionalText.toLowerCase()}`;

  return (
    <Text variant="bodyS" color="textSecondary" mt="12px" mb="12px">
      {inputTypeLabel}
    </Text>
  );
};

export default InputType;
