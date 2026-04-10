import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useFeatureFlag from 'hooks/useFeatureFlag';

import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';

import UserManager from '../_shared/UserManager';
import UsersHeader from '../_shared/UsersHeader';
import messages from '../messages';

const StyledBox = styled(Box)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 1fr;
`;

const SpaceModerators = () => {
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  if (!spacesEnabled) return null;

  return (
    <>
      <UsersHeader title={messages.spaceManagers} />
      <UserManager spaceModeratorsOnly notCitizenlabMember includeInactive />
      <StyledBox mt="20px">
        <SeatInfo seatType="moderator" />
      </StyledBox>
    </>
  );
};

export default SpaceModerators;
