import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import OutcomeBreakdownBar from 'containers/ProjectsShowPage/timeline/CommonGround/OutcomeBreakdownBar';

import T from 'components/T';

import { VoteStats, calculatePercentages } from './commonGroundUtils';

interface StatementItem {
  id: string;
  title_multiloc: Record<string, string>;
  votes: VoteStats;
  demographic_breakdown?: Record<string, VoteStats>;
}

interface Props {
  item: StatementItem;
  clusterBy: string;
  demographicKeys: string[];
}

const StatementRow = ({ item, clusterBy, demographicKeys }: Props) => {
  const overallStats = calculatePercentages(item.votes);

  return (
    <Box py="16px" borderBottom="1px solid" borderColor="divider">
      <Box display="flex" gap="8px" alignItems="flex-start">
        {/* Statement text */}
        <Box width="60%" flexShrink={0}>
          <Text fontSize="m" my="0px">
            <T value={item.title_multiloc} />
          </Text>
        </Box>

        {/* Overall or clustered breakdown */}
        {!clusterBy ? (
          // No clustering - show single breakdown bar
          <Box width="200px" flexShrink={0}>
            <OutcomeBreakdownBar
              agreedPercent={overallStats.agreedPercent}
              unsurePercent={overallStats.unsurePercent}
              disagreePercent={overallStats.disagreePercent}
              totalCount={overallStats.total}
            />
          </Box>
        ) : (
          // With clustering - show breakdown per demographic
          <Box display="flex" gap="8px" flex="1">
            {demographicKeys.map((key) => {
              const demographicVotes = item.demographic_breakdown?.[key];
              if (!demographicVotes) {
                return (
                  <Box key={key} width="150px" flexShrink={0}>
                    <Text
                      fontSize="xs"
                      color="grey500"
                      textAlign="center"
                      my="0px"
                    >
                      -
                    </Text>
                  </Box>
                );
              }

              const stats = calculatePercentages(demographicVotes);

              return (
                <Box key={key} width="150px" flexShrink={0}>
                  <OutcomeBreakdownBar
                    agreedPercent={stats.agreedPercent}
                    unsurePercent={stats.unsurePercent}
                    disagreePercent={stats.disagreePercent}
                    totalCount={stats.total}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StatementRow;
