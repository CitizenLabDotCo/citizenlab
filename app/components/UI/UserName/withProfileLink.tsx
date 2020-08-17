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

function withProfileLink(
  UserNameComponent: JSX.Element,
  profileLink: string,
  className?: string
) {
  return (
    <StyledLink
      to={profileLink}
      className={`e2e-author-link ${className || ''}`}
    >
      {UserNameComponent}
    </StyledLink>
  );
}

export default withProfileLink;
