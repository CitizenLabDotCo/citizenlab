import React from 'react';

import Divider from 'design-system/Divider';
import Skeleton from 'design-system/Skeleton';

import timelineStyles from '../ProjectTimeline.module.css';

import styles from './WorkspaceSkeleton.module.css';

const TimelineSkeleton = () => (
  <div className={timelineStyles.timeline}>
    <div className={timelineStyles.header}>
      <Skeleton width={88} height={12} />
      <div className={timelineStyles.actions}>
        <Skeleton width={16} height={16} />
        <Skeleton width={16} height={16} />
      </div>
    </div>
    <div className={timelineStyles.groupHeader}>
      <Skeleton width={56} height={8} />
    </div>
    {[0, 1, 2].map((phase) => (
      <div key={phase} className={styles.phaseRow}>
        <Skeleton width={8} height={8} radius={4} />
        <div className={styles.lines}>
          <Skeleton width={120} height={8} />
          <Skeleton width={168} height={8} />
        </div>
      </div>
    ))}
    <div className={timelineStyles.divider}>
      <Divider />
    </div>
    <div className={timelineStyles.groupHeader}>
      <Skeleton width={64} height={8} />
    </div>
    <div className={timelineStyles.divider}>
      <Divider />
    </div>
    <div className={`${timelineStyles.groupHeader} ${styles.spread}`}>
      <Skeleton width={48} height={8} />
      <Skeleton width={16} height={16} />
    </div>
  </div>
);

export default TimelineSkeleton;
