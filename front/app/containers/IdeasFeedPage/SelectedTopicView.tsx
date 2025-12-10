import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { ITopicData } from 'api/topics/types';

import useLocalize from 'hooks/useLocalize';

import GoBackButton from 'components/UI/GoBackButton';

import messages from './messages';

interface Props {
  topic: ITopicData;
  onBack: () => void;
  hideBackButton?: boolean;
}

const SelectedTopicView: React.FC<Props> = ({
  topic,
  onBack,
  hideBackButton = false,
}) => {
  const localize = useLocalize();

  return (
    <>
      {!hideBackButton && (
        <Box mb="16px" px="16px">
          <GoBackButton
            onClick={onBack}
            customMessage={messages.allTopics}
            size="s"
          />
        </Box>
      )}

      <Box px="16px" mb="16px">
        <Text fontWeight="bold" variant="bodyL" mb="8px">
          {localize(topic.attributes.title_multiloc)}
        </Text>
        <Text variant="bodyS" color="coolGrey600">
          {localize(topic.attributes.description_multiloc)}
        </Text>
      </Box>
    </>
  );
};

export default SelectedTopicView;
