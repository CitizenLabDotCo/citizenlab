import React, { ReactNode } from 'react';

import { Link } from 'react-aria-components';

import Icon, { IconName } from '../Icon';
import '../tokens.css';

import styles from './Banner.module.css';

export type BannerTone = 'info' | 'warning' | 'error' | 'neutral';

export type BannerAction = {
  label: ReactNode;
  href?: string;
  onPress?: () => void;
};

type ToneProps =
  | {
      tone?: 'info' | 'warning' | 'error';
      // The one inline action at the end of the message (Link=Yes).
      action?: BannerAction;
    }
  // Figma draws Neutral without a link.
  | { tone: 'neutral'; action?: undefined };

export type BannerProps = ToneProps & {
  children: ReactNode;
};

const icons: Record<BannerTone, IconName> = {
  info: 'info-16',
  warning: 'triangle-alert-16',
  error: 'triangle-alert-16',
  neutral: 'info-16',
};

const roles: Record<BannerTone, 'status' | 'alert' | undefined> = {
  info: 'status',
  warning: 'status',
  error: 'alert',
  neutral: undefined,
};

const Banner = ({ children, tone = 'info', action }: BannerProps) => (
  <div className={`${styles.banner} ${styles[tone]}`} role={roles[tone]}>
    <span className={styles.iconWrapper}>
      <Icon name={icons[tone]} className={styles.icon} />
    </span>
    {action ? (
      <div className={styles.description}>
        <span>{children}</span>
        <Link
          className={styles.link}
          href={action.href}
          onPress={action.onPress}
        >
          {action.label}
        </Link>
      </div>
    ) : (
      <div className={styles.message}>{children}</div>
    )}
  </div>
);

export default Banner;
