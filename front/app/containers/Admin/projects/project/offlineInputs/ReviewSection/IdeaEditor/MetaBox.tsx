import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { Locale } from 'typings';

interface Props {
  phaseName?: string;
  locale?: Locale;
}

const MetaBox = ({ phaseName, locale }: Props) => {
  return (
    <Box
      w="90%"
      borderBottom={`1px solid ${colors.borderLight}`}
      mb="20px"
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
