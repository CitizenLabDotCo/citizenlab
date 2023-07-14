import React from 'react';
// import React, { useMemo } from 'react';

// api
import useIdeas from 'api/ideas/useIdeas';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import VotingResultCard from './VotingResultCard';

// typings
// import { IIdeaData } from 'api/ideas/types';

interface Props {
  phaseId: string;
}

const VotingResults = ({ phaseId }: Props) => {
  const { data: ideas } = useIdeas({
    phase: phaseId,
    sort: 'votes_count',
  });
  const smallerThanTablet = useBreakpoint('tablet');
  const smallerThanPhone = useBreakpoint('phone');

  // const desktopRows = useMemo(() => {
  //   if (!ideas || smallerThanPhone) return;

  //   const columns: { idea: IIdeaData; rank: number }[][] = [];

  //   for (let i = 0; i < ideas.data.length; i = i + 2) {
  //     const left = { idea: ideas.data[i], rank: i + 1 };
  //     const ideaRight: IIdeaData | undefined = ideas.data[i + 1];
  //     const right = ideaRight ? { idea: ideaRight, rank: i + 2 } : undefined;

  //     if (right) {
  //       columns.push([left, right]);
  //     } else {
  //       columns.push([left]);
  //     }
  //   }

  //   return columns;
  // }, [ideas, smallerThanPhone]);

  // const mobileRows = useMemo(() => {
  //   if (!ideas || !smallerThanPhone) return;
  //   return ideas.data.map((idea, i) => ({ idea, rank: i + 1 }));
  // }, [ideas, smallerThanPhone]);

  const getMx = (i: number) =>
    smallerThanTablet ? {} : i % 2 ? { ml: '8px' } : { mr: '8px' };

  return (
    <Box
      mt={smallerThanPhone ? '4px' : '8px'}
      w="100%"
      display="flex"
      flexWrap="wrap"
      justifyContent="space-between"
    >
      {/* {smallerThanPhone
        ? mobileRows?.map((card) => (
            <Box key={card.idea.id} mb="8px">
              <VotingResultCard {...card} phaseId={phaseId} />
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
              {row.map((card, i) => (
                <Box
                  w="50%"
                  key={card.idea.id}
                  {...(i === 0 ? { mr: '8px' } : { ml: '8px' })}
                >
                  <VotingResultCard {...card} phaseId={phaseId} />
                </Box>
              ))}
            </Box>
          ))} */}
      {ideas?.data.map((idea, i) => (
        <Box
          key={idea.id}
          mb={smallerThanPhone ? '8px' : '20px'}
          flexGrow={0}
          width={smallerThanTablet ? '100%' : 'calc(50% - 16px)'}
          {...getMx(i)}
          // mx="10px"
        >
          <VotingResultCard idea={idea} phaseId={phaseId} rank={i + 1} />
        </Box>
      ))}
    </Box>
  );
};

export default VotingResults;
