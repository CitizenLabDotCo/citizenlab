import React from 'react';

import { Box, Title, Text, Spinner } from '@citizenlab/cl2-component-library';

import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';

import IdeaCard from 'components/IdeaCard';

import { useIntl } from 'utils/cl-intl';

import { MethodSpecificInsightProps } from '../types';

import messages from './messages';

const NUMBER_OF_IDEAS = 5;

const MostLikedIdeas = ({ phaseId }: MethodSpecificInsightProps) => {
  const { formatMessage } = useIntl();

  const { data: ideasData, isLoading } = useInfiniteIdeas({
    phase: phaseId,
    sort: 'popular',
    'page[size]': NUMBER_OF_IDEAS,
  });

  const ideas = ideasData?.pages[0]?.data ?? [];

  if (isLoading) {
    return (
      <Box mt="24px" p="24px" bg="white" borderRadius="3px">
        <Box display="flex" alignItems="center" gap="8px">
          <Spinner size="24px" />
          <Text m="0">{formatMessage(messages.loading)}</Text>
        </Box>
      </Box>
    );
  }

  if (ideas.length === 0) {
    return null;
  }

  return (
    <Box mt="24px" p="8px" background="rgba(4, 77, 108, 0.05)">
      <Title variant="h3" m="0" mb="8px">
        {formatMessage(messages.mostLiked)}
      </Title>
      <Text m="0" mb="16px" color="textSecondary">
        {formatMessage(messages.mostLikedDescription)}
      </Text>
      <Box
        bg="white"
        borderRadius="3px"
        display="flex"
        flexDirection="column"
        gap="16px"
      >
        {ideas.map((idea) => (
          <Box key={idea.id} pb="16px">
            <IdeaCard ideaId={idea.id} phaseId={phaseId} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MostLikedIdeas;
