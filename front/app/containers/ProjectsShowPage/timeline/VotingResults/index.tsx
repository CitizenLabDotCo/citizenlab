import React from 'react';

import { Box, Button, useBreakpoint } from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';
import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';
import { VotingMethod } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import VotingResultCard from './VotingResultCard';

interface Props {
  phaseId: string;
  votingMethod: VotingMethod;
}

const VotingResults = ({ phaseId, votingMethod }: Props) => {
  const { formatMessage } = useIntl();

  const {
    data: ideas,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteIdeas({
    phase: phaseId,
    sort: votingMethod === 'budgeting' ? 'total_baskets' : 'total_votes',
  });

  const smallerThanPhone = useBreakpoint('phone');

  const ideasList = ideas?.pages.map((page) => page.data).flat();
  if (!ideasList) return null;

  const getMx = (i: number) =>
    smallerThanPhone ? {} : i % 2 ? { ml: '8px' } : { mr: '8px' };

  const ranks = getRanks(getCounts(ideasList));

  return (
    <Box
      mt={smallerThanPhone ? '4px' : '8px'}
      w="100%"
      display="flex"
      flexWrap="wrap"
      justifyContent="space-between"
    >
      {ideasList.map((idea, i) => (
        <Box
          key={idea.id}
          mb={smallerThanPhone ? '8px' : '20px'}
          flexGrow={0}
          width={smallerThanPhone ? '100%' : 'calc(50% - 16px)'}
          {...getMx(i)}
        >
          <VotingResultCard idea={idea} phaseId={phaseId} rank={ranks[i]} />
        </Box>
      ))}
      {hasNextPage && (
        <Box width="100%" display="flex" justifyContent="center" mt="30px">
          <Button
            onClick={() => fetchNextPage()}
            buttonStyle="secondary-outlined"
            text={formatMessage(messages.showMore)}
            processing={isLoading || isFetchingNextPage}
            icon="refresh"
          />
        </Box>
      )}
    </Box>
  );
};

const getRanks = (counts: number[]) => {
  let currentRank = 1;
  const ranks: number[] = [];

  for (let i = 0; i < counts.length; i++) {
    if (i === 0) {
      ranks.push(currentRank);
    } else {
      const count = counts[i];
      const prevCount = counts[i - 1];

      if (count < prevCount) {
        currentRank = i + 1;
      }
      ranks.push(currentRank);
    }
  }

  return ranks;
};

const getCounts = (ideas: IIdeaData[]) =>
  ideas.map((idea) => idea.attributes.total_votes);

export default VotingResults;
