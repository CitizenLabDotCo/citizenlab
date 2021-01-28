import React from 'react';
import styled, { useTheme } from 'styled-components';
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';
import VerificationBadge from './VerificationBadge';

// style
import { colors, media, fontSizes } from 'utils/styleUtils';

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

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const StyledAvatar = styled(Avatar)``;

interface Props {
  userId: string;
  isVerified: boolean;
}

const User = ({ userId, isVerified }: Props) => {
  const theme: any = useTheme();
  return (
    <>
      <UserNameContainer>
        <StyledUserName
          color={theme.navbarTextColor || theme.colorText}
          userId={userId}
          hideLastName
        />
        <VerificationBadge isVerified={isVerified} />
      </UserNameContainer>

      <StyledAvatar
        userId={userId}
        size={30}
        fillColor={theme?.navbarTextColor || colors.label}
        addVerificationBadge
      />
    </>
  );
};

export default User;
