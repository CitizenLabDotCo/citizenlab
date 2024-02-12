import React from 'react';

// components
import ViewButton from './ViewButton';
import { Icon, colors } from '@citizenlab/cl2-component-library';

interface Props {
  active: boolean;
  onClick: () => void;
}

const DesktopButton = ({ active, onClick }: Props) => {
  return (
    <ViewButton
      id="e2e-desktop-preview"
      borderRadius="0px 4px 4px 0px"
      active={active}
      onClick={onClick}
    >
      <Icon
        name="desktop"
        width="20px"
        fill={active ? colors.white : colors.primary}
      />
    </ViewButton>
  );
};

export default DesktopButton;
