import React, { ReactNode } from 'react';

import '../tokens.css';
import styles from './StatusBadge.module.css';

export type StatusBadgeStatus =
  | 'draft'
  | 'live'
  | 'published'
  | 'pendingApproval'
  | 'archived';

export type StatusBadgeProps = {
  // The status word, supplied by the caller (e.g. the translated "Draft").
  children: ReactNode;
  status?: StatusBadgeStatus;
  size?: 18 | 20;
};

const StatusBadge = ({
  children,
  status = 'draft',
  size = 18,
}: StatusBadgeProps) => (
  <span
    className={`${styles.statusBadge} ${styles[status]} ${
      styles[`size${size}`]
    }`}
  >
    {children}
  </span>
);

export default StatusBadge;
