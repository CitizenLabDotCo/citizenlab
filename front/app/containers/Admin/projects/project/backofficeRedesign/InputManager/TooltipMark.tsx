import React, { ReactNode } from 'react';

import { Focusable } from 'react-aria-components';

import Tooltip from 'design-system/Tooltip';

import styles from './TooltipMark.module.css';

interface Props {
  label: string;
  children: ReactNode;
}

// The design-system Tooltip only opens on a focusable trigger, so the mark is made focusable.
const TooltipMark = ({ label, children }: Props) => (
  <Tooltip content={label}>
    <Focusable>
      <span className={styles.mark} role="img" aria-label={label} tabIndex={0}>
        {children}
      </span>
    </Focusable>
  </Tooltip>
);

export default TooltipMark;
