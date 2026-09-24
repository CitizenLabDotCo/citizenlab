import React from 'react';

import {
  Box,
  IconButton,
  Select,
  colors,
} from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import { IInputTopicData } from 'api/input_topics/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import TagChip from '../TagChip';

interface Props {
  idea: IIdeaData;
  topics: IInputTopicData[];
}

const DrawerTags = ({ idea, topics }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { mutate: updateIdea } = useUpdateIdea();

  const selectedIds = (idea.relationships.input_topics?.data ?? []).map(
    (topic) => topic.id
  );
  const selected = topics.filter((topic) => selectedIds.includes(topic.id));
  const addable = topics
    .filter((topic) => !selectedIds.includes(topic.id))
    .map((topic) => ({
      value: topic.id,
      label: localize(topic.attributes.title_multiloc),
    }));

  const setTopics = (topicIds: string[]) =>
    updateIdea({ id: idea.id, requestBody: { topic_ids: topicIds } });

  return (
    <Box display="flex" flexWrap="wrap" alignItems="center" gap="6px">
      {selected.map((topic) => {
        const title = localize(topic.attributes.title_multiloc);

        return (
          <TagChip
            key={topic.id}
            action={
              <IconButton
                iconName="close"
                iconWidth="12px"
                iconHeight="12px"
                iconColor={colors.coolGrey600}
                iconColorOnHover={colors.textPrimary}
                a11y_buttonActionMessage={title}
                onClick={() =>
                  setTopics(selectedIds.filter((id) => id !== topic.id))
                }
              />
            }
          >
            {title}
          </TagChip>
        );
      })}
      {addable.length > 0 && (
        <Box flex="0 0 150px">
          <Select
            size="small"
            placeholder={formatMessage(messages.addTag)}
            options={addable}
            value={null}
            onChange={(option) => {
              if (typeof option.value === 'string') {
                setTopics([...selectedIds, option.value]);
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default DrawerTags;
