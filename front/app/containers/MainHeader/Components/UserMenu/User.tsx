import React from 'react';

import { colors, media, fontSizes } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';

import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

import { isNilOrError } from 'utils/helperUtils';

import VerificationBadge from './VerificationBadge';

const UserNameContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 5px;
`;

const StyledUserName = styled(UserName)`
  margin-right: 4px;
  white-space: nowrap;
  font-size: ${fontSizes.base}px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  transition: all 100ms ease-out;

  ${media.phone`
    display: none;
  `}
`;

interface Props {
  userId: string;
  showVerificationBadge?: boolean;
}

const User = ({ userId, showVerificationBadge = true }: Props) => {
  const theme = useTheme();
  const { data: authUser } = useAuthUser();

  if (isNilOrError(authUser)) {
    return null;
  }

  const isVerified =
    typeof authUser.data.attributes.verified === 'boolean'
      ? authUser.data.attributes.verified
      : false;

  return (
    <>
      <UserNameContainer>
        <StyledUserName
          color={theme.navbarTextColor || theme.colors.tenantText}
          userId={userId}
          hideLastName
        />
        {showVerificationBadge && <VerificationBadge isVerified={isVerified} />}
      </UserNameContainer>

      <Avatar
        userId={userId}
        size={30}
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        fillColor={theme?.navbarTextColor || colors.textSecondary}
        addVerificationBadge
      />
    </>
  );
};

export default User;
