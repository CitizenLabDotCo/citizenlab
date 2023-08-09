// i18n
import messages from './messages';
import voteInputMessages from 'components/VoteInputs/_shared/messages';

// utils
import { isNil } from 'utils/helperUtils';

// typings
import { VotingMethod } from 'services/participationContexts';
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';
import { TCurrency } from 'api/app_configuration/types';
import { FormatMessage } from 'typings';
import { Localize } from 'hooks/useLocalize';

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

export const getVotesCounter = (
  formatMessage: FormatMessage,
  localize: Localize,
  participationContext: IProjectData | IPhaseData,
  numberOfVotesCast: number,
  currency: TCurrency | undefined
) => {
  const { voting_method, voting_max_total } = participationContext.attributes;

  if (voting_method === 'single_voting') {
    if (isNil(voting_max_total)) {
      return formatMessage(messages.votesCast, {
        votes: numberOfVotesCast,
      });
    } else {
      const votesLeft = voting_max_total - numberOfVotesCast;

      return formatMessage(messages.votesLeft, {
        votesLeft: votesLeft.toLocaleString(),
        totalNumberOfVotes: voting_max_total.toLocaleString(),
        voteTerm: formatMessage(voteInputMessages.vote),
        votesTerm: formatMessage(voteInputMessages.votes),
      });
    }
  }

  if (voting_method === 'multiple_voting') {
    if (isNil(voting_max_total)) return;

    const votesLeft = voting_max_total - numberOfVotesCast;

    const { voting_term_singular_multiloc, voting_term_plural_multiloc } =
      participationContext.attributes;

    const voteTerm = voting_term_singular_multiloc
      ? localize(voting_term_singular_multiloc)
      : formatMessage(voteInputMessages.vote);
    const votesTerm = voting_term_plural_multiloc
      ? localize(voting_term_plural_multiloc)
      : formatMessage(voteInputMessages.votes);

    return formatMessage(messages.votesLeft, {
      votesLeft: votesLeft.toLocaleString(),
      totalNumberOfVotes: voting_max_total.toLocaleString(),
      voteTerm,
      votesTerm,
    });
  }

  if (voting_method === 'budgeting') {
    if (isNil(voting_max_total)) return;

    const budgetLeft = voting_max_total - numberOfVotesCast;

    return formatMessage(messages.currencyLeft, {
      budgetLeft: budgetLeft.toLocaleString(),
      totalBudget: voting_max_total.toLocaleString(),
      currency,
    });
  }

  return;
};
