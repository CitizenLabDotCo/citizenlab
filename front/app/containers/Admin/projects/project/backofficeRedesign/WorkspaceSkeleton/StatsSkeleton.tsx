import React from 'react';

import Skeleton from 'design-system/Skeleton';

import sideStyles from '../InputManager/SideColumn/SideColumn.module.css';

import styles from './WorkspaceSkeleton.module.css';

const STATS = [0, 1, 2];

// The counts card beside a Manage list while the counts load.
const StatsSkeleton = () => (
  <div className={sideStyles.stats} aria-busy="true">
    {STATS.map((stat) => (
      <div key={stat} className={styles.stat}>
        <Skeleton width={112} height={12} />
        <Skeleton width={28} height={24} />
      </div>
    ))}
  </div>
);

export default StatsSkeleton;
