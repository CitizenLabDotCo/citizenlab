import React from 'react';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

export const StyledButton = styled.button`
  font-size: ${fontSizes.base}px;
  color: ${colors.textSecondary};
  text-decoration: underline;

  &:hover {
    color: ${colors.textPrimary};
    text-decoration: underline;
  }

  cursor: pointer;
  padding: 0px;
`;

export default (props: React.HTMLProps<HTMLButtonElement>) => (
  <StyledButton {...(props as any)} />
);
