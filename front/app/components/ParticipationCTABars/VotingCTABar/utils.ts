import { VotingMethod } from 'services/participationContexts';
import messages from './messages';

export const getDisabledMessage = (
  votingMethod: VotingMethod,
  votesExceedLimit: boolean,
  numberOfVotesCast: number,
  minVotesRequiredNotReached: boolean
) => {
  if (votingMethod === 'budgeting') {
    if (votesExceedLimit) return messages.budgetExceedsLimit;
    if (numberOfVotesCast === 0) return messages.nothingInBasket;
    if (minVotesRequiredNotReached) return messages.minBudgetNotReached;
    return undefined;
  } else {
    if (votesExceedLimit) return messages.votesExceedLimit;
    if (numberOfVotesCast === 0) return messages.noVotesCast;
    if (minVotesRequiredNotReached) return messages.minVotesRequiredNotReached;
    return undefined;
  }
};
