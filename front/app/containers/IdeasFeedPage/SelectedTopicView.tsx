import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import { ITopicData } from 'api/topics/types';

import useLocalize from 'hooks/useLocalize';

interface Props {
  topic: ITopicData;
  onBack: () => void;
}

const SelectedTopicView: React.FC<Props> = ({ topic, onBack }) => {
  const localize = useLocalize();

  return (
    <>
      <Box mb="16px" px="16px">
        <Button buttonStyle="text" icon="arrow-left" onClick={onBack} p="0px">
          All topics
        </Button>
      </Box>

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
