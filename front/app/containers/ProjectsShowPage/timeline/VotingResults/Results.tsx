import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import ProgressBar from './ProgressBar';

// i18n
import { useIntl } from 'utils/cl-intl';
import FormattedBudget from 'utils/currency/FormattedBudget';
import messages from './messages';
import { IIdeaData } from 'api/ideas/types';
import { IPhase } from 'api/phases/types';

interface Props {
  phase: IPhase;
  idea: IIdeaData;
}

const Results = ({ phase, idea }: Props) => {
  const { formatMessage } = useIntl();
  const budget = idea.attributes.budget ?? undefined;

  return (
    <Box
      h="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-end"
    >
      {phase.data.attributes.voting_method === 'budgeting' &&
        typeof budget === 'number' && (
          <Text mb="8px" mt="8px" color="tenantPrimary">
            {formatMessage(messages.cost)} <FormattedBudget value={budget} />
          </Text>
        )}
      <ProgressBar idea={idea} phase={phase} />
    </Box>
  );
};

export default Results;
