import React from 'react';
import styled from 'styled-components';
import Link from 'utils/cl-router/Link';

// styles
import { darken } from 'polished';

const StyledLink = styled(Link)`
  transition: all 80ms ease-out;

  &:hover {
    cursor: pointer;
    color: ${({ color, theme }) => darken(0.15, color || theme.colorText)};
    text-decoration: underline;
  }
`;

interface Props {
  className?: string;
  profileLink: string;
  children: JSX.Element;
}

const ProfileLink = ({ className, profileLink, children }: Props) => {
  return (
    <StyledLink
      to={profileLink}
      className={className}
    >
      {children}
    </StyledLink>
  );
}

export default ProfileLink;
