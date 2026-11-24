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
}: Props) => (
  <Button
    type="button"
    buttonStyle={
      appearance === 'primary' ? 'admin-dark' : 'admin-dark-outlined'
    }
    bgColor={appearance === 'secondary' ? colors.white : undefined}
    borderColor={appearance === 'secondary' ? colors.grey300 : undefined}
    height="36px"
    padding="0 16px"
    lineHeight="20px"
    fontSize="14px"
    fontWeight="500"
    borderRadius="8px"
    disabled={disabled}
    processing={processing}
    onClick={onClick}
    dataCy={dataCy}
  >
    {children}
  </Button>
);

export default PlacementButton;
