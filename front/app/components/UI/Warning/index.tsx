import React from 'react';

import {
  Icon,
  IconNames,
  colors,
  fontSizes,
  isRtl,
} from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';

const Container = styled.div<{ background: string }>`
  display: flex;
  align-items: center;
  padding: 14px;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${(props) => props.background};

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.teal700};
  padding: 0px;
  margin: 0px;
  margin-right: 10px;

  ${isRtl`
    margin-right: 0;
    margin-left: 10px;
  `}
`;

const Text = styled.div`
  color: ${colors.teal700};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;

  a,
  button {
    color: ${colors.teal700};
    font-weight: 400;
    text-decoration: underline;
    display: inline-block;
    padding: 0;
    margin: 0;
    border: none;
    cursor: pointer;
    outline: none;
    transition: all 100ms ease-out;

    &.focus-visible {
      outline: solid 2px #000;
    }

    &:hover {
      color: ${darken(0.15, colors.teal700)};
      text-decoration: underline;
    }
  }

  strong {
    font-weight: 600;
  }
`;

export interface Props {
  children: string | JSX.Element;
  icon?: IconNames;
  className?: string;
  type?: 'caution' | 'info';
}

const Warning = ({ children, icon, className, type = 'info' }: Props) => {
  const usedIcon = icon || (type === 'info' ? 'info-outline' : 'warning');
  const background = type === 'info' ? colors.teal100 : '#FFF3CD';
  return (
    <Container className={`${className || ''}`} background={background}>
      <StyledIcon name={usedIcon} />
      <Text>{children}</Text>
    </Container>
  );
};

export default Warning;
