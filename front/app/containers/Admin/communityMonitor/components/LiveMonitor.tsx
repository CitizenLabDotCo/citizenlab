import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const LiveMonitor = () => {
  return (
    <Box mt="48px">
      <Title color="primary">
        <FormattedMessage {...messages.communityMonitorLabel} />
      </Title>
    </Box>
  );
};

export default LiveMonitor;
