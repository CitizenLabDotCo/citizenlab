import React from 'react';

import Badge from 'design-system/Badge';
import { IconName } from 'design-system/Icon';
import 'design-system/tokens.css';

interface Props {
  label: string;
  icon?: IconName;
  /** Marks something that is set up, like a form that has questions. */
  active?: boolean;
}

const SummaryPill = ({ label, icon, active = false }: Props) => (
  <Badge tone={active ? 'selected' : 'neutral'} icon={icon}>
    {label}
  </Badge>
);

export default SummaryPill;
