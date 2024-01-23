import React from 'react';

// components
import { Button, colors } from '@citizenlab/cl2-component-library';

interface Props {
  children: React.ReactNode;
  id?: string;
  borderRadius: string;
  active: boolean;
  onClick: () => void;
}

const ViewButton = ({ children, id, borderRadius, active, onClick }: Props) => {
  return (
    <Button
      id={id}
      bgColor={active ? colors.primary : colors.white}
      onClick={() => {
        !active && onClick();
      }}
      borderRadius={borderRadius}
      bgHoverColor={active ? colors.primary : colors.white}
      borderColor={colors.primary}
      height="40px"
      width="92px"
    >
      {children}
    </Button>
  );
};

export default ViewButton;
