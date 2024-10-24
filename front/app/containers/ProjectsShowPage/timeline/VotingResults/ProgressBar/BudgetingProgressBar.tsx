import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';
import { IPhase } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';
import { roundPercentage } from 'utils/math';

import messages from './messages';
import ProgressBarWrapper from './ProgressBarWrapper';

interface Props {
  phase: IPhase;
  idea: IIdeaData;
}

const BudgetingProgressBar = ({ phase, idea }: Props) => {
  const { formatMessage } = useIntl();
  const totalBasketsIdeaIsIn = 10; // idea.attributes.total_votes || 0; ToDo: Remove hardcoding
  const totalBasketsInPhase = 30; // phase.data.attributes.baskets_count; ToDo: Remove hardcoding
  const manualVotersAmount = 5; // phase.data.attributes.manual_voters_amount || 0; ToDo: Remove hardcoding
  const tooltip = formatMessage(messages.budgetingTooltip);
  const basketsPercentage = roundPercentage(
    totalBasketsIdeaIsIn,
    totalBasketsInPhase + manualVotersAmount
  );
  const manualBasketsPercentage = roundPercentage(
    manualVotersAmount,
    totalBasketsInPhase + manualVotersAmount
  );

  return (
    <Box w="100%">
      <ProgressBarWrapper
        votesPercentage={basketsPercentage}
        manualVotesPercentage={manualBasketsPercentage}
        tooltip={tooltip}
      >
        {`${basketsPercentage}% • ${formatMessage(messages.numberOfPicks, {
          baskets: totalBasketsIdeaIsIn,
        })} ${
          manualVotersAmount > 0
            ? formatMessage(messages.numberManualVoters, {
                manualVoters: manualVotersAmount,
              })
            : ''
        }
        `}
      </ProgressBarWrapper>
    </Box>
  );
};

export default BudgetingProgressBar;
