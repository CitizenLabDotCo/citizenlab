import React from 'react';

import {
  Box,
  InputContainer,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useParam, setParam } from '../../params';

const StyledInputContainer = styled(InputContainer)<{ isActive: boolean }>`
  ${({ isActive }) =>
    isActive
      ? `
    background-color: ${colors.primary};
    color: ${colors.white};
    &:focus {
      color: ${colors.white};  
    }
  `
      : ''}
`;

const PendingApproval = () => {
  const reviewState = useParam('review_state');

  return (
    <Box position="relative">
      <StyledInputContainer
        isActive={reviewState === 'pending'}
        onClick={() => {
          setParam(
            'review_state',
            reviewState === 'pending' ? undefined : 'pending'
          );
        }}
      >
        Pending approval
      </StyledInputContainer>
      <Box
        position="absolute"
        as="span"
        top="0px"
        right="4px"
        bgColor={colors.red100}
        color={colors.red800}
        style={{ fontWeight: 'bold' }}
        py="0"
        px="4px"
        borderRadius={stylingConsts.borderRadius}
      >
        2
      </Box>
    </Box>
  );
};

export default PendingApproval;
