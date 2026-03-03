import React from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';
import styled from 'styled-components';

import OriginalLink from 'utils/cl-router/Link';

const StyledLink = styled(OriginalLink)`
  font-size: ${fontSizes.base}px;
  color: ${colors.black};

  &:hover {
    color: ${colors.black};
    text-decoration: underline;
  }
`;

interface Props {
  to: RouteType;
  children: React.ReactNode;
}

const Link = ({ to, children }: Props) => {
  return <StyledLink to={to}>{children}</StyledLink>;
};

export default Link;
