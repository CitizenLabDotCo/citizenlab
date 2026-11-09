import React from 'react';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { ManagerType } from 'components/admin/PostManager';

import { ManagerFilters, SetFilters } from '../useManagerParams';
import { PhaseCounts } from '../usePhaseCounts';

import AutoShareResults from './AutoShareResults';
import ExportRow from './ExportRow';
import InputStats from './InputStats';
import OfflineCollection from './OfflineCollection';

interface Props {
  type: ManagerType;
  project: IProjectData;
  phase: IPhaseData;
  counts: PhaseCounts | undefined;
  statuses: IIdeaStatusData[];
  selectedIds: string[];
  filters: ManagerFilters;
  setFilters: SetFilters;
}

const SideColumn = ({
  type,
  project,
  phase,
  counts,
  statuses,
  selectedIds,
  filters,
  setFilters,
}: Props) => {
  const isVoting = phase.attributes.participation_method === 'voting';

  return (
    <>
      <InputStats
        type={type}
        phase={phase}
        counts={counts}
        statuses={statuses}
        filters={filters}
        setFilters={setFilters}
      />
      <OfflineCollection project={project} phase={phase} fillHeight={!isVoting}>
        <ExportRow
          type={type}
          projectId={project.id}
          selectedIds={selectedIds}
        />
      </OfflineCollection>
      {isVoting && <AutoShareResults phase={phase} />}
    </>
  );
};

export default SideColumn;
