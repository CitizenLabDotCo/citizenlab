import React, { useMemo } from 'react';

// api
import useIdeas from 'api/ideas/useIdeas';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import VotingResultCard from './VotingResultCard';

// typings
import { IIdeaData } from 'api/ideas/types';

interface Props {
  phaseId: string;
}

const VotingResults = ({ phaseId }: Props) => {
  const { data: ideas } = useIdeas({
    phase: phaseId,
    sort: 'baskets_count', // TODO: replace with votes_count when implemented by James
  });
  const smallerThanPhone = useBreakpoint('phone');

  const desktopRows = useMemo(() => {
    if (!ideas || smallerThanPhone) return;

    const columns: IIdeaData[][] = [];

    for (let i = 0; i < ideas.data.length; i = i + 2) {
      const ideaLeft = ideas.data[i];
      const ideaRight: IIdeaData | undefined = ideas.data[i + 1];

      if (ideaRight) {
        columns.push([ideaLeft, ideaRight]);
      } else {
        columns.push([ideaLeft]);
      }
    }

    return columns;
  }, [ideas, smallerThanPhone]);

  return (
    <Box mt={smallerThanPhone ? '4px' : '8px'} w="100%">
      {smallerThanPhone
        ? ideas?.data.map((idea) => (
            <Box key={idea.id} mb="8px">
              <VotingResultCard idea={idea} />
            </Box>
          ))
        : desktopRows?.map((row, rowIndex) => (
            <Box
              key={rowIndex}
              display="flex"
              w="100%"
              mb="20px"
              justifyContent="space-between"
            >
              {row.map((idea, i) => (
                <Box
                  w="50%"
                  key={idea.id}
                  {...(i === 0 ? { mr: '8px' } : { ml: '8px' })}
                >
                  <VotingResultCard idea={idea} />
                </Box>
              ))}
            </Box>
          ))}
    </Box>
  );
};

export default VotingResults;
