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
}

const InputType = ({ inputType, required }: Props) => {
  const { formatMessage } = useIntl();
  const inputTypeText = get(messages, inputType.concat('2'), '');

  const requiredOrOptionalText = required
    ? formatMessage(messages.required2)
    : formatMessage(messages.optional2);

  const inputTypeLabel = `${formatMessage(
    inputTypeText
  )} - ${requiredOrOptionalText.toLowerCase()}`;

  return (
    <Text variant="bodyS" color="textSecondary" mt="12px" mb="12px">
      {inputTypeLabel}
    </Text>
  );
};

export default InputType;
