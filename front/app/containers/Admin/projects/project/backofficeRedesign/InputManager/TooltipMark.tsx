import React, { ReactNode } from 'react';

import Tooltip, { TooltipTarget } from 'design-system/Tooltip';

import styles from './TooltipMark.module.css';

interface Props {
  label: string;
  children: ReactNode;
}

const TooltipMark = ({ label, children }: Props) => (
  <Tooltip content={label}>
    <TooltipTarget className={styles.mark} aria-label={label}>
      {children}
    </TooltipTarget>
  </Tooltip>
);

export default TooltipMark;
