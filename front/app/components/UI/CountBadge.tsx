import React, { memo } from 'react';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const Container = styled.span<{ bgColor: Props['bgColor'] }>`
  padding: 0 3px;
  min-width: 16px;
  height: 16px;
  font-size: ${fontSizes.xs}px;
  font-weight: 500;
  border-radius: 3px;
  margin-left: 6px;
  display: flex;
  align-items: center;
  justify-content: center;

  color: #ffffff;
  background: ${(props) => (props.bgColor ? props.bgColor : colors.error)};
`;

interface Props {
  count: number;
  bgColor?: string;
}

export default memo<Props>((props) => {
  const { count, bgColor } = props;
  if (count > 0) {
    return <Container bgColor={bgColor}>{count}</Container>;
  } else {
    return null;
  }
});
