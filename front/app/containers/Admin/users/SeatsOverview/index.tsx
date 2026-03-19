import React, { useState } from 'react';

import { Box, Title, colors } from '@citizenlab/cl2-component-library';

import SeatInfo, {
  TSeatType,
} from 'components/admin/SeatBasedBilling/SeatInfo';
import GoBackButton from 'components/UI/GoBackButton';
import Tabs, { ITabItem } from 'components/UI/Tabs';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';
import Table from './Table';

const SeatsOverview = () => {
  const { formatMessage } = useIntl();
  const [selectedTab, setSelectedTab] = useState<TSeatType>('admin');

  const seatTypeTabs: ITabItem[] = [
    {
      name: 'admin',
      label: formatMessage(messages.admins),
    },
    {
      name: 'moderator',
      label: formatMessage(messages.managers),
    },
  ];

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
        <Tabs
          items={seatTypeTabs}
          selectedValue={selectedTab}
          onClick={(name: TSeatType) => setSelectedTab(name)}
        />
        <Box mb="20px" mt="12px">
          <SeatInfo seatType={selectedTab} />
        </Box>
        <Table seatType={selectedTab} />
      </Box>
    </Box>
  );
};

export default SeatsOverview;
