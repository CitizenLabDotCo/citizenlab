import React, { useState } from 'react';

import {
  Box,
  Button,
  Checkbox,
  colors,
  Select,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData } from 'api/ideas/types';
import useDeleteIdea from 'api/ideas/useDeleteIdea';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import { IInputTopicData } from 'api/input_topics/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  selectedIdeas: IIdeaData[];
  allSelected: boolean;
  onToggleAll: () => void;
  statuses: IIdeaStatusData[];
  topics: IInputTopicData[];
  onDeleted: () => void;
}

const BulkBar = ({
  selectedIdeas,
  allSelected,
  onToggleAll,
  statuses,
  topics,
  onDeleted,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { mutateAsync: updateIdea } = useUpdateIdea();
  const { mutateAsync: deleteIdea } = useDeleteIdea();
  const [processing, setProcessing] = useState(false);
  const disabled = processing || selectedIdeas.length === 0;

  const statusOptions = statuses
    .filter((status) => status.attributes.can_manually_transition_to)
    .map((status) => ({
      value: status.id,
      label: localize(status.attributes.title_multiloc),
    }));
  const topicOptions = topics.map((topic) => ({
    value: topic.id,
    label: localize(topic.attributes.title_multiloc),
  }));

  // There are no bulk endpoints, so each idea is its own request.
  const forEachIdea = async (action: (idea: IIdeaData) => Promise<unknown>) => {
    setProcessing(true);
    try {
      await Promise.all(selectedIdeas.map(action));
    } finally {
      setProcessing(false);
    }
  };

  const setStatus = (statusId: string) =>
    forEachIdea((idea) =>
      updateIdea({ id: idea.id, requestBody: { idea_status_id: statusId } })
    );

  // Adds to each idea's own tags rather than replacing them.
  const addTag = (topicId: string) =>
    forEachIdea((idea) => {
      const current = (idea.relationships.input_topics?.data ?? []).map(
        (topic) => topic.id
      );
      if (current.includes(topicId)) return Promise.resolve();
      return updateIdea({
        id: idea.id,
        requestBody: { topic_ids: [...current, topicId] },
      });
    });

  const deleteAll = async () => {
    const confirmed = window.confirm(
      formatMessage(messages.deleteSelectedConfirmation, {
        count: selectedIdeas.length,
      })
    );
    if (!confirmed) return;
    await forEachIdea((idea) => deleteIdea(idea.id));
    onDeleted();
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      flexWrap="wrap"
      gap="8px"
      p="8px 12px"
      borderRadius={stylingConsts.borderRadius}
      bgColor={colors.grey100}
    >
      <Checkbox
        checked={allSelected}
        onChange={onToggleAll}
        ariaLabel={formatMessage(messages.selectAll)}
      />
      <Text m="0" mr="8px" fontSize="s" fontWeight="semi-bold">
        {formatMessage(messages.selectedCount, {
          count: selectedIdeas.length,
        })}
      </Text>
      <Box flex="0 0 160px">
        <Select
          size="small"
          placeholder={formatMessage(messages.setStatus)}
          options={statusOptions}
          value={null}
          disabled={disabled}
          onChange={(option) => {
            if (typeof option.value === 'string') setStatus(option.value);
          }}
        />
      </Box>
      <Box flex="0 0 160px">
        <Select
          size="small"
          placeholder={formatMessage(messages.addTag)}
          options={topicOptions}
          value={null}
          disabled={disabled}
          onChange={(option) => {
            if (typeof option.value === 'string') addTag(option.value);
          }}
        />
      </Box>
      <Button
        buttonStyle="delete"
        size="s"
        icon="delete"
        processing={processing}
        disabled={disabled}
        onClick={deleteAll}
      >
        {formatMessage(messages.deleteSelected)}
      </Button>
    </Box>
  );
};

export default BulkBar;
