import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import ProgressBar from './ProgressBar';

// i18n
import FormattedBudget from 'utils/currency/FormattedBudget';

interface Props {
  budget?: number;
  percentage: number;
  picks: number;
  baskets?: number;
}

const ResultBar = ({ budget, percentage, picks, baskets }: Props) => {
  return (
    <Box>
      {budget && (
        <Text>
          <FormattedBudget value={budget} />
        </Text>
      )}
      <ProgressBar
        percentage={percentage}
        picks={picks}
        baskets={baskets}
        fill="blue"
      />
    </Box>
  );
};

export default ResultBar;
