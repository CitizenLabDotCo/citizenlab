import React from 'react';

import { lighten } from 'polished';
import styled, { keyframes } from 'styled-components';

import { colors } from '../../utils/styleUtils';
import Box, { BoxProps } from '../Box';

const shimmerAnimation = keyframes`
  to {
    background-position-x: 0%;
  }
`;

const ShimmerBox = styled(Box)<{ $bgColor: string }>`
  ${({ $bgColor }) => {
    return `background: linear-gradient(
      -45deg, 
      ${$bgColor} 40%, 
      ${lighten(0.4)($bgColor)} 50%,
      ${$bgColor} 60%
    );`;
  }}
  background-size: 300%;
  background-position-x: 100%;
  animation: ${shimmerAnimation} 2s infinite;
`;

const Shimmer = ({ bgColor = colors.grey300, ...props }: BoxProps) => {
  return <ShimmerBox $bgColor={bgColor} {...props} aria-hidden={true} />;
};

export default Shimmer;
