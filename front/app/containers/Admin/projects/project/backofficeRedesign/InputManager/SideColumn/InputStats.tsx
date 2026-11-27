import React from 'react';

import StatRow from 'design-system/StatRow';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import {
  BudgetingMetrics,
  VotingMetrics,
} from 'api/phase_insights/types';
import usePhaseInsights from 'api/phase_insights/usePhaseInsights';
import { IPhaseData } from 'api/phases/types';

import { ManagerType } from 'components/admin/PostManager';

import { useIntl } from 'utils/cl-intl';

import StatsSkeleton from '../../WorkspaceSkeleton/StatsSkeleton';
import messages from '../messages';
import { ManagerFilters, SetFilters } from '../useManagerParams';
import { PhaseCounts } from '../usePhaseCounts';
import useStatPresets, { isOnlyFilter, PresetFilter } from '../useStatPresets';

import styles from './SideColumn.module.css';

interface Row {
  key: string;
  label: string;
  value: number;
  /** What the row filters the list to. Absent when it can't filter. */
  filter?: PresetFilter;
}

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
  const presets = useStatPresets({ type, phase, counts, statuses });
  const isVoting = phase.attributes.participation_method === 'voting';
  const isBudgeting =
    isVoting && phase.attributes.voting_method === 'budgeting';
  // A budgeting phase's vote total is the money allocated, so its votes are
  // the picks, which only the phase insights count.
  const { data: insights, isLoading: isLoadingPicks } = usePhaseInsights({
    phaseId: phase.id,
    enabled: isBudgeting,
  });
  const metrics = insights?.data.attributes.metrics;
  // The insights send a budgeting phase's picks under `voting`.
  const votingMetrics: VotingMetrics | BudgetingMetrics | undefined =
    metrics?.voting ?? metrics?.budgeting;
  const onlinePicks =
    votingMetrics && 'online_picks' in votingMetrics
      ? votingMetrics.online_picks
      : 0;

  if (!counts && !isVoting) return <StatsSkeleton />;
  if (isBudgeting && isLoadingPicks) return <StatsSkeleton />;

  // The online and offline counts add up to the phase's vote total.
  const offlineVotes = phase.attributes.manual_votes_count;
  const onlineVotes = isBudgeting
    ? onlinePicks
    : phase.attributes.votes_count;

  const rows: Row[] = isVoting
    ? [
        {
          key: 'votes',
          label: formatMessage(messages.totalVotesColumn),
          value: onlineVotes + offlineVotes,
        },
        {
          key: 'offlineVotes',
          label: formatMessage(messages.offlineVotes),
          value: offlineVotes,
        },
        ...presets,
      ]
    : presets;

  const toggleRow = (filter: PresetFilter, active: boolean) =>
    setFilters(
      // The counts are for the listed phase, so keep it.
      { ...(active ? {} : filter), phase: filters.phase },
      { replace: true }
    );

  return (
    <div className={styles.stats}>
      {rows.map(({ key, label, value, filter }) => {
        const active = !!filter && isOnlyFilter(filters, filter);
        const canFilter = !!filter && (value > 0 || active);

        return canFilter ? (
          <StatRow
            key={key}
            label={label}
            value={value}
            onPress={() => toggleRow(filter, active)}
            isPressed={active}
          />
        ) : (
          <StatRow key={key} label={label} value={value} />
        );
      })}
    </div>
  );
};

export default InputStats;
