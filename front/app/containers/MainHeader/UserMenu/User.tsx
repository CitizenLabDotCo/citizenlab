import React from 'react';
import styled, { useTheme } from 'styled-components';
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';
import { isNilOrError } from 'utils/helperUtils';

// style
import { colors, media, fontSizes } from 'utils/styleUtils';
import useAuthUser from 'hooks/useAuthUser';

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

  return (
    <>
      <UserNameContainer>
        <StyledUserName
          color={theme.navbarTextColor || theme.colors.tenantText}
          userId={userId}
          hideLastName
        />
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
