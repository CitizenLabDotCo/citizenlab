import React from 'react';

import { IconNames } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import { ManagerType } from 'components/admin/PostManager';
import usePrescreeningStatusFilter from 'components/admin/PostManager/components/FilterSidebar/statuses/usePrescreeningStatusFilter';
import postManagerMessages from 'components/admin/PostManager/messages';
import useAssigneeOptions from 'components/admin/PostManager/useAssigneeOptions';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from '../messages';
import { Option } from '../OptionList';
import {
  isReplyFilter,
  isSourceFilter,
  ManagerFilters,
} from '../useManagerParams';
import { PhaseCounts } from '../usePhaseCounts';
import usePickerOptions from '../usePickerOptions';

export type FilterCategoryKey =
  | 'phase'
  | 'source'
  | 'status'
  | 'assignee'
  | 'tags'
  | 'reply';

export interface FilterCategory {
  key: FilterCategoryKey;
  label: string;
  icon: IconNames;
  options: Option[];
  selected: string[];
  multiple: boolean;
  searchable: boolean;
  isActive: boolean;
  toggle: (value: string) => void;
  clear: () => void;
}

const ALL_PHASES = 'all';

const toggled = (values: string[], value: string) =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

interface Props {
  type: ManagerType;
  projectId: string;
  phase: IPhaseData;
  filters: ManagerFilters;
  setFilters: (changes: Partial<ManagerFilters>) => void;
  counts: PhaseCounts | undefined;
}

const useFilterCategories = ({
  type,
  projectId,
  phase,
  filters,
  setFilters,
  counts,
}: Props): FilterCategory[] => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const isProposals = type === 'ProjectProposals';
  const { statuses, tagOptions, phaseOptions } = usePickerOptions(
    type,
    projectId
  );
  const assigneeOptions = useAssigneeOptions(projectId, getFullName);
  const prescreening = usePrescreeningStatusFilter(type);

  const statusOptions: Option[] = statuses.map((status) => {
    const isPrescreening = status.attributes.code === 'prescreening';
    const disabled = isPrescreening && !prescreening.isEnabled;

    return {
      value: status.id,
      label: localize(status.attributes.title_multiloc),
      color: status.attributes.color,
      count: counts?.byStatus[status.id] ?? 0,
      disabled,
      disabledReason: prescreening.showPrescreeningUpsellTooltip ? (
        <FormattedMessage {...postManagerMessages.prescreeningTooltipUpsell} />
      ) : prescreening.showPhaseSettingIsDisabledTooltip ? (
        <FormattedMessage
          {...postManagerMessages.prescreeningTooltipPhaseDisabled}
        />
      ) : undefined,
    };
  });

  const categories: FilterCategory[] = [
    {
      key: 'source',
      label: formatMessage(messages.filterSource),
      icon: 'download',
      options: [
        {
          value: 'online',
          label: formatMessage(messages.sourceOnline),
          count: counts?.online,
        },
        {
          value: 'imported',
          label: formatMessage(messages.sourceImported),
          count: counts?.imported,
        },
      ],
      selected: filters.source ? [filters.source] : [],
      multiple: false,
      searchable: false,
      isActive: !!filters.source,
      toggle: (value) => {
        if (!isSourceFilter(value)) return;
        setFilters({ source: value === filters.source ? undefined : value });
      },
      clear: () => setFilters({ source: undefined }),
    },
    {
      key: 'status',
      label: formatMessage(messages.filterStatus),
      icon: 'check-circle',
      options: statusOptions,
      selected: filters.statuses,
      multiple: true,
      searchable: statusOptions.length > 8,
      isActive: filters.statuses.length > 0,
      toggle: (value) =>
        setFilters({ statuses: toggled(filters.statuses, value) }),
      clear: () => setFilters({ statuses: [] }),
    },
    {
      key: 'assignee',
      label: formatMessage(messages.filterAssignee),
      icon: 'user',
      options: assigneeOptions.map((option) => ({
        ...option,
        count: counts?.byAssignee && (counts.byAssignee[option.value] ?? 0),
      })),
      selected: filters.assignees,
      multiple: true,
      searchable: assigneeOptions.length > 8,
      isActive: filters.assignees.length > 0,
      toggle: (value) =>
        setFilters({ assignees: toggled(filters.assignees, value) }),
      clear: () => setFilters({ assignees: [] }),
    },
    {
      key: 'tags',
      label: formatMessage(messages.filterTags),
      icon: 'label',
      options: tagOptions.map((option) => ({
        ...option,
        count: counts?.byTopic[option.value] ?? 0,
      })),
      selected: filters.topics,
      multiple: true,
      searchable: true,
      isActive: filters.topics.length > 0,
      toggle: (value) => setFilters({ topics: toggled(filters.topics, value) }),
      clear: () => setFilters({ topics: [] }),
    },
    {
      key: 'reply',
      label: formatMessage(messages.filterReply),
      icon: 'chat-bubble',
      options: [
        {
          value: 'awaiting',
          label: formatMessage(messages.replyAwaiting),
          count: counts?.awaiting,
        },
        {
          value: 'replied',
          label: formatMessage(messages.replyReplied),
          count: counts?.replied,
        },
      ],
      selected: filters.reply ? [filters.reply] : [],
      multiple: false,
      searchable: false,
      isActive: !!filters.reply,
      toggle: (value) => {
        if (!isReplyFilter(value)) return;
        setFilters({ reply: value === filters.reply ? undefined : value });
      },
      clear: () => setFilters({ reply: undefined }),
    },
  ];

  // Proposals only ever belong to the phase they were posted in.
  if (isProposals) return categories;

  const phaseCategory: FilterCategory = {
    key: 'phase',
    label: formatMessage(messages.filterPhase),
    icon: 'timeline',
    options: [
      {
        value: ALL_PHASES,
        label: formatMessage(postManagerMessages.allPhases),
      },
      ...phaseOptions,
    ],
    selected: [filters.phase ?? ALL_PHASES],
    multiple: false,
    searchable: phaseOptions.length > 8,
    isActive: filters.phase !== phase.id,
    toggle: (value) =>
      setFilters({ phase: value === ALL_PHASES ? undefined : value }),
    clear: () => setFilters({ phase: phase.id }),
  };

  return [phaseCategory, ...categories];
};

export default useFilterCategories;
