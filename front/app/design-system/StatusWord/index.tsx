import React, { ReactNode } from 'react';

import '../tokens.css';
import styles from './StatusWord.module.css';

export type StatusWordStatus =
  | 'published'
  | 'draft'
  | 'pendingApproval'
  | 'archived';

export type StatusWordProps = {
  // The status word, supplied by the caller (e.g. the translated "Published").
  children: ReactNode;
  status?: StatusWordStatus;
  // Optional second line saying what else is true (e.g. "Hidden").
  sub?: ReactNode;
};

const StatusWord = ({
  children,
  status = 'published',
  sub,
}: StatusWordProps) => (
  <span className={styles.statusWord}>
    <span className={`${styles.label} ${styles[status]}`}>{children}</span>
    {sub && <span className={styles.sub}>{sub}</span>}
  </span>
);

export default StatusWord;
