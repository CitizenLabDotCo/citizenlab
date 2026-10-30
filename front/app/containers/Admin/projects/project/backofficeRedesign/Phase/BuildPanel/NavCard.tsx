import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import PanelField from './PanelField';

interface Props {
  label: string;
  tooltip?: string;
  onClick: () => void;
}

const NavCard = ({ label, tooltip, onClick }: Props) => (
  <PanelField
    label={label}
    labelTooltip={tooltip ? <>{tooltip}</> : undefined}
    action={
      <Button
        buttonStyle="bo-text"
        icon="chevron-right"
        iconSize="16px"
        width="28px"
        height="28px"
        padding="0"
        ariaLabel={label}
        onClick={onClick}
      />
    }
  />
);

export default NavCard;
