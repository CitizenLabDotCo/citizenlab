import React from 'react';

// The design-system icon set has no clock, so both details keep the old icons.
import { Icon, IconNames } from '@citizenlab/cl2-component-library';

import 'design-system/tokens.css';

import styles from './NotificationDetail.module.css';

interface Props {
  icon: IconNames;
  label: string;
  text: string;
}

const NotificationDetail = ({ icon, label, text }: Props) => (
  <span className={styles.detail}>
    <Icon
      name={icon}
      width="14px"
      height="14px"
      fill="currentColor"
      className={styles.icon}
      title={label}
    />
    <span className={styles.text}>{text}</span>
  </span>
);

export default NotificationDetail;
