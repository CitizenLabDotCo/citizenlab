import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useBilledSeats from 'api/users/useBilledSeats';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const SeatsOverview = () => {
  const { data: billedAdmins } = useBilledSeats({ seatType: 'admin' });
  const { data: billedModerators } = useBilledSeats({ seatType: 'moderator' });

  console.log({ billedAdmins, billedModerators });

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
