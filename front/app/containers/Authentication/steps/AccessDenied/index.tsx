import React from 'react';

import { Box, Text, Button } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onClose: () => void;
}

const AccessDenied = ({ onClose }: Props) => {
  return (
    <Box>
      <Text mt="12px">
        <FormattedMessage {...messages.youDoNotMeetTheRequirements} />
      </Text>
      <Box w="100%" display="flex" justifyContent="flex-end">
        <Button w="auto" mt="16px" buttonStyle="primary" onClick={onClose}>
          <FormattedMessage {...messages.close} />
        </Button>
      </Box>
    </Box>
  );
};

export default AccessDenied;
