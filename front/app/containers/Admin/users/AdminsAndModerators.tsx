import React, { useState } from 'react';
import { isString, isEmpty } from 'lodash-es';

import UserManager from './UserManager';
import UsersHeader from './UsersHeader';
import SeatInfo from 'components/SeatBasedBilling/SeatInfo';
import { Box } from '@citizenlab/cl2-component-library';
import messages from './messages';
import styled from 'styled-components';

const StyledBox = styled(Box)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 1fr;
`;

const AdminsAndModerators = () => {
  const [search, setSearch] = useState<string | undefined>(undefined);

  const searchUser = (searchTerm: string) => {
    setSearch(isString(searchTerm) && !isEmpty(searchTerm) ? searchTerm : '');
  };

  return (
    <>
      <UsersHeader
        onSearch={searchUser}
        title={messages.adminsAndManagers}
        subtitle={messages.adminsAndManagersSubtitle}
      />
      <UserManager
        search={search}
        canModerate
        notCitizenlabMember
        includeInactive
      />
      <StyledBox mt="20px">
        <SeatInfo seatType="admin" />
        <SeatInfo seatType="moderator" />
      </StyledBox>
    </>
  );
};

export default AdminsAndModerators;
