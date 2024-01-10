import React from 'react';

// components
import { Icon, Button, colors } from '@citizenlab/cl2-component-library';

interface Props {
  active: boolean;
  onClick: () => void;
}

const DesktopButton = ({ active, onClick }: Props) => {
  return (
    <Button
      bgColor={active ? colors.primary : colors.white}
      onClick={() => {
        !active && onClick();
      }}
      id="e2e-desktop-preview"
      borderRadius="0px 4px 4px 0px"
      bgHoverColor={active ? colors.primary : colors.white}
      borderColor={colors.primary}
      height="40px"
      width="92px"
    >
      <Icon
        name="desktop"
        width="20px"
        fill={active ? colors.white : colors.primary}
      />
    </Button>
  );
};

export default DesktopButton;
