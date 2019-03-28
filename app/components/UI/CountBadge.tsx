import React, { memo } from 'react';
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
  margin-left: 6px;

  color: #FFFFFF;
  background: ${(props: any) => props.bgColor ? props.bgColor : colors.clRed};
`;

interface Props {
  count: number;
  bgColor?: string;
}

export default memo<Props>(props => {
  const { count, bgColor } = props;
  if (count > 0) {
    return (
      <Container bgColor={bgColor}>
        {count}
      </Container>
    );
  } else {
     return null;
  }
});
