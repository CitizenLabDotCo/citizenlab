import React, { ReactNode } from 'react';

import Icon from 'design-system/Icon';
import Tooltip, { TooltipTarget } from 'design-system/Tooltip';

import styles from './OfflineVoteSettings.module.css';
import 'design-system/tokens.css';

interface Props {
  'aria-label': string;
  content: ReactNode;
}

// An info icon with a rich tooltip.
const InfoTooltipMark = ({ 'aria-label': ariaLabel, content }: Props) => (
  <Tooltip content={content}>
    <TooltipTarget className={styles.infoMark} aria-label={ariaLabel}>
      <Icon name="info-16" />
    </TooltipTarget>
  </Tooltip>
);

export default InfoTooltipMark;
