import React, { ReactNode } from 'react';

import { Button as AriaButton, PressEvent } from 'react-aria-components';

import Icon, { IconName } from '../Icon';
import '../tokens.css';

import styles from './ViewPill.module.css';

export type ViewPillProps = {
  // E.g. Recently viewed, or a SelectValue inside a Select.
  children: ReactNode;
  icon: IconName;
  // A choice the admin made (blue); off is the system default (grey).
  isSelected?: boolean;
  onPress?: (e: PressEvent) => void;
  'data-cy'?: string;
};

// The trigger of a MenuTrigger (view) or a Select (sort) on the right of the Toolbar.
const ViewPill = ({
  children,
  icon,
  isSelected = false,
  onPress,
  'data-cy': dataCy,
}: ViewPillProps) => (
  <AriaButton
    className={`${styles.pill} ${
      isSelected ? styles.selected : styles.default
    }`}
    onPress={onPress}
    data-cy={dataCy}
  >
    <Icon name={icon} className={styles.icon} />
    <span className={styles.label}>{children}</span>
    <Icon name="chevron-down-12" className={styles.icon} />
  </AriaButton>
);

export default ViewPill;
