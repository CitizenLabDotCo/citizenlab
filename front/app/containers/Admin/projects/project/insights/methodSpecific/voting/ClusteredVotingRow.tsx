import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { VotingIdeaResult } from 'api/voting_insights/types';

import DemographicColumn from './DemographicColumn';
import IdeaThumbnail from './IdeaThumbnail';

interface Props {
  idea: VotingIdeaResult;
  title: string;
  demographicKeys: string[];
  demographicLabels?: string[];
}

const ClusteredVotingRow = ({
  idea,
  title,
  demographicKeys,
  demographicLabels,
}: Props) => {
  return (
    <Box display="flex" alignItems="flex-start" gap="16px" py="12px">
      <Box flexShrink={0}>
        <IdeaThumbnail imageUrl={idea.image_url} alt={title} />
      </Box>

      <Box style={{ width: '200px', flexShrink: 0 }}>
        <Text
          m="0"
          fontSize="s"
          color="textPrimary"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
        </Text>
      </Box>

      {demographicKeys.map((key, index) => {
        const breakdown = idea.series?.[key];
        return (
          <DemographicColumn
            key={key}
            label={demographicLabels?.[index] ?? key}
            count={breakdown?.count ?? 0}
            percentage={breakdown?.percentage ?? 0}
          />
        );
      })}
    </Box>
  );
};

export default ClusteredVotingRow;
