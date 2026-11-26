import React, { ReactNode } from 'react';

import { useIntl } from 'utils/cl-intl';

import Icon, { IconName } from '../Icon';
import IconButton from '../IconButton';

import styles from './Banner.module.css';
import messages from './messages';
import '../tokens.css';

type Tone = 'info' | 'warning' | 'error' | 'neutral';

type Props = {
  children: ReactNode;
  tone?: Tone;
  // A control on the right that acts on what the banner says, e.g. a Switch.
  action?: ReactNode;
  // Shows a close button.
  onDismiss?: () => void;
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

const Banner = ({ children, tone = 'info', action, onDismiss }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <div className={`${styles.banner} ${styles[tone]}`} role={roles[tone]}>
      <span className={styles.iconWrapper}>
        <Icon name={icons[tone]} className={styles.icon} />
      </span>
      <div className={styles.message}>{children}</div>
      {(action || onDismiss) && (
        <div className={styles.actions}>
          {action}
          {onDismiss && (
            <IconButton
              icon="x-16"
              size={24}
              aria-label={formatMessage(messages.dismiss)}
              onPress={onDismiss}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Banner;
