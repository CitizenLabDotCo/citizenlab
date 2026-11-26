import React from 'react';

import Skeleton from 'design-system/Skeleton';

import panelStyles from '../ProjectSetupPanel/ProjectSetupPanel.module.css';

import styles from './WorkspaceSkeleton.module.css';

const SetupPanelSkeleton = () => (
  <div className={panelStyles.panel}>
    <div className={panelStyles.header}>
      <Skeleton width={96} height={12} />
      <Skeleton width={16} height={16} />
    </div>
    <div className={styles.spread}>
      <Skeleton width={112} height={8} />
      <Skeleton width={72} height={8} />
    </div>
    <div className={styles.cards}>
      {[0, 1, 2, 3, 4, 5].map((card) => (
        <Skeleton key={card} shape="block" height={46} />
      ))}
    </div>
  </div>
);

export default SetupPanelSkeleton;
