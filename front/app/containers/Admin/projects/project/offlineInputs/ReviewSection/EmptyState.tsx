import React from 'react';
import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import { colors, stylingConsts } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import sharedMessages from '../messages';

const EmptyState = () => {
  return (
    <Box
      w="100%"
      h="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px="50px"
    >
      <Box
        w="100%"
        maxWidth="500px"
        h="200px"
        bgColor={colors.white}
        borderRadius={stylingConsts.borderRadius}
        boxShadow={`0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)`}
        px="20px"
      >
        <Title variant="h1" color="primary">
          <FormattedMessage {...sharedMessages.inputImporter} />
        </Title>
        <Text>
          <FormattedMessage
            {...messages.noIdeasYet}
            values={{
              importFile: <FormattedMessage {...sharedMessages.importFile} />,
            }}
          />
        </Text>
      </Box>
    </Box>
  );
};

export default EmptyState;
