import React, { ReactNode } from 'react';

import Icon, { IconName } from '../Icon';

import styles from './Banner.module.css';
import '../tokens.css';

type Tone = 'info' | 'warning' | 'error' | 'neutral';

type Props = {
  children: ReactNode;
  tone?: Tone;
};

const icons: Record<Tone, IconName> = {
  info: 'info-16',
  warning: 'triangle-alert-16',
  error: 'triangle-alert-16',
  neutral: 'info-16',
};

const roles: Record<Tone, 'status' | 'alert' | undefined> = {
  info: 'status',
  warning: 'status',
  error: 'alert',
  neutral: undefined,
};

const Banner = ({ children, tone = 'info' }: Props) => (
  <div className={`${styles.banner} ${styles[tone]}`} role={roles[tone]}>
    <span className={styles.iconWrapper}>
      <Icon name={icons[tone]} className={styles.icon} />
    </span>
    <div className={styles.message}>{children}</div>
  </div>
);

export default Banner;
