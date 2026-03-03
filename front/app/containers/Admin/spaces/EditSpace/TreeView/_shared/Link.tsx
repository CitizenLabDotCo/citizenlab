import React from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';
import styled from 'styled-components';

import OriginalLink from 'utils/cl-router/Link';

const StyledLink = styled(OriginalLink)<{
  color: string;
  crossedOut?: boolean;
}>`
  font-size: ${fontSizes.base}px;
  color: ${({ color }) => color};

  &:hover {
    color: ${({ color }) => color};
    text-decoration: underline;
  }

  ${({ crossedOut }) => (crossedOut ? 'text-decoration: line-through;' : '')}
`;

interface Props {
  to: RouteType;
  color?: string;
  crossedOut?: boolean;
  children: React.ReactNode;
}

const Link = ({ to, color = colors.black, crossedOut, children }: Props) => {
  return (
    <StyledLink to={to} color={color} crossedOut={crossedOut}>
      {children}
    </StyledLink>
  );
};

export default Link;
