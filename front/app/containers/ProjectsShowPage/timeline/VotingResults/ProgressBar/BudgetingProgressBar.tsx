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
  const totalBasketsIdeaIsIn = idea.attributes.total_votes;
  const numberOnlinePicks = idea.attributes.baskets_count;
  const numberOfflinePicks = idea.attributes.manual_votes_amount;
  const totalOnlineBasketsInPhase = phase.data.attributes.baskets_count;
  const manualVotersAmount = phase.data.attributes.manual_voters_amount || 0;
  const totalBasketsInPhase = totalOnlineBasketsInPhase + manualVotersAmount;

  const tooltip = formatMessage(messages.budgetingTooltip);

  // Calculate percentages
  const basketsOnlinePercentage = roundPercentage(
    numberOnlinePicks,
    totalBasketsInPhase
  );
  const totalBasketsPercentage = roundPercentage(
    totalBasketsIdeaIsIn,
    totalBasketsInPhase
  );
  const manualBasketsPercentage = roundPercentage(
    numberOfflinePicks,
    totalBasketsInPhase
  );

  return (
    <Box w="100%">
      <ProgressBarWrapper
        votesPercentage={basketsOnlinePercentage}
        manualVotesPercentage={manualBasketsPercentage}
        tooltip={tooltip}
      >
        {`${totalBasketsPercentage}% • ${formatMessage(messages.numberOfPicks, {
          baskets: totalBasketsIdeaIsIn,
        })} ${
          numberOfflinePicks > 0
            ? formatMessage(messages.numberManualVoters, {
                manualVoters: numberOfflinePicks,
              })
            : ''
        }
        `}
      </ProgressBarWrapper>
    </Box>
  );
};

export default BudgetingProgressBar;
