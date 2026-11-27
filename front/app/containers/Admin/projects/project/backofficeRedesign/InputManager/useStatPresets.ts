import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IPhaseData } from 'api/phases/types';

import { ManagerType } from 'components/admin/PostManager';
import { UNASSIGNED } from 'components/admin/PostManager/useAssigneeOptions';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { ManagerFilters } from './useManagerParams';
import { PhaseCounts } from './usePhaseCounts';

export type PresetFilter = Pick<
  Partial<ManagerFilters>,
  'statuses' | 'assignees' | 'reply' | 'contentWarnings'
>;

export interface StatPreset {
  key: string;
  label: string;
  value: number;
  /** The filters the stat sets when pressed. */
  filter: PresetFilter;
}

const sameValues = (values: string[], target: string[]) =>
  values.length === target.length &&
  target.every((value) => values.includes(value));

/** Whether the list is filtered by exactly this preset and nothing else. */
export const isOnlyFilter = (filters: ManagerFilters, filter: PresetFilter) =>
  (!!filter.reply ||
    !!filter.statuses?.length ||
    !!filter.assignees?.length ||
    !!filter.contentWarnings) &&
  !!filters.contentWarnings === !!filter.contentWarnings &&
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
}

// The stats that need attention, each a ready-made filter for the list.
const useStatPresets = ({
  type,
  phase,
  counts,
  statuses,
}: Props): StatPreset[] => {
  const { formatMessage } = useIntl();

  if (!counts) return [];

  const isVoting = phase.attributes.participation_method === 'voting';
  const presets: StatPreset[] = [];

  const statusPreset = (
    key: string,
    label: string,
    codes: Set<string>
  ): StatPreset => {
    const ids = statuses
      .filter((status) => codes.has(status.attributes.code))
      .map((status) => status.id);

    return {
      key,
      label,
      value: ids.reduce((sum, id) => sum + (counts.byStatus[id] ?? 0), 0),
      filter: { statuses: ids },
    };
  };

  if (!isVoting && type === 'ProjectProposals') {
    presets.push(
      statusPreset(
        'awaiting',
        formatMessage(messages.waitingForResponse),
        new Set(['threshold_reached'])
      ),
      statusPreset(
        'gatheringSupport',
        formatMessage(messages.stillGatheringSupport),
        new Set(['proposed'])
      )
    );
  } else if (!isVoting) {
    presets.push({
      key: 'awaiting',
      label: formatMessage(messages.waitingForReply),
      value: counts.awaiting,
      filter: { reply: 'awaiting' },
    });
    if (counts.byAssignee) {
      presets.push({
        key: 'unassigned',
        label: formatMessage(messages.unassigned),
        value: counts.byAssignee[UNASSIGNED],
        filter: { assignees: [UNASSIGNED] },
      });
    }
  }

  if (counts.contentWarnings !== undefined) {
    presets.push({
      key: 'contentWarnings',
      label: formatMessage(messages.contentWarnings),
      value: counts.contentWarnings,
      filter: { contentWarnings: true },
    });
  }

  return presets;
};

export default useStatPresets;
