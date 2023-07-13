import React, { useEffect, useRef, useState } from 'react';

// components
import {
  Box,
  Icon,
  colors,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import CloseIconButton from 'components/UI/CloseIconButton';

// utils
import styled from 'styled-components';
import eventEmitter from 'utils/eventEmitter';

// events
import {
  BUDGET_EXCEEDED_ERROR_EVENT,
  VOTES_EXCEEDED_ERROR_EVENT,
} from './events';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

const StyledBox = styled(Box)`
  opacity: 0;
  z-index: 1000;
  transition: all 0.6s ease-in-out;

  &.visible {
    opacity: 1;
  }
`;

const ErrorToast = () => {
  const atPageEnd = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const { formatMessage } = useIntl();
  const [marginBottom, setMarginBottom] = useState('0px');
  const isMobileView = useBreakpoint('phone');

  // Listen for budgeting exceeded error
  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent(BUDGET_EXCEEDED_ERROR_EVENT)
      .subscribe(() => {
        setError(formatMessage(messages.budgetExceededError));
        setShowError(true);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [formatMessage]);

  // Listen for voting exceeded error
  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent(VOTES_EXCEEDED_ERROR_EVENT)
      .subscribe(() => {
        setError(formatMessage(messages.votesExceededError));
        setShowError(true);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [formatMessage]);

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
          <Text color="error">{error}</Text>
          <CloseIconButton
            iconColor={colors.error}
            onClick={() => {
              setShowError(false);
            }}
          />
        </Box>
      </Box>
    </StyledBox>
  );
};

export default ErrorToast;
