import React from 'react';
import Link, { Props } from 'utils/cl-router/Link';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

export const StyledLink = styled(Link)`
  font-size: ${fontSizes.base}px;
  color: ${colors.textSecondary};
  text-decoration: underline;

  &:hover {
    color: ${colors.textPrimary};
    text-decoration: underline;
  }
`;

export default (props: Props) => <StyledLink {...props} />;
