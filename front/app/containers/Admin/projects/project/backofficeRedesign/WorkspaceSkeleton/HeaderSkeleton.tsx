import React from 'react';

import Skeleton from 'design-system/Skeleton';

import { useWorkspaceHeader } from 'containers/Admin/sideBar/WorkspaceHeaderContext';

import headerStyles from '../Header/Header.module.css';

import styles from './WorkspaceSkeleton.module.css';

interface Props {
  inPhase: boolean;
}

const HeaderSkeleton = ({ inPhase }: Props) => {
  // The admin menu button docks here, as it does in the loaded header.
  const workspaceHeader = useWorkspaceHeader();

  return (
    <div ref={workspaceHeader?.setElement} className={headerStyles.header}>
      <span className={headerStyles.separator} aria-hidden="true" />
      <div className={headerStyles.crumbBar}>
        {inPhase && <Skeleton width={24} height={24} radius={6} />}
        <div className={styles.row}>
          <Skeleton width={56} height={8} />
          <Skeleton width={inPhase ? 132 : 96} height={8} />
        </div>
      </div>
      <div className={headerStyles.actions}>
        {inPhase ? (
          <Skeleton shape="block" width={64} height={32} />
        ) : (
          <>
            <Skeleton shape="block" width={80} height={32} />
            <Skeleton shape="block" width={72} height={32} />
          </>
        )}
      </div>
    </div>
  );
};

export default HeaderSkeleton;
