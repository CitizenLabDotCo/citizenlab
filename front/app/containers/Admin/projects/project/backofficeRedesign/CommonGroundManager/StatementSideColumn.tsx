import React from 'react';

import Disclosure from 'design-system/Disclosure';

import { CommonGroundResultsData } from 'api/common_ground/types';

import { useIntl } from 'utils/cl-intl';

import Card from '../InputManager/SideColumn/Card';
import ExportRow from '../InputManager/SideColumn/ExportRow';

import messages from './messages';
import StatementStats, { StatementStatFilter } from './StatementStats';
import { totalReactions } from './utils';
import 'design-system/tokens.css';

interface Props {
  projectId: string;
  stats: CommonGroundResultsData['attributes']['stats'] | undefined;
  filters: StatementStatFilter[];
  selectedIds: string[];
  onAdd: () => void;
  onImport: () => void;
}

const StatementSideColumn = ({
  projectId,
  stats,
  filters,
  selectedIds,
  onAdd,
  onImport,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      {stats && (
        <StatementStats
          reactions={totalReactions(stats.votes)}
          filters={filters}
        />
      )}
      <Card fillHeight>
        <Disclosure
          header="button"
          title={formatMessage(messages.addStatement)}
          actionIcon="plus-16"
          onPress={onAdd}
        />
        <Disclosure
          header="button"
          title={formatMessage(messages.importInputs)}
          actionIcon="upload-16"
          onPress={onImport}
        />
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
