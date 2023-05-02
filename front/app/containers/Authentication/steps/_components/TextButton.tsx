import React from 'react';
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

export const StyledButton = styled.button`
  font-size: ${fontSizes.base}px;
  color: ${({ theme }) => theme.colors.tenantText};
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => darken(0.2, theme.colors.tenantText)};
    text-decoration: underline;
  }

  cursor: pointer;
  padding: 0px;
  margin-top: 10px;
`;

export default (props: React.HTMLProps<HTMLButtonElement>) => (
  <StyledButton {...(props as any)} />
);
