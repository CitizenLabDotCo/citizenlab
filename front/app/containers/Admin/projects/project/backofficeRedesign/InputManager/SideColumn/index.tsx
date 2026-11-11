import React, { useState } from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { ManagerType } from 'components/admin/PostManager';

import { useIntl } from 'utils/cl-intl';

import InputImporterModal from '../../Phase/BuildPanel/BuildFields/MethodSection/VotingOptionsSection/InputImporterModal';
import messages from '../messages';
import { ManagerFilters, SetFilters } from '../useManagerParams';
import { PhaseCounts } from '../usePhaseCounts';

import AutoShareResults from './AutoShareResults';
import Card from './Card';
import ExportRow from './ExportRow';
import InputStats from './InputStats';
import OfflineCollection from './OfflineCollection';
import OfflineVotesModal from './OfflineVotesModal';

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
  const isProposals = type === 'ProjectProposals';
  const { formatMessage } = useIntl();
  const [offlineOpened, setOfflineOpened] = useState(false);
  const [importOpened, setImportOpened] = useState(false);
  const exports = (
    <ExportRow type={type} projectId={project.id} selectedIds={selectedIds} />
  );

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
      {isVoting || isProposals ? (
        <Card fillHeight={!isVoting}>
          {isVoting && (
            <Button
              buttonStyle="bo-secondary"
              width="100%"
              height="44px"
              justify="space-between"
              icon="plus"
              iconPos="right"
              onClick={() => setOfflineOpened(true)}
            >
              {formatMessage(messages.addOfflineVotes)}
            </Button>
          )}
          {isVoting && (
            <Button
              buttonStyle="bo-secondary"
              width="100%"
              height="44px"
              justify="space-between"
              icon="upload-file"
              iconPos="right"
              onClick={() => setImportOpened(true)}
            >
              {formatMessage(messages.importOptions)}
            </Button>
          )}
          {exports}
        </Card>
      ) : (
        <OfflineCollection phase={phase}>{exports}</OfflineCollection>
      )}
      {offlineOpened && (
        <OfflineVotesModal
          phase={phase}
          onClose={() => setOfflineOpened(false)}
        />
      )}
      {isVoting && (
        <InputImporterModal
          projectId={project.id}
          phaseId={phase.id}
          opened={importOpened}
          onClose={() => setImportOpened(false)}
        />
      )}
      {isVoting && <AutoShareResults phase={phase} />}
    </>
  );
};

export default SideColumn;
