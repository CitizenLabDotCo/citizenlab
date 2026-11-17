import React, { ReactNode } from 'react';

import { Focusable } from 'react-aria-components';

import Icon from 'design-system/Icon';
import Tooltip from 'design-system/Tooltip';
import 'design-system/tokens.css';

import styles from './OfflineVoteSettings.module.css';

interface Props {
  'aria-label': string;
  content: ReactNode;
}

// An info icon with a rich tooltip. The design-system Tooltip only opens on a
// focusable trigger, so the icon is made focusable.
const InfoTooltipMark = ({ 'aria-label': ariaLabel, content }: Props) => (
  <Tooltip content={content}>
    <Focusable>
      <span
        className={styles.infoMark}
        role="img"
        aria-label={ariaLabel}
        tabIndex={0}
      >
        <Icon name="info-16" />
      </span>
    </Focusable>
  </Tooltip>
);

export default InfoTooltipMark;
