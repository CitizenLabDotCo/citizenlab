import React, { ReactNode } from 'react';

import '../tokens.css';
import styles from './StatusBadge.module.css';

type Props = {
  // The status word, supplied by the caller (e.g. the translated "Draft").
  children: ReactNode;
  status: 'draft' | 'published';
};

const StatusBadge = ({ children, status }: Props) => (
  <span className={`${styles.statusBadge} ${styles[status]}`}>{children}</span>
);

export default StatusBadge;
