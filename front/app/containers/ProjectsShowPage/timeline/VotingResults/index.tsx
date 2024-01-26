import React from 'react';

// api
import useIdeas from 'api/ideas/useIdeas';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import VotingResultCard from './VotingResultCard';
import { VotingMethod } from 'api/phases/types';

interface Props {
  phaseId: string;
  votingMethod: VotingMethod;
}

const VotingResults = ({ phaseId, votingMethod }: Props) => {
  const { data: ideas } = useIdeas({
    phase: phaseId,
    sort: votingMethod === 'budgeting' ? 'baskets_count' : 'votes_count',
  });
  const smallerThanPhone = useBreakpoint('phone');

  if (!ideas) return null;

  const getMx = (i: number) =>
    smallerThanPhone ? {} : i % 2 ? { ml: '8px' } : { mr: '8px' };

  const getRanking = (
    index: number,
    attributeName: 'baskets_count' | 'votes_count'
  ): number => {
    let currentRank = 1;
    let prevCount = ideas.data[0].attributes[attributeName];

    for (let i = 0; i <= index; i++) {
      const currentCount = ideas.data[i].attributes[attributeName];

      if (
        typeof prevCount === 'number' &&
        typeof currentCount === 'number' &&
        currentCount < prevCount
      ) {
        currentRank++;
        prevCount = currentCount;
      }
    }

    return currentRank;
  };

  const getBasketsRanking = (index: number): number =>
    getRanking(index, 'baskets_count');
  const getVotesRank = (index: number): number =>
    getRanking(index, 'votes_count');

  return (
    <Box
      mt={smallerThanPhone ? '4px' : '8px'}
      w="100%"
      display="flex"
      flexWrap="wrap"
      justifyContent="space-between"
    >
      {ideas.data.map((idea, i) => (
        <Box
          key={idea.id}
          mb={smallerThanPhone ? '8px' : '20px'}
          flexGrow={0}
          width={smallerThanPhone ? '100%' : 'calc(50% - 16px)'}
          {...getMx(i)}
        >
          <VotingResultCard
            idea={idea}
            phaseId={phaseId}
            rank={
              votingMethod === 'budgeting'
                ? getBasketsRanking(i)
                : getVotesRank(i)
            }
          />
        </Box>
      ))}
    </Box>
  );
};

export default VotingResults;
