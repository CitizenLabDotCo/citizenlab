import React, { memo, useCallback } from 'react';

import {
  IconButton,
  colors,
  Box,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';
import { pull } from 'lodash-es';

import useInputTopics from 'api/input_topics/useInputTopics';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  selectedTopics: string[];
  projectId: string;
  onUpdateTopics: (topicIds: string[]) => void;
}

const TopicsSelector = memo<Props>(
  ({ selectedTopics, projectId, onUpdateTopics }) => {
    const { formatMessage } = useIntl();
    const { data: topics } = useInputTopics(projectId);
    const filteredTopics = topics?.data.filter((topic) =>
      selectedTopics.includes(topic.id)
    );
    const handleTopicDelete = useCallback(
      (topicId: string) => {
        const newSelectedTopics = pull(selectedTopics, topicId);
        onUpdateTopics(newSelectedTopics);
      },
      [selectedTopics, onUpdateTopics]
    );

    if (filteredTopics) {
      return (
        <Box display="flex" gap="8px">
          {filteredTopics.map((topic) => {
            return (
              <Box
                key={topic.id}
                border={`1px solid ${colors.teal}`}
                borderRadius={stylingConsts.borderRadius}
                display="flex"
                w="fit-content"
                alignItems="center"
                gap="4px"
                pl="8px"
                py="4px"
              >
                <Text
                  as="span"
                  m="0"
                  fontWeight="semi-bold"
                  fontSize="xs"
                  color="teal"
                >
                  <T value={topic.attributes.full_title_multiloc} />
                </Text>
                <IconButton
                  iconName="close"
                  onClick={() => handleTopicDelete(topic.id)}
                  a11y_buttonActionMessage={formatMessage(messages.removeTopic)}
                  iconColor={colors.teal}
                  iconColorOnHover={colors.teal}
                  iconWidth="16px"
                  iconHeight="16px"
                />
              </Box>
            );
          })}
        </Box>
      );
    }

    return null;
  }
);

export default TopicsSelector;
