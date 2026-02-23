import React from 'react';

import { Box, Title, Text, Spinner } from '@citizenlab/cl2-component-library';

import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';

import IdeaCard from 'components/IdeaCard';

import { useIntl } from 'utils/cl-intl';

import { MethodSpecificInsightProps } from '../types';

import messages from './messages';

const NUMBER_OF_PROPOSALS = 5;

const MostLikedProposals = ({ phaseId }: MethodSpecificInsightProps) => {
  const { formatMessage } = useIntl();

  const { data: proposalsData, isLoading } = useInfiniteIdeas({
    phase: phaseId,
    sort: 'popular',
    'page[size]': NUMBER_OF_PROPOSALS,
  });

  const proposals = proposalsData?.pages[0]?.data ?? [];

  if (isLoading) {
    return (
      <Box
        p="24px"
        bg="white"
        borderRadius="3px"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner size="24px" />
      </Box>
    );
  }

  if (proposals.length === 0) {
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
        {proposals.map((proposal) => (
          <Box key={proposal.id} pb="16px">
            <IdeaCard ideaId={proposal.id} phaseId={phaseId} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MostLikedProposals;
