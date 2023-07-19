import React from 'react';

// api
import usePhase from 'api/phases/usePhase';

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
  votes?: number;
  votesPercentage: number;
  baskets?: number;
  tooltip?: string;
}

const Results = ({
  phaseId,
  budget,
  votes,
  votesPercentage,
  baskets,
  tooltip,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: phase } = usePhase(phaseId);

  return (
    <Box
      h="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-end"
    >
      {phase &&
        phase.data.attributes.voting_method === 'budgeting' &&
        budget && (
          <Text mb="8px" mt="8px" color="tenantPrimary">
            {formatMessage(messages.cost)} <FormattedBudget value={budget} />
          </Text>
        )}
      <ProgressBar
        phaseId={phaseId}
        votes={votes}
        votesPercentage={votesPercentage}
        baskets={baskets}
        tooltip={tooltip}
      />
    </Box>
  );
};

export default Results;
