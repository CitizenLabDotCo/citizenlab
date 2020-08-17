import React from 'react';
import styled, { withTheme } from 'styled-components';
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
  theme: any;
  userId: string;
  isVerified: boolean;
}

const User = ({ theme, userId, isVerified }: Props) => {
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
        size="30px"
        hasHoverEffect={false}
        fillColor={
          theme && theme.navbarTextColor ? theme.navbarTextColor : colors.label
        }
        verified
      />
    </>
  );
};

export default withTheme(User);
