import React, { ReactNode } from 'react';

import Icon, { IconName } from '../Icon';
import '../tokens.css';

import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'selected';

type UseProps =
  // The value pill of a setting card.
  | { use?: 'summary'; icon?: IconName }
  // A fact about an option (method picker cards). Figma draws it without an icon.
  | { use: 'note'; icon?: undefined };

export type BadgeProps = UseProps & {
  children: ReactNode;
  // Neutral = system default; Selected = set or changed by the user, or reviewed.
  tone?: BadgeTone;
};

const Badge = ({
  children,
  tone = 'neutral',
  use = 'summary',
  icon,
}: BadgeProps) => (
  <span className={`${styles.badge} ${styles[tone]} ${styles[use]}`}>
    {icon && <Icon name={icon} className={styles.icon} />}
    <span className={styles.label}>{children}</span>
  </span>
);

export default Badge;
