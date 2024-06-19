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

const Admins = () => (
  <>
    <UsersHeader title={messages.admins} />
    <UserManager canAdmin notCitizenlabMember includeInactive />
    <StyledBox mt="20px">
      <SeatInfo seatType="admin" />
    </StyledBox>
  </>
);

export default Admins;
