import React, { FC } from 'react';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { Icon, IconNames } from 'cl2-component-library';

const Container = styled.div<{ color: string }>`
  height: 28px;
  color: #fff;
  font-size: ${fontSizes.xs}px;
  font-weight: 500;
  line-height: ${fontSizes.xs}px;
  text-transform: uppercase;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${props => colors[props.color] || props.color};
  padding-left: 10px;
  padding-right: 10px;
`;

const StyledIcon = styled(Icon)`
  width: 15px;
  height: 15px;
  margin-right: 6px;
`;

interface Props {
  text: JSX.Element | string;
  color: keyof typeof colors | string;
  icon?: IconNames;
  className?: string;
}

const StatusLabel: FC<Props> = (props) => {
  return (
    <Container
      color={props.color}
      className={props?.className || ''}
    >
      {props.icon && <StyledIcon name={props.icon} />}
      {props.text}
    </Container>
  );
};

export default StatusLabel;
