import React from 'react';

// components
import ViewButton from './ViewButton';
import { Icon, colors } from '@citizenlab/cl2-component-library';

interface Props {
  active: boolean;
  onClick: () => void;
}

const MobileButton = ({ active, onClick }: Props) => {
  return (
    <ViewButton
      id="e2e-mobile-preview"
      borderRadius="4px 0px 0px 4px"
      active={active}
      onClick={onClick}
    >
      <Icon
        name="tablet"
        width="16px"
        height="20px"
        fill={active ? colors.white : colors.primary}
      />
    </ViewButton>
  );
};

export default MobileButton;
