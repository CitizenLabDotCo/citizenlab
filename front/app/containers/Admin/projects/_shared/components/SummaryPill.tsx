import React, { createContext, useContext } from 'react';

import Badge from 'design-system/Badge';
import { IconName } from 'design-system/Icon';
import 'design-system/tokens.css';

export const SummaryReviewedContext = createContext(false);

interface Props {
  label: string;
  icon?: IconName;
  /** Marks something the admin set, like a form that has questions. */
  active?: boolean;
}

const SummaryPill = ({ label, icon, active = false }: Props) => {
  const reviewed = useContext(SummaryReviewedContext);

  return (
    <Badge tone={active || reviewed ? 'selected' : 'neutral'} icon={icon}>
      {label}
    </Badge>
  );
};

export default SummaryPill;
