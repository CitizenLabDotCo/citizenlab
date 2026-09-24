import React from 'react';

import {
  Box,
  Button,
  Select,
  fontSizes,
} from '@citizenlab/cl2-component-library';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { Sort } from 'api/ideas/types';
import { IInputTopicData } from 'api/input_topics/types';

import SearchInput from 'components/UI/SearchInput';

import { useIntl } from 'utils/cl-intl';

import FiltersDropdown from './FiltersDropdown';
import messages from './messages';

interface Props {
  projectId: string;
  statuses: IIdeaStatusData[];
  topics: IInputTopicData[];
  sort: Sort;
  status?: string;
  topic?: string;
  assignee?: string;
  allPhases: boolean;
  resultCount: number;
  selecting: boolean;
  onChangeSearch: (search: string | null) => void;
  onChangeSort: (sort: Sort) => void;
  onChangeStatus: (status: string | undefined) => void;
  onChangeTopic: (topic: string | undefined) => void;
  onChangeAssignee: (assignee: string | undefined) => void;
  onChangeAllPhases: (allPhases: boolean) => void;
  onToggleSelecting: () => void;
}

const ListToolbar = ({
  projectId,
  statuses,
  topics,
  sort,
  status,
  topic,
  assignee,
  allPhases,
  resultCount,
  selecting,
  onChangeSearch,
  onChangeSort,
  onChangeStatus,
  onChangeTopic,
  onChangeAssignee,
  onChangeAllPhases,
  onToggleSelecting,
}: Props) => {
  const { formatMessage } = useIntl();

  const sortOptions: { value: Sort; label: string }[] = [
    { value: 'likes_count', label: formatMessage(messages.sortMostLiked) },
    { value: 'new', label: formatMessage(messages.sortNewest) },
    { value: '-new', label: formatMessage(messages.sortOldest) },
    {
      value: 'comments_count',
      label: formatMessage(messages.sortMostComments),
    },
  ];

  return (
    <Box display="flex" gap="8px" flexWrap="wrap" alignItems="center">
      <Box flex="0 1 260px">
        <SearchInput
          size="small"
          debounce={500}
          placeholder={formatMessage(messages.searchIdeas)}
          onChange={onChangeSearch}
          a11y_numberOfSearchResults={resultCount}
        />
      </Box>
      <Box flex="0 0 190px">
        <Select
          size="small"
          options={sortOptions}
          value={sort}
          onChange={(option) => {
            const selected = sortOptions.find(
              ({ value }) => value === option.value
            );
            if (selected) onChangeSort(selected.value);
          }}
        />
      </Box>
      <FiltersDropdown
        projectId={projectId}
        statuses={statuses}
        topics={topics}
        status={status}
        topic={topic}
        assignee={assignee}
        allPhases={allPhases}
        onChangeStatus={onChangeStatus}
        onChangeTopic={onChangeTopic}
        onChangeAssignee={onChangeAssignee}
        onChangeAllPhases={onChangeAllPhases}
      />
      <Button
        buttonStyle={selecting ? 'secondary' : 'secondary-outlined'}
        padding="6px 12px"
        fontSize={`${fontSizes.s}px`}
        iconSize="16px"
        icon="check-circle"
        ariaPressed={selecting}
        onClick={onToggleSelecting}
      >
        {formatMessage(selecting ? messages.doneSelecting : messages.select)}
      </Button>
    </Box>
  );
};

export default ListToolbar;
