import React, { useMemo } from 'react';

import { Box, Title, colors } from '@citizenlab/cl2-component-library';

import useBilledSeats from 'api/users/useBilledSeats';

import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

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
    <Box
      bgColor={colors.white}
      w="100%"
      h="100vh"
      py="45px"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Box px="51px" maxWidth="1400px" w="100%">
        <GoBackButton
          onClick={() => {
            clHistory.goBack();
          }}
        />
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
    </Box>
  );
};

export default SeatsOverview;
