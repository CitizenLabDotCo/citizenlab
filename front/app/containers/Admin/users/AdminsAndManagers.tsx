import React, { useState } from 'react';
import { isString, isEmpty } from 'lodash-es';

import UserManager from './UserManager';
import UsersHeader from './UsersHeader';
import SeatInfo from 'components/SeatInfo';
import { Box } from '@citizenlab/cl2-component-library';

import messages from './messages';

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
      <Box
        py="32px"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
      >
        <SeatInfo seatType="admin" width={null} />
        <SeatInfo seatType="project_manager" width={null} />
      </Box>
    </>
  );
};

export default AllUsers;
