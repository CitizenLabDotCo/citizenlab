import React from 'react';

import Skeleton from 'design-system/Skeleton';

import insightsStyles from '../../insights/Insights.module.css';
import actionStyles from '../../insights/RecommendedActions.module.css';

import styles from './WorkspaceSkeleton.module.css';

const TILES = [0, 1, 2, 3, 4, 5];
const ACTIONS = [0, 1, 2, 3];

// Insights while it loads: one grey block per card, as each card stands
// on the white panel.
const InsightsSkeleton = () => (
  <div
    className={`${styles.view} ${insightsStyles.panelRegion}`}
    aria-busy="true"
  >
    <div className={insightsStyles.panelLayout}>
      <div className={insightsStyles.sideColumn}>
        <div className={actionStyles.panel}>
          <Skeleton width={144} height={12} />
          {ACTIONS.map((action) => (
            <Skeleton key={action} shape="block" height={46} />
          ))}
        </div>
      </div>
      <div className={insightsStyles.dashboardPanel}>
        <div className={styles.dashboard}>
          <div className={styles.tiles}>
            {TILES.map((tile) => (
              <Skeleton key={tile} shape="block" height={114} />
            ))}
          </div>
          <Skeleton shape="block" height={266} />
          <div className={styles.cardPair}>
            <Skeleton shape="block" height={212} />
            <Skeleton shape="block" height={212} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default InsightsSkeleton;
