import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { MethodSpecificInsightProps } from '../types';

import AiSummary from './AiSummary';
import IdeasByTopic from './IdeasByTopic';
import messages from './messages';
import MostLikedIdeas from './MostLikedIdeas';

const IdeationInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box mt="16px" gap="12px">
      <Title variant="h3" m="0" mb="16px">
        {formatMessage(messages.whatArePeopleSaying)}
      </Title>
      <Box display="flex" gap="16px">
        <AiSummary phaseId={phaseId} />
        <IdeasByTopic phaseId={phaseId} />
      </Box>
      <Box w="50%">
        <MostLikedIdeas phaseId={phaseId} />
      </Box>
    </Box>
  );
};

export default IdeationInsights;
