import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';

import messages from './messages';
import UserManager from './UserManager';
import UsersHeader from './UsersHeader';

const StyledBox = styled(Box)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 1fr;
`;

const Moderators = () => (
  <>
    <UsersHeader title={messages.managers} />
    <UserManager
      canModerate
      canAdmin={false}
      notCitizenlabMember
      includeInactive
    />
    <StyledBox mt="20px">
      <SeatInfo seatType="moderator" />
    </StyledBox>
  </>
);

export default Moderators;
