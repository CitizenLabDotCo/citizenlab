import React from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';
import styled from 'styled-components';

import OriginalLink from 'utils/cl-router/Link';

const StyledLink = styled(OriginalLink)<{
  color: string;
}>`
  font-size: ${fontSizes.base}px;
  color: ${({ color }) => color};

  &:hover {
    color: ${({ color }) => color};
    text-decoration: underline;
  }
`;

interface Props {
  to: RouteType;
  color?: string;
  children: React.ReactNode;
}

const Link = ({ to, color = colors.black, children }: Props) => {
  return (
    <StyledLink to={to} color={color}>
      {children}
    </StyledLink>
  );
};

export default Link;
