import React from 'react';

import Skeleton from 'design-system/Skeleton';

import styles from './WorkspaceSkeleton.module.css';

// The phase's own fields: title, dates, description and attachments.
const PhaseFieldsSkeleton = () => (
  <div className={styles.phasePanel} aria-busy="true">
    <Skeleton width={120} height={12} />
    <div className={styles.cards}>
      <Skeleton shape="block" height={46} />
      <Skeleton shape="block" height={40} />
      <Skeleton shape="block" height={100} />
      <Skeleton shape="block" height={46} />
    </div>
  </div>
);

export default PhaseFieldsSkeleton;
