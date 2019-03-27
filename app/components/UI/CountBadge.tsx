import React from 'react';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const Container: any = styled.span`
  position: absolute;
  padding-left: 3px;
  padding-right: 3px;
  min-width: 17px;
  height: 17px;
  font-size: ${fontSizes.small}px;
  font-weight: 600;
  line-height: 17px;
  text-align: center;
  border-radius: 3px;
  margin-left: 7px;

  color: #FFFFFF;
  background: ${(props: any) => props.bgColor ? props.bgColor : colors.clRed};
`;

interface Props {
  count: number;
  bgColor?: string;
}

export default (props: Props) => (
  <Container bgColor={props.bgColor}>
    {props.count}
  </Container>
);
