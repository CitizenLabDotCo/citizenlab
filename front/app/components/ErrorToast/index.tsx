import { Box } from '@citizenlab/cl2-component-library';
import React from 'react';
import styled from 'styled-components';
import Error from 'components/UI/Error';

const StyledBox = styled(Box)`
  transform: translateY(-100%);
  opacity: 0;
  transition: all 0.8s ease-in-out;

  &.visible {
    transform: translateY(0%);
    opacity: 1;
  }
`;

type ErrorToastProps = {
  errorMessage: string;
  showError: boolean;
};

const ErrorToast = ({ errorMessage, showError }: ErrorToastProps) => {
  return (
    <StyledBox
      position="absolute"
      zIndex="-1"
      mx="auto"
      left="0"
      right="0"
      display="flex"
      justifyContent="center"
      className={showError ? 'visible' : 'hidden'}
    >
      <Error text={errorMessage} />
    </StyledBox>
  );
};

export default ErrorToast;
