import React from 'react';

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
    button={{ icon: 'chevron-right', onClick }}
  />
);

export default NavCard;
