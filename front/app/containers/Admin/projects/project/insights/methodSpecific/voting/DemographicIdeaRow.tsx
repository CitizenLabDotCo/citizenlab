import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { VotingIdeaResult } from 'api/voting_insights/types';

import ProgressBarWrapper from 'containers/ProjectsShowPage/timeline/VotingResults/ProgressBar/ProgressBarWrapper';

import { CHART_COLORS } from './constants';
import IdeaThumbnail from './IdeaThumbnail';

interface Props {
  idea: VotingIdeaResult;
  title: string;
  demographicKey: string;
}

const DemographicIdeaRow = ({ idea, title, demographicKey }: Props) => {
  const breakdown = idea.demographic_breakdown?.[demographicKey];
  const count = breakdown?.count ?? 0;
  const percentage = breakdown?.percentage ?? 0;

  return (
    <Box display="flex" alignItems="center" gap="16px" py="12px">
      <Box flexShrink={0}>
        <IdeaThumbnail imageUrl={idea.image_url} alt={title} />
      </Box>

      <Box flex="1" minWidth="0">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb="8px"
        >
          <Text m="0" fontSize="s" color="textPrimary">
            {title}
          </Text>
          <Box display="flex" alignItems="center" gap="4px" flexShrink={0}>
            <Text
              m="0"
              fontSize="s"
              fontWeight="bold"
              style={{ color: CHART_COLORS.darkBlue }}
            >
              {percentage}%
            </Text>
            <Text m="0" fontSize="s" color="textSecondary">
              ({count})
            </Text>
          </Box>
        </Box>
        <ProgressBarWrapper
          votesPercentage={percentage}
          barColor={CHART_COLORS.darkBlue}
          bgColor="#E0E0E0"
          height="16px"
        />
      </Box>
    </Box>
  );
};

export default DemographicIdeaRow;
