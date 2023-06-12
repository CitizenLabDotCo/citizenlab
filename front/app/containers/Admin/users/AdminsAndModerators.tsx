import React from 'react';

import UserManager from './UserManager';
import UsersHeader from './UsersHeader';
import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';
import { Box } from '@citizenlab/cl2-component-library';
import messages from './messages';
import styled from 'styled-components';

const StyledBox = styled(Box)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 1fr;
`;

const AdminsAndModerators = () => (
  <>
    <UsersHeader
      title={messages.adminsAndManagers}
      subtitle={messages.adminsAndManagersSubtitle}
    />
    <UserManager canModerate notCitizenlabMember includeInactive />
    <StyledBox mt="20px">
      <SeatInfo seatType="admin" />
      <SeatInfo seatType="moderator" />
    </StyledBox>
  </>
);

export default AdminsAndModerators;
