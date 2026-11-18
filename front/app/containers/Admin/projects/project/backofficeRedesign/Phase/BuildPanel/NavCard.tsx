import React from 'react';

import PanelField from './PanelField';

interface Props {
  label: string;
  tooltip?: string;
  disabled?: boolean;
  onClick: () => void;
}

const NavCard = ({ label, tooltip, onClick, disabled }: Props) => (
  <PanelField
    label={label}
    labelTooltip={tooltip ? <>{tooltip}</> : undefined}
    button={{ icon: 'chevron-right', onClick, disabled }}
  />
);

export default NavCard;
