import React, { ReactNode } from 'react';

import Icon, { IconName } from '../Icon';

import styles from './Badge.module.css';
import '../tokens.css';

type UseProps =
  // The value pill of a setting card.
  | { use?: 'summary'; icon?: IconName }
  // A fact about an option (method picker cards). Figma draws it without an icon.
  | { use: 'note'; icon?: undefined };

type Props = UseProps & {
  children: ReactNode;
  // Neutral = system default; Selected = set or changed by the user, or reviewed.
  tone?: 'neutral' | 'selected';
};

const Badge = ({
  children,
  tone = 'neutral',
  use = 'summary',
  icon,
}: Props) => (
  <span className={`${styles.badge} ${styles[tone]} ${styles[use]}`}>
    {icon && <Icon name={icon} className={styles.icon} />}
    <span>{children}</span>
  </span>
);

export default Badge;
