import React from 'react';

import Skeleton from 'design-system/Skeleton';

import styles from './WorkspaceSkeleton.module.css';

const ROWS = [0, 1, 2, 3, 4, 5, 6, 7];

// The rows of a Manage list while its first page loads.
const ListRowsSkeleton = () => (
  <div aria-busy="true">
    {ROWS.map((row) => (
      <div key={row} className={styles.listRow}>
        <Skeleton width={14} height={14} radius={3} />
        <div className={styles.lines}>
          <Skeleton width={row % 3 === 0 ? '92%' : '84%'} height={8} />
          {row % 2 === 0 && <Skeleton width="38%" height={8} />}
        </div>
        <Skeleton width={72} height={8} />
      </div>
    ))}
  </div>
);

export default ListRowsSkeleton;
