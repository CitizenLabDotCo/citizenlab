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
  const totalPhaseBaskets = phase.data.attributes.baskets_count;
  const numberOfIdeaBasketPicks = idea.attributes.baskets_count ?? 0;
  const votesPercentage =
    typeof totalPhaseBaskets === 'number'
      ? roundPercentage(numberOfIdeaBasketPicks, totalPhaseBaskets)
      : null;
  // const tooltip = formatMessage(messages.budgetingTooltip);
  const tooltip = 'STILL TO CHANGE';

  if (typeof votesPercentage === 'number') {
    return (
      <ProgressBarWrapper votesPercentage={votesPercentage} tooltip={tooltip}>
        {`${votesPercentage}% (${formatMessage(messages.xPicks, {
          picks: numberOfIdeaBasketPicks,
        })})`}
      </ProgressBarWrapper>
    );
  }

  return null;
};

export default BudgetingProgressBar;
