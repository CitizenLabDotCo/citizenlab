import React from 'react';

import { bo, Box, colors } from '@citizenlab/cl2-component-library';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IPhaseData } from 'api/phases/types';

import { ManagerType } from 'components/admin/PostManager';
import { UNASSIGNED } from 'components/admin/PostManager/useAssigneeOptions';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import useInputTermLabels from '../useInputTermLabels';
import { ManagerFilters, SetFilters } from '../useManagerParams';
import { PhaseCounts } from '../usePhaseCounts';

import StatRow from './StatRow';

// Ideation statuses that mean the input was taken on.
const ACCEPTED_CODES = new Set(['accepted', 'implemented']);

type RowFilter = Pick<
  Partial<ManagerFilters>,
  'statuses' | 'assignees' | 'reply'
>;

interface Row {
  key: string;
  label: string;
  value: number;
  /** What the row filters the list to. Absent when it can't filter. */
  filter?: RowFilter;
}

const sameValues = (values: string[], target: string[]) =>
  values.length === target.length &&
  target.every((value) => values.includes(value));

const isOnlyFilter = (filters: ManagerFilters, filter: RowFilter) =>
  (!!filter.reply || !!filter.statuses?.length || !!filter.assignees?.length) &&
  filters.reply === filter.reply &&
  sameValues(filters.statuses, filter.statuses ?? []) &&
  sameValues(filters.assignees, filter.assignees ?? []) &&
  filters.topics.length === 0 &&
  !filters.source;

interface Props {
  type: ManagerType;
  phase: IPhaseData;
  counts: PhaseCounts | undefined;
  statuses: IIdeaStatusData[];
  filters: ManagerFilters;
  setFilters: SetFilters;
}

// The phase total, then what needs attention. A row replaces any filters with
// its own; a second click clears it. An empty row can't filter, unless it's on.
const InputStats = ({
  type,
  phase,
  counts,
  statuses,
  filters,
  setFilters,
}: Props) => {
  const { formatMessage } = useIntl();
  const { capitalizedTerms } = useInputTermLabels();
  const isVoting = phase.attributes.participation_method === 'voting';
  const isProposals = type === 'ProjectProposals';
  // A budgeting phase has no vote total: it counts the money allocated.
  const showVotes = isVoting && phase.attributes.voting_method !== 'budgeting';

  if (!counts && !showVotes) return null;

  const { total_votes_amount: votes, manual_votes_count: offlineVotes } =
    phase.attributes;

  const statusRow = (key: string, label: string, codes: Set<string>): Row => {
    const ids = statuses
      .filter((status) => codes.has(status.attributes.code))
      .map((status) => status.id);

    return {
      key,
      label,
      value: ids.reduce((sum, id) => sum + (counts?.byStatus[id] ?? 0), 0),
      filter: { statuses: ids },
    };
  };

  const rows: Row[] = [];

  if (counts) {
    rows.push({ key: 'inputs', label: capitalizedTerms, value: counts.total });
  }

  if (showVotes) {
    rows.push(
      { key: 'votes', label: formatMessage(messages.votes), value: votes },
      {
        key: 'offlineVotes',
        label: formatMessage(messages.offlineVotes),
        value: offlineVotes,
      }
    );
  }

  if (counts) {
    if (counts.byAssignee) {
      rows.push({
        key: 'unassigned',
        label: formatMessage(messages.unassigned),
        value: counts.byAssignee[UNASSIGNED],
        filter: { assignees: [UNASSIGNED] },
      });
    }

    rows.push(
      {
        key: 'awaiting',
        label: formatMessage(
          isProposals ? messages.waitingForResponse : messages.waitingForReply
        ),
        value: counts.awaiting,
        filter: { reply: 'awaiting' },
      },
      {
        key: 'replied',
        label: formatMessage(messages.respondedTile),
        value: counts.replied,
        filter: { reply: 'replied' },
      },
      isProposals
        ? statusRow(
            'gatheringSupport',
            formatMessage(messages.stillGatheringSupport),
            new Set(['proposed'])
          )
        : statusRow(
            'accepted',
            formatMessage(messages.acceptedTile),
            ACCEPTED_CODES
          )
    );
  }

  const toggleRow = (filter: RowFilter, active: boolean) =>
    setFilters(
      // The counts are for the listed phase, so keep it.
      { ...(active ? {} : filter), phase: filters.phase },
      { replace: true }
    );

  return (
    <Box p="8px" borderRadius={bo.panelBorderRadius} background={colors.white}>
      {rows.map(({ key, label, value, filter }) => {
        const active = !!filter && isOnlyFilter(filters, filter);
        const canFilter = !!filter && (value > 0 || active);

        return (
          <StatRow
            key={key}
            label={label}
            value={value}
            onClick={canFilter ? () => toggleRow(filter, active) : undefined}
            pressed={active}
          />
        );
      })}
    </Box>
  );
};

export default InputStats;
