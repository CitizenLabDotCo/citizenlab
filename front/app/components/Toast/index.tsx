import React from 'react';
import CloseButton from 'components/UI/CloseIconButton';
import { colors } from 'utils/styleUtils';
import { Box, Text, Icon, IconProps } from '@citizenlab/cl2-component-library';

export type ToastProps = {
  text: string;
  onDismiss: () => void;
  variant?: 'success' | 'error' | 'info' | 'warning';
};

const getVariantProps = (variant: ToastProps['variant']) => {
  switch (variant) {
    case 'success':
      return {
        backgroundColor: colors.clGreenSuccessBackground,
        icon: 'checkmark-full' as IconProps['name'],
        iconColor: colors.clGreenSuccess,
      };

    case 'error':
      return {
        backgroundColor: colors.clRedErrorBackground,
        icon: 'error' as IconProps['name'],
        iconColor: colors.clRedError,
      };

    case 'info':
      return {
        backgroundColor: colors.clGreenSuccessBackground,
        icon: 'checkmark-full' as IconProps['name'],
        iconColor: colors.clGreenSuccess,
      };

    case 'warning':
      return {
        backgroundColor: colors.clGreenSuccessBackground,
        icon: 'checkmark-full' as IconProps['name'],
        iconColor: colors.clGreenSuccess,
      };

    default:
      return {
        backgroundColor: colors.clGreenSuccessBackground,
        icon: 'checkmark-full' as IconProps['name'],
        iconColor: colors.clGreenSuccess,
      };
  }
};

const Toast = ({ text, onDismiss, variant = 'error' }: ToastProps) => {
  const variantProps = getVariantProps(variant);

  return (
    <Box
      px="12px"
      py="8px"
      bgColor={variantProps.backgroundColor}
      zIndex="100000"
      position="fixed"
      top="100px"
      right="12px"
      border={`1px solid ${colors.separation}`}
      borderRadius="3px"
    >
      <Box display="flex" alignItems="center" gap="12px">
        <Icon
          name={variantProps.icon}
          fill={variantProps.iconColor}
          width="28px"
          height="28px"
        />
        <Text fontWeight="bold">{text}</Text>
        <CloseButton
          onClick={onDismiss}
          iconColor={colors.label}
          iconColorOnHover={'#000'}
        />
      </Box>
    </Box>
  );
};

export default Toast;
