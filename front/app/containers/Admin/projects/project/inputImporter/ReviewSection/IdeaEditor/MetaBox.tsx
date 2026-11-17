import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { SupportedLocale } from 'typings';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  phaseName?: string;
  locale?: SupportedLocale;
}

const MetaBox = ({ phaseName, locale }: Props) => {
  return (
    <Box
      w="90%"
      borderBottom={`1px solid ${colors.borderLight}`}
      mb="10px"
      display="flex"
    >
      <Box pr="12px">
        {phaseName && (
          <Text fontWeight="bold">
            <FormattedMessage {...messages.phase} />
          </Text>
        )}
        {locale && (
          <Text fontWeight="bold">
            <FormattedMessage {...messages.locale} />
          </Text>
        )}
      </Box>
      <Box>
        {phaseName && <Text>{phaseName}</Text>}
        {locale && <Text>{locale}</Text>}
      </Box>
    </Box>
  );
};

export default MetaBox;
