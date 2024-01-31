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
import { IIdeaData } from 'api/ideas/types';

interface Props {
  phaseId: string;
  budget?: number;
  // undefined for budgetting
  votes?: number;
  // undefined for voting
  baskets?: number;
  tooltip?: string;
  idea: IIdeaData;
}

const Results = ({ phaseId, budget, votes, baskets, tooltip, idea }: Props) => {
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
        typeof budget === 'number' && (
          <Text mb="8px" mt="8px" color="tenantPrimary">
            {formatMessage(messages.cost)} <FormattedBudget value={budget} />
          </Text>
        )}
      <ProgressBar
        idea={idea}
        phaseId={phaseId}
        votes={votes}
        baskets={baskets}
        tooltip={tooltip}
      />
    </Box>
  );
};

export default Results;
