import React from 'react';

import { fontSizes, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import Link, { Props } from 'utils/cl-router/Link';

export const ClickableTextStyles = `
  font-size: ${fontSizes.base}px;
  color: ${colors.textSecondary};
  text-decoration: underline;

  &:hover {
    color: ${colors.textPrimary};
    text-decoration: underline;
  }
`;
export const StyledLink = styled(Link)`${ClickableTextStyles}}`;

export default (props: Props) => <StyledLink {...props} />;
