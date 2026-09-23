import React, { useState } from 'react';

import {
  Box,
  Button,
  CheckboxWithLabel,
  Dropdown,
  Select,
  fontSizes,
} from '@citizenlab/cl2-component-library';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IInputTopicData } from 'api/input_topics/types';

import useLocalize from 'hooks/useLocalize';

import Outlet from 'components/Outlet';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ALL = 'all';

interface Props {
  projectId: string;
  statuses: IIdeaStatusData[];
  topics: IInputTopicData[];
  status?: string;
  topic?: string;
  assignee?: string;
  allPhases: boolean;
  onChangeStatus: (status: string | undefined) => void;
  onChangeTopic: (topic: string | undefined) => void;
  onChangeAssignee: (assignee: string | undefined) => void;
  onChangeAllPhases: (allPhases: boolean) => void;
}

const FiltersDropdown = ({
  projectId,
  statuses,
  topics,
  status,
  topic,
  assignee,
  allPhases,
  onChangeStatus,
  onChangeTopic,
  onChangeAssignee,
  onChangeAllPhases,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [opened, setOpened] = useState(false);

  const activeCount = [status, topic, assignee, allPhases || undefined].filter(
    Boolean
  ).length;
  const statusOptions = [
    { value: ALL, label: formatMessage(messages.anyStatus) },
    ...statuses.map((status) => ({
      value: status.id,
      label: localize(status.attributes.title_multiloc),
    })),
  ];
  const topicOptions = [
    { value: ALL, label: formatMessage(messages.anyTag) },
    ...topics.map((topic) => ({
      value: topic.id,
      label: localize(topic.attributes.title_multiloc),
    })),
  ];
  const toFilter = (value: unknown) =>
    typeof value === 'string' && value !== ALL ? value : undefined;

  return (
    <Box position="relative">
      <Button
        buttonStyle={activeCount > 0 ? 'secondary' : 'secondary-outlined'}
        padding="6px 12px"
        fontSize={`${fontSizes.s}px`}
        iconSize="16px"
        icon="filter"
        onClick={() => setOpened((opened) => !opened)}
      >
        {activeCount > 0
          ? formatMessage(messages.filtersActive, { count: activeCount })
          : formatMessage(messages.filters)}
      </Button>
      <Dropdown
        opened={opened}
        onClickOutside={() => setOpened(false)}
        top="40px"
        left="0px"
        width="300px"
        content={
          <Box display="flex" flexDirection="column" gap="12px" p="8px">
            <Select
              size="small"
              label={formatMessage(messages.status)}
              options={statusOptions}
              value={status ?? ALL}
              onChange={(option) => onChangeStatus(toFilter(option.value))}
            />
            {topics.length > 0 && (
              <Select
                size="small"
                label={formatMessage(messages.tags)}
                options={topicOptions}
                value={topic ?? ALL}
                onChange={(option) => onChangeTopic(toFilter(option.value))}
              />
            )}
            <Outlet
              id="app.components.admin.PostManager.topActionBar"
              assignee={assignee}
              projectId={projectId}
              handleAssigneeFilterChange={onChangeAssignee}
              type="ProjectIdeas"
            />
            <CheckboxWithLabel
              checked={allPhases}
              onChange={() => onChangeAllPhases(!allPhases)}
              label={formatMessage(messages.allPhases)}
              size="18px"
            />
          </Box>
        }
      />
    </Box>
  );
};

export default FiltersDropdown;
