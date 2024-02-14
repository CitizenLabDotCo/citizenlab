import React from 'react';

// api
import useIdeas from 'api/ideas/useIdeas';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import VotingResultCard from './VotingResultCard';
import { VotingMethod } from 'api/phases/types';
import { IIdeas } from 'api/ideas/types';

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
              getRanks(
                getCounts(
                  ideas,
                  votingMethod === 'budgeting' ? 'baskets_count' : 'votes_count'
                )
              )[i]
            }
          />
        </Box>
      ))}
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

const getCounts = (
  ideas: IIdeas,
  attributeName: 'baskets_count' | 'votes_count'
) => ideas.data.map((idea) => idea.attributes[attributeName]);

export default VotingResults;
