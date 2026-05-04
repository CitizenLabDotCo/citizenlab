import React, { useState } from 'react';

import { Box, Title, colors } from '@citizenlab/cl2-component-library';

import useBilledSeats from 'api/users/useBilledSeats';

import SeatInfo, {
  TSeatType,
} from 'components/admin/SeatBasedBilling/SeatInfo';
import UsersTable from 'components/admin/UsersTable';
import Pagination from 'components/Pagination';
import GoBackButton from 'components/UI/GoBackButton';
import Tabs, { ITabItem } from 'components/UI/Tabs';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from './messages';

const SeatsOverview = () => {
  const { formatMessage } = useIntl();
  const [selectedTab, setSelectedTab] = useState<TSeatType>('admin');
  const [pageNumberAdmin, setPageNumberAdmin] = useState(1);
  const [pageNumberModerator, setPageNumberModerator] = useState(1);

  const { data: billedUsers } = useBilledSeats({
    seatType: selectedTab,
    'page[number]':
      selectedTab === 'admin' ? pageNumberAdmin : pageNumberModerator,
  });

  if (!billedUsers) return null;

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

  const pageNumber =
    selectedTab === 'admin' ? pageNumberAdmin : pageNumberModerator;
  const lastPage = getPageNumberFromUrl(billedUsers.links.last);

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
        <GoBackButton to="/$locale/admin/users" />
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
        <Box mb="40px">
          <UsersTable users={billedUsers.data} />
          <Box mt="12px" display="flex" justifyContent="flex-start">
            <Pagination
              currentPage={pageNumber}
              totalPages={lastPage ?? 1}
              loadPage={(pageNumber: number) => {
                if (selectedTab === 'admin') {
                  setPageNumberAdmin(pageNumber);
                } else {
                  setPageNumberModerator(pageNumber);
                }
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SeatsOverview;
