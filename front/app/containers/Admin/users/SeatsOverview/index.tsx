import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useBilledAdmins from 'api/users/useBilledAdmins';
import useBilledModerators from 'api/users/useBilledModerators';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const SeatsOverview = () => {
  const { data: billedAdmins } = useBilledAdmins();
  const { data: billedModerators } = useBilledModerators();

  return (
    <Box>
      <Title>
        <FormattedMessage {...messages.seatsOverview} />
      </Title>
      <Title variant="h2">
        <FormattedMessage {...messages.adminSeats} />
      </Title>
      <Title variant="h2">
        <FormattedMessage {...messages.moderatorsSeats} />
      </Title>
    </Box>
  );
};

export default SeatsOverview;
