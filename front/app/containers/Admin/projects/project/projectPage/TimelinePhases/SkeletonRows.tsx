import React from 'react';

import styles from './SkeletonRows.module.css';
import 'design-system/tokens.css';

const SkeletonRows = () => (
  <div className={styles.rows} aria-hidden>
    {[0, 1, 2].map((row) => (
      <div key={row} className={styles.row}>
        <span className={styles.dot} />
        <span className={styles.bars}>
          <span className={`${styles.bar} ${styles.long}`} />
          <span className={`${styles.bar} ${styles.short}`} />
        </span>
      </div>
    ))}
  </div>
);

export default SkeletonRows;
