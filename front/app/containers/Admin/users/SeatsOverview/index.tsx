import React, { useMemo } from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useBilledSeats from 'api/users/useBilledSeats';

import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import Table from './Table';

const SeatsOverview = () => {
  const { data: billedAdminsData } = useBilledSeats({ seatType: 'admin' });
  const { data: billedModeratorsData } = useBilledSeats({
    seatType: 'moderator',
  });

  const billedAdmins = useMemo(
    () => billedAdminsData?.pages.flatMap((page) => page.data) ?? [],
    [billedAdminsData?.pages]
  );

  const billedModerators = useMemo(
    () => billedModeratorsData?.pages.flatMap((page) => page.data) ?? [],
    [billedModeratorsData?.pages]
  );

  return (
    <Box>
      <Title>
        <FormattedMessage {...messages.seatsOverview} />
      </Title>
      <Title variant="h2">
        <FormattedMessage {...messages.adminSeats} />
      </Title>
      <Box mb="20px">
        <SeatInfo seatType="admin" />
      </Box>
      <Table users={billedAdmins} />
      <Title variant="h2" mt="40px">
        <FormattedMessage {...messages.moderatorsSeats} />
      </Title>
      <Box mb="20px">
        <SeatInfo seatType="moderator" />
      </Box>
      <Table users={billedModerators} />
    </Box>
  );
};

export default SeatsOverview;
