import React, { ReactNode } from 'react';

import Icon from '../Icon';

import styles from './TooltipMark.module.css';
import TooltipTarget from './TooltipTarget';

import Tooltip from './index';

type Props = {
  label: string;
  content?: ReactNode;
  children?: ReactNode;
};

const TooltipMark = ({ label, content = label, children }: Props) => (
  <Tooltip content={content}>
    <TooltipTarget className={styles.mark} aria-label={label}>
      {children ?? <Icon name="info-16" className={styles.info} />}
    </TooltipTarget>
  </Tooltip>
);

export default TooltipMark;
