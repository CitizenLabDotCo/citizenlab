import React from 'react';

import { Button, colors, fontSizes } from '@citizenlab/cl2-component-library';

interface Props {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active: boolean;
}

const StatusButton = ({
  children,
  onClick,
  disabled = false,
  active,
}: Props) => {
  return (
    <Button
      onClick={onClick}
      buttonStyle="text"
      bgColor={active ? colors.grey200 : 'transparent'}
      justify="left"
      bgHoverColor={colors.background}
      disabled={disabled}
      fontSize={`${fontSizes.s}px`}
    >
      {children}
    </Button>
  );
};

export default StatusButton;
