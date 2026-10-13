import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import orMessages from 'components/UI/Or/messages';

import { useIntl } from 'utils/cl-intl';

const OrDivider = () => {
  const { formatMessage } = useIntl();
  const line = <Box flex="1" h="1px" background={colors.grey200} />;

  return (
    <Box display="flex" alignItems="center" gap="12px" aria-hidden>
      {line}
      <Text variant="boMicro" color="coolGrey500" m="0px">
        {formatMessage(orMessages.or)}
      </Text>
      {line}
    </Box>
  );
};

export default OrDivider;
