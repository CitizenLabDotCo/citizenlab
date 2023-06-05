import React from 'react';
import Link, { Props } from 'utils/cl-router/Link';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

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
