import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import ProgressBar from './ProgressBar';

// i18n
import { useIntl } from 'utils/cl-intl';
import FormattedBudget from 'utils/currency/FormattedBudget';
import messages from './messages';

interface Props {
  phaseId: string;
  budget?: number;
  votes: number;
  votesPercentage: number;
  baskets?: number;
}

const Results = ({
  phaseId,
  budget,
  votes,
  votesPercentage,
  baskets,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      h="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-end"
    >
      {budget && (
        <Text mb="8px" mt="8px" color="tenantPrimary">
          {formatMessage(messages.cost)}
          <FormattedBudget value={budget} />
        </Text>
      )}
      <ProgressBar
        phaseId={phaseId}
        votes={votes}
        votesPercentage={votesPercentage}
        baskets={baskets}
      />
    </Box>
  );
};

export default Results;
