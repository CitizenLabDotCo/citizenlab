import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useTopic from 'api/topics/useTopic';

import useLocalize from 'hooks/useLocalize';

import GoBackButton from 'components/UI/GoBackButton';

import messages from '../messages';

interface Props {
  topicId: string;
  onBack: () => void;
  isMobile?: boolean;
}

const SelectedTopicContent = ({ topicId, onBack }: Props) => {
  const { data: topic } = useTopic(topicId);
  const localize = useLocalize();

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
