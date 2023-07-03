import React, { useEffect, useRef, useState } from 'react';

// components
import {
  Box,
  Icon,
  colors,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
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
  const atPageEnd = useRef(false);
  const [marginBottom, setMarginBottom] = useState('0px');
  const isMobileView = useBreakpoint('phone');

  const handleScroll = () => {
    // Ref: https://stackoverflow.com/questions/63501757/check-if-user-reached-the-bottom-of-the-page-react
    const bottom =
      Math.ceil(window.innerHeight + window.scrollY) >=
      document.documentElement.scrollHeight;
    if (bottom) {
      atPageEnd.current = true;
      setMarginBottom('40px');
    } else {
      atPageEnd.current = false;
      setMarginBottom('0px');
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
      mb={isMobileView ? '64px' : marginBottom}
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
        <Box display="flex" gap="16px" alignItems="center" aria-live="polite">
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
