import React from 'react';

// components
import { Icon, Button, colors } from '@citizenlab/cl2-component-library';

interface Props {
  active: boolean;
  onClick: () => void;
}

const MobileButton = ({ active, onClick }: Props) => {
  return (
    <Button
      bgColor={active ? colors.primary : colors.white}
      onClick={() => {
        !active && onClick();
      }}
      borderRadius="4px 0px 0px 4px"
      bgHoverColor={active ? colors.primary : colors.white}
      borderColor={`${colors.primary}`}
      id="e2e-mobile-preview"
      height="40px"
      width="92px"
    >
      <Icon
        name="tablet"
        width="16px"
        height="20px"
        fill={active ? colors.white : colors.primary}
      />
    </Button>
  );
};

export default MobileButton;
