import React, { ReactNode } from 'react';

import styles from './StatusChip.module.css';
import '../tokens.css';

type Props = {
  // The status word, e.g. the translated "Archived".
  children: ReactNode;
};

// A settled status that opens nothing, such as an archived project in the
// place of its status button.
const StatusChip = ({ children }: Props) => (
  <span className={styles.chip}>
    <span className={styles.dot} aria-hidden />
    {children}
  </span>
);

export default StatusChip;
