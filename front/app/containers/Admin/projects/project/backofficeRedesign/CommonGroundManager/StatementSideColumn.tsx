import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import { CommonGroundResultsData } from 'api/common_ground/types';

import { useIntl } from 'utils/cl-intl';

import { actionRowProps } from '../InputManager/SideColumn/actionRowProps';
import Card from '../InputManager/SideColumn/Card';
import ExportRow from '../InputManager/SideColumn/ExportRow';

import messages from './messages';
import StatementStats from './StatementStats';
import { totalReactions } from './utils';

interface Props {
  projectId: string;
  stats: CommonGroundResultsData['attributes']['stats'] | undefined;
  phaseTotal: number | undefined;
  selectedIds: string[];
  onAdd: () => void;
  onImport: () => void;
}

const StatementSideColumn = ({
  projectId,
  stats,
  phaseTotal,
  selectedIds,
  onAdd,
  onImport,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      {stats && (
        <StatementStats
          statements={phaseTotal ?? stats.num_ideas}
          reactions={totalReactions(stats.votes)}
          participants={stats.num_participants}
        />
      )}
      <Card fillHeight>
        <Button {...actionRowProps} icon="plus" onClick={onAdd}>
          {formatMessage(messages.addStatement)}
        </Button>
        <Button {...actionRowProps} icon="upload-file" onClick={onImport}>
          {formatMessage(messages.importInputs)}
        </Button>
        <ExportRow
          type="ProjectProposals"
          projectId={projectId}
          selectedIds={selectedIds}
        />
      </Card>
    </>
  );
};

export default StatementSideColumn;
