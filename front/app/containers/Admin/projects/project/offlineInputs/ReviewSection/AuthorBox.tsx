import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  authorName?: string;
  authorEmail?: string;
}

const AuthorBox = ({ authorName, authorEmail }: Props) => {
  return (
    <Box
      w="90%"
      mb="20px"
      borderBottom={`1px solid ${colors.borderLight}`}
      display="flex"
    >
      <Box pr="12px">
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
        {authorName && <Text>{authorName}</Text>}
        {authorEmail && <Text mt="0">{authorEmail}</Text>}
      </Box>
    </Box>
  );
};

export default AuthorBox;
