import React, { useState } from 'react';

import { Box, Title, colors } from '@citizenlab/cl2-component-library';

import SeatInfo, {
  TSeatType,
} from 'components/admin/SeatBasedBilling/SeatInfo';
import GoBackButton from 'components/UI/GoBackButton';
import Tabs, { ITabItem } from 'components/UI/Tabs';
import UsersTable from 'components/UsersTable';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

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
        <GoBackButton linkTo="/admin/users" />
        <Title>
          <FormattedMessage {...messages.seatsOverview} />
        </Title>
        <Box mb="20px">
          <Tabs
            items={seatTypeTabs}
            selectedValue={selectedTab}
            onClick={(name: TSeatType) => setSelectedTab(name)}
          />
        </Box>
        <SeatInfo seatType={selectedTab} mb="20px" />
        <UsersTable seatType={selectedTab} />
      </Box>
    </Box>
  );
};

export default SeatsOverview;
