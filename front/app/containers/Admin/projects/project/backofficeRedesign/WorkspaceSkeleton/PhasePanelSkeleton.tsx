import React from 'react';

import Skeleton from 'design-system/Skeleton';

import PhaseFieldsSkeleton from './PhaseFieldsSkeleton';
import styles from './WorkspaceSkeleton.module.css';

// The phase's fields and settings, while the phase loads.
const PhasePanelSkeleton = () => (
  <div aria-busy="true">
    <PhaseFieldsSkeleton />
    <div className={styles.phaseSettings}>
      <Skeleton width={156} height={8} />
      <div className={styles.cards}>
        {[0, 1, 2, 3].map((card) => (
          <Skeleton key={card} shape="block" height={46} />
        ))}
      </div>
      <Skeleton width={128} height={8} />
      <div className={styles.cards}>
        <Skeleton shape="block" height={46} />
        <Skeleton shape="block" height={46} />
      </div>
    </div>
  </div>
);

export default PhasePanelSkeleton;
