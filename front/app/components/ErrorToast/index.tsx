import {
  Box,
  Icon,
  colors,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import React from 'react';
import styled from 'styled-components';
import CloseIconButton from 'components/UI/CloseIconButton';

const StyledBox = styled(Box)`
  opacity: 0;
  z-index: 1000;
  transition: all 0.6s ease-in-out;

  &.visible {
    opacity: 1;
  }
`;

type ErrorToastProps = {
  errorMessage: string;
  showError: boolean;
  onClose: () => void;
};

const ErrorToast = ({ errorMessage, showError, onClose }: ErrorToastProps) => {
  const isMobileView = useBreakpoint('phone');

  return (
    <StyledBox
      mx="auto"
      left="0"
      right="0"
      display="flex"
      justifyContent="center"
      className={showError ? 'visible' : 'hidden'}
      position="fixed"
      bottom="0"
      mb={isMobileView ? '64px' : '0px'}
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
