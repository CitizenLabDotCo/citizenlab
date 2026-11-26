import React from 'react';

import Skeleton from 'design-system/Skeleton';

import styles from './PhoneScreenSkeleton.module.css';

interface Props {
  hidden: boolean;
}

// Stands in for the phone's page until it has loaded, then fades out.
const PhoneScreenSkeleton = ({ hidden }: Props) => (
  <div className={styles.screen} data-hidden={hidden || undefined}>
    <div className={styles.topBar}>
      <Skeleton width={30} height={12} />
      <Skeleton width={24} height={24} />
    </div>
    <div className={styles.body}>
      <Skeleton shape="block" className={styles.image} />
      <Skeleton width="55%" height={16} />
      <div className={styles.lines}>
        <Skeleton width="96%" height={8} />
        <Skeleton width="88%" height={8} />
        <Skeleton width="66%" height={8} />
      </div>
      <div className={styles.lines}>
        <Skeleton width="82%" height={8} />
        <Skeleton width="88%" height={8} />
        <Skeleton width="40%" height={8} />
      </div>
    </div>
  </div>
);

export default PhoneScreenSkeleton;
