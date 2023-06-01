import React from 'react';
import styled from 'styled-components';
import { ClickableTextStyles } from './TextLink';

export const StyledButton = styled.button`
  ${ClickableTextStyles}

  cursor: pointer;
  padding: 0px;
  margin-top: 12px;
`;

export default (props: React.HTMLProps<HTMLButtonElement>) => (
  <StyledButton {...(props as any)} />
);
