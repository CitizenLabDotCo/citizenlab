import { Box, Icon, colors, Text } from '@citizenlab/cl2-component-library';
import React from 'react';
import styled from 'styled-components';
import CloseIconButton from 'components/UI/CloseIconButton';

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
  onClose: () => void;
};

const ErrorToast = ({ errorMessage, showError, onClose }: ErrorToastProps) => {
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
      <Box
        bgColor={colors.errorLight}
        borderRadius="3px"
        px="12px"
        py="4px"
        mb="12px"
        role="alert"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box display="flex" gap="16px" alignItems="center">
          <Icon
            name="alert-circle"
            fill={colors.error}
            width="24px"
            height="24px"
          />
          <Text color="error">{errorMessage}</Text>
          <CloseIconButton iconColor={colors.error} onClick={onClose} />
        </Box>
      </Box>
    </StyledBox>
  );
};

export default ErrorToast;
