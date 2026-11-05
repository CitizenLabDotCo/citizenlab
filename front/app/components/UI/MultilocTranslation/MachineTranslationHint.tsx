import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { MultilocTranslation } from './useMultilocTranslation';

interface Props {
  translation: MultilocTranslation;
  // A string, because the component library types locales as strings.
  selectedLocale: string;
}

// Small line under a multiloc input when its selected locale is a machine translation.
const MachineTranslationHint = ({ translation, selectedLocale }: Props) => {
  const { formatMessage } = useIntl();

  if (translation.isError) {
    return (
      <Text color="red600" fontSize="s" m="0" mt="4px">
        {formatMessage(messages.translationFailed)}
      </Text>
    );
  }

  if (!translation.isMachineTranslated(selectedLocale)) return null;

  return (
    <Box display="flex" alignItems="center" gap="4px" mt="4px">
      <Icon
        name="translate"
        width="14px"
        height="14px"
        fill={colors.textSecondary}
      />
      <Text color="textSecondary" fontSize="s" m="0">
        {formatMessage(messages.machineTranslationHint)}
      </Text>
    </Box>
  );
};

export default MachineTranslationHint;
