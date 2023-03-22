import React, { useState } from 'react';
import { isString, isEmpty } from 'lodash-es';

import UserManager from './UserManager';
import UsersHeader from './UsersHeader';
import SeatInfo from 'components/SeatInfo';
import { Box } from '@citizenlab/cl2-component-library';
import messages from './messages';
import styled from 'styled-components';

const StyledBox = styled(Box)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 1fr;
`;

const AllUsers = () => {
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
      <UserManager search={search} canModerate notCitizenlabMember />
      <StyledBox>
        <SeatInfo seatType="admin" width={null} />
        <SeatInfo seatType="project_manager" width={null} />
      </StyledBox>
    </>
  );
};

export default AllUsers;
