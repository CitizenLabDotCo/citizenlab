import React from 'react';
import { useIntl } from 'utils/cl-intl';
import { roundPercentage } from 'utils/math';
import { IIdeaData } from 'api/ideas/types';
import { IPhase } from 'api/phases/types';
import messages from './messages';
import ProgressBarWrapper from './ProgressBarWrapper';

interface Props {
  phase: IPhase;
  idea: IIdeaData;
}

const BudgetingProgressBar = ({ phase, idea }: Props) => {
  const { formatMessage } = useIntl();
  const totalBasketsIdeaIsIn = idea.attributes.baskets_count;
  const totalBasketsInPhase = phase.data.attributes.baskets_count;

  const tooltip = formatMessage(messages.budgetingTooltip);

  if (
    typeof totalBasketsIdeaIsIn === 'number' &&
    typeof totalBasketsInPhase === 'number'
  ) {
    const basketsPercentage = roundPercentage(
      totalBasketsIdeaIsIn,
      totalBasketsInPhase
    );

    return (
      <ProgressBarWrapper votesPercentage={basketsPercentage} tooltip={tooltip}>
        {`${basketsPercentage}% (${formatMessage(messages.xPicks, {
          baskets: totalBasketsIdeaIsIn,
        })})`}
      </ProgressBarWrapper>
    );
  }

  return null;
};

export default BudgetingProgressBar;
