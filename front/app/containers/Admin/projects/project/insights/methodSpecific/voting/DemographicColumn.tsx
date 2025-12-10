import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import ProgressBarWrapper from 'containers/ProjectsShowPage/timeline/VotingResults/ProgressBar/ProgressBarWrapper';

import { CHART_COLORS } from './constants';

interface Props {
  label: string;
  count: number;
  percentage: number;
}

const DemographicColumn = ({ label, count, percentage }: Props) => {
  return (
    <Box flex="1" minWidth="0">
      <Text
        m="0"
        mb="4px"
        fontSize="xs"
        color="grey700"
        fontWeight="bold"
        textAlign="center"
      >
        {label}
      </Text>
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        gap="4px"
        mb="4px"
      >
        <Text
          m="0"
          fontSize="xs"
          fontWeight="bold"
          style={{ color: CHART_COLORS.darkBlue }}
        >
          {percentage}%
        </Text>
        <Text m="0" fontSize="xs" color="textSecondary">
          ({count})
        </Text>
      </Box>
      <ProgressBarWrapper
        votesPercentage={percentage}
        barColor={CHART_COLORS.darkBlue}
        bgColor="#E0E0E0"
        height="16px"
      />
    </Box>
  );
};

export default DemographicColumn;
