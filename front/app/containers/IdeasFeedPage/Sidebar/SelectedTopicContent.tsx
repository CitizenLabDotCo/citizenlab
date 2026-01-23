import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useInputTopicById from 'api/input_topics/useInputTopicById';
import useInputTopics from 'api/input_topics/useInputTopics';

import useLocalize from 'hooks/useLocalize';

import GoBackButton from 'components/UI/GoBackButton';

import messages from '../messages';

interface Props {
  projectId: string;
  topicId: string;
  onBack: () => void;
  isMobile?: boolean;
}

const SelectedTopicContent = ({ projectId, topicId, onBack }: Props) => {
  const { data: topic } = useInputTopicById(topicId);
  const { data: subtopics } = useInputTopics(projectId, {
    parentId: topicId,
    depth: 1,
  });
  const localize = useLocalize();
  console.log('subtopics', subtopics);
  return (
    <>
      <Box mb="16px">
        <GoBackButton
          onClick={onBack}
          customMessage={messages.allTopics}
          size="s"
        />
      </Box>

      <Box px="16px" mb="16px">
        <Text fontWeight="bold" variant="bodyL" mb="8px">
          {localize(topic?.data.attributes.title_multiloc)}
        </Text>
        <Text variant="bodyS" color="coolGrey600">
          {localize(topic?.data.attributes.description_multiloc)}
        </Text>
      </Box>
    </>
  );
};

export default SelectedTopicContent;
