import React from 'react';

import EarlyAccessBanner from '../../earlyAccess/EarlyAccessBanner';
import workspaceStyles from '../ProjectWorkspace.module.css';

import HeaderSkeleton from './HeaderSkeleton';
import PhasePanelSkeleton from './PhasePanelSkeleton';
import SetupPanelSkeleton from './SetupPanelSkeleton';
import StageSkeleton from './StageSkeleton';
import TimelineSkeleton from './TimelineSkeleton';

interface Props {
  inPhase: boolean;
}

// The workspace's own panels, with grey shapes where their content will be,
// while the whole screen loads. Smaller loads keep their spinner.
const WorkspaceSkeleton = ({ inPhase }: Props) => (
  <div className={workspaceStyles.workspace} aria-busy="true">
    <EarlyAccessBanner />
    <HeaderSkeleton inPhase={inPhase} />
    <div className={workspaceStyles.columns}>
      {!inPhase && (
        <div className={workspaceStyles.setupSlot}>
          <SetupPanelSkeleton />
        </div>
      )}
      <div className={workspaceStyles.participationSlot}>
        <div className={workspaceStyles.panelContent}>
          <TimelineSkeleton />
        </div>
      </div>
      {inPhase && (
        <div className={workspaceStyles.phaseSlot}>
          <PhasePanelSkeleton />
        </div>
      )}
      <div className={workspaceStyles.mainColumn}>
        <div className={workspaceStyles.mainSlot}>
          <StageSkeleton />
        </div>
      </div>
    </div>
  </div>
);

export default WorkspaceSkeleton;
