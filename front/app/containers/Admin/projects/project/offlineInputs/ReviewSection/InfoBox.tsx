import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { Locale } from 'typings';

interface Props {
  phaseName?: string;
  authorName?: string;
  authorEmail?: string;
  locale?: Locale;
}

const InfoBox = ({ phaseName, authorName, authorEmail, locale }: Props) => {
  return (
    <Box
      w="90%"
      mb="20px"
      borderBottom={`1px solid ${colors.borderLight}`}
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
        {authorName && (
          <Text fontWeight="bold">
            <FormattedMessage {...messages.author} />
          </Text>
        )}
        {authorEmail && (
          <Text fontWeight="bold">
            <FormattedMessage {...messages.email} />
          </Text>
        )}
      </Box>
      <Box>
        {phaseName && <Text>{phaseName}</Text>}
        {locale && <Text>{locale}</Text>}
        {authorName && <Text>{authorName}</Text>}
        {authorEmail && <Text mt="0">{authorEmail}</Text>}
      </Box>
    </Box>
  );
};

export default InfoBox;
