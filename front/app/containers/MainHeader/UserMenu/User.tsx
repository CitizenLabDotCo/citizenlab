import React from 'react';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';
// style
import { colors, media, fontSizes } from 'utils/styleUtils';
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';
import styled, { useTheme } from 'styled-components';
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
}

const User = ({ userId }: Props) => {
  const theme = useTheme();
  const authUser = useAuthUser();

  if (isNilOrError(authUser)) {
    return null;
  }

  const isVerified =
    typeof authUser.attributes.verified === 'boolean'
      ? authUser.attributes.verified
      : false;

  return (
    <>
      <UserNameContainer>
        <StyledUserName
          color={theme.navbarTextColor || theme.colors.tenantText}
          userId={userId}
          hideLastName
        />
        <VerificationBadge isVerified={isVerified} />
      </UserNameContainer>

      <Avatar
        userId={userId}
        size={30}
        fillColor={theme?.navbarTextColor || colors.textSecondary}
        addVerificationBadge
      />
    </>
  );
};

export default User;
