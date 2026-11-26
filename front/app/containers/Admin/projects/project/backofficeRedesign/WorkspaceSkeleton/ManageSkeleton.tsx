import React from 'react';

import Skeleton from 'design-system/Skeleton';

import sideStyles from '../InputManager/SideColumn/SideColumn.module.css';
import ManageLayout from '../Phase/ManageLayout';

import ListRowsSkeleton from './ListRowsSkeleton';
import StatsSkeleton from './StatsSkeleton';
import styles from './WorkspaceSkeleton.module.css';

const ACTIONS = [0, 1, 2];

// Manage while it loads: the counts and actions beside the list.
const ManageSkeleton = () => (
  <ManageLayout
    side={
      <>
        <StatsSkeleton />
        <div className={sideStyles.card} aria-busy="true">
          {ACTIONS.map((action) => (
            <Skeleton key={action} shape="block" height={46} />
          ))}
        </div>
      </>
    }
  >
    <div className={styles.listHeader}>
      <Skeleton width={72} height={16} />
      <div className={styles.row}>
        <Skeleton width={28} height={28} radius={6} />
        <Skeleton width={28} height={28} radius={6} />
      </div>
    </div>
    <div className={styles.listRow}>
      <Skeleton width={14} height={14} radius={3} />
      <Skeleton width={32} height={8} />
      <Skeleton width={40} height={8} />
    </div>
    <ListRowsSkeleton />
  </ManageLayout>
);

export default ManageSkeleton;
