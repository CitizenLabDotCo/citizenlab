import React, { useEffect } from 'react';

import {
  Box,
  colors,
  Icon,
  IconNames,
  Text,
} from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';
import { MessageDescriptor } from 'react-intl';
import styled, { keyframes } from 'styled-components';

import formStatusMessages from 'components/FormBuilder/components/FormStatus/messages';
import feedbackMessages from 'components/HookForm/Feedback/messages';
import CloseIconButton from 'components/UI/CloseIconButton';

import { useIntl } from 'utils/cl-intl';

const SUCCESS_TOAST_DURATION_MS = 4000;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const AnimatedBox = styled(Box)`
  animation: ${slideIn} 0.2s ease-out;
`;

type ToastVariant = 'error' | 'warning' | 'success';

const VARIANT_STYLES: Record<
  ToastVariant,
  { bgColor: string; color: string; icon: IconNames }
> = {
  error: {
    bgColor: colors.errorLight,
    color: colors.red600,
    icon: 'alert-circle',
  },
  warning: {
    bgColor: colors.orange100,
    color: colors.orange500,
    icon: 'alert-circle',
  },
  success: {
    bgColor: colors.successLight,
    color: colors.success,
    icon: 'check-circle',
  },
};

type Toast = {
  variant: ToastVariant;
  message: MessageDescriptor;
  // Second sentence, shown on its own line.
  details?: MessageDescriptor;
  dismissable: boolean;
};

type Props = {
  successMessage: MessageDescriptor;
  isSubmitting: boolean;
  successIsVisible: boolean;
  onDismissSuccess: () => void;
};

// Save status of the builder, shown as a toast at the bottom of the canvas.
// Errors and unsaved changes stay until they're resolved; the success
// message can be closed and disappears on its own.
const SaveStatusToast = ({
  successMessage,
  isSubmitting,
  successIsVisible,
  onDismissSuccess,
}: Props) => {
  const { formatMessage } = useIntl();
  const {
    formState: { errors, isDirty },
  } = useFormContext();

  useEffect(() => {
    if (!successIsVisible) return;
    const timeout = setTimeout(onDismissSuccess, SUCCESS_TOAST_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [successIsVisible, onDismissSuccess]);

  const getToast = (): Toast | null => {
    if (errors.staleData) {
      return {
        variant: 'error',
        message: formStatusMessages.staleDataErrorMessage,
        dismissable: false,
      };
    }
    if (errors.submissionError) {
      return {
        variant: 'error',
        message: feedbackMessages.submissionErrorTitle,
        details: feedbackMessages.submissionErrorText,
        dismissable: false,
      };
    }
    if (Object.keys(errors).length > 0) {
      return {
        variant: 'error',
        message: formStatusMessages.errorMessage,
        dismissable: false,
      };
    }
    if (isSubmitting) return null;
    if (isDirty) {
      return {
        variant: 'warning',
        message: formStatusMessages.unsavedChanges,
        dismissable: false,
      };
    }
    if (successIsVisible) {
      return {
        variant: 'success',
        message: successMessage,
        dismissable: true,
      };
    }
    return null;
  };

  const toast = getToast();
  if (!toast) return null;

  const { bgColor, color, icon } = VARIANT_STYLES[toast.variant];

  return (
    <Box
      position="absolute"
      left="12px"
      right="12px"
      bottom="64px"
      zIndex="6"
      display="flex"
      justifyContent="center"
      style={{ pointerEvents: 'none' }}
    >
      <AnimatedBox
        // Re-keyed per variant so a change of status animates in again.
        key={toast.variant}
        maxWidth="560px"
        style={{ pointerEvents: 'auto' }}
        bgColor={bgColor}
        borderRadius="3px"
        px="12px"
        py="8px"
        display="flex"
        alignItems="center"
        gap="12px"
        boxShadow="0px 2px 8px rgba(0, 0, 0, 0.2)"
        role={toast.variant === 'error' ? 'alert' : 'status'}
        aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
        data-cy={`e2e-form-builder-new-toast-${toast.variant}`}
      >
        <Icon name={icon} fill={color} width="20px" height="20px" />
        <Box flex="1">
          <Text m="0px" color="textPrimary" fontWeight="semi-bold">
            {formatMessage(toast.message)}
          </Text>
          {toast.details && (
            <Text m="0px" color="textPrimary" fontSize="s">
              {formatMessage(toast.details)}
            </Text>
          )}
        </Box>
        {toast.dismissable && (
          <CloseIconButton onClick={onDismissSuccess} iconColor={color} />
        )}
      </AnimatedBox>
    </Box>
  );
};

export default SaveStatusToast;
