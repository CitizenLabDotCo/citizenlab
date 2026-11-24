import React, { ReactNode } from 'react';

import { Button, colors } from '@citizenlab/cl2-component-library';

interface Props {
  appearance: 'primary' | 'secondary';
  disabled?: boolean;
  processing?: boolean;
  onClick: () => void;
  children: ReactNode;
  'data-cy'?: string;
}

const PlacementButton = ({
  appearance,
  disabled,
  processing,
  onClick,
  children,
  'data-cy': dataCy,
}: Props) => {
  const isPrimary = appearance === 'primary';
  const textColor = isPrimary ? colors.white : colors.grey900;

  return (
    <Button
      type="button"
      buttonStyle={isPrimary ? 'admin-dark' : 'admin-dark-outlined'}
      textColor={textColor}
      textHoverColor={textColor}
      bgColor={isPrimary ? colors.primary : colors.white}
      bgHoverColor={isPrimary ? colors.blue700 : colors.grey50}
      bgActiveColor={isPrimary ? colors.black : colors.grey300}
      borderThickness={isPrimary ? '0' : undefined}
      borderColor={isPrimary ? 'transparent' : colors.grey300}
      borderHoverColor={isPrimary ? 'transparent' : colors.coolGrey500}
      height="36px"
      padding="0 16px"
      lineHeight="20px"
      fontSize="14px"
      fontWeight="500"
      borderRadius="8px"
      disabled={disabled || processing}
      processing={processing}
      onClick={onClick}
      dataCy={dataCy}
    >
      {children}
    </Button>
  );
};

export default PlacementButton;
