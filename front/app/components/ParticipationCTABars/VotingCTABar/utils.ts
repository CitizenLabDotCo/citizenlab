// i18n
import messages from './messages';
import voteInputMessages from 'components/VoteInputs/_shared/messages';

// utils
import { isNil } from 'utils/helperUtils';

// typings
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';
import { TCurrency } from 'api/app_configuration/types';
import { FormatMessage } from 'typings';
import { Localize } from 'hooks/useLocalize';

export const getDisabledExplanation = (
  formatMessage: FormatMessage,
  localize: Localize,
  participationContext: IProjectData | IPhaseData,
  numberOfVotesCast: number,
  currency: TCurrency | undefined
) => {
  const { voting_method } = participationContext.attributes;
  const maxVotes = participationContext.attributes.voting_max_total;

  const votesExceedLimit =
    maxVotes && numberOfVotesCast !== undefined
      ? numberOfVotesCast > maxVotes
      : false;

  if (voting_method === 'single_voting') {
    if (votesExceedLimit) {
      if (isNil(maxVotes)) return;

      return formatMessage(messages.votesExceedLimit, {
        votesCast: numberOfVotesCast.toLocaleString(),
        votesLimit: maxVotes.toLocaleString(),
      });
    }

    if (numberOfVotesCast === 0) {
      return formatMessage(messages.noVotesCast, {
        votesTerm: formatMessage(voteInputMessages.votes),
      });
    }
  }

  if (voting_method === 'multiple_voting') {
    if (votesExceedLimit) {
      if (isNil(maxVotes)) return;

      return formatMessage(messages.votesExceedLimit, {
        votesCast: numberOfVotesCast.toLocaleString(),
        votesLimit: maxVotes.toLocaleString(),
      });
    }

    if (numberOfVotesCast === 0) {
      const { voting_term_plural_multiloc } = participationContext.attributes;

      const votesTerm = voting_term_plural_multiloc
        ? localize(voting_term_plural_multiloc)
        : formatMessage(voteInputMessages.votes);

      return formatMessage(messages.noVotesCast, {
        votesTerm,
      });
    }
  }

  if (voting_method === 'budgeting') {
    if (votesExceedLimit) {
      if (isNil(maxVotes)) return;

      return formatMessage(messages.budgetExceedsLimit, {
        votesCast: numberOfVotesCast.toLocaleString(),
        votesLimit: maxVotes.toLocaleString(),
      });
    }

    if (numberOfVotesCast === 0) return formatMessage(messages.nothingInBasket);

    const minBudget = participationContext.attributes.voting_min_total ?? 0;
    const minBudgetRequired = minBudget > 0;
    const minBudgetReached =
      numberOfVotesCast !== undefined ? numberOfVotesCast >= minBudget : false;

    const minBudgetRequiredNotReached = minBudgetRequired && !minBudgetReached;

    if (minBudgetRequiredNotReached) {
      return formatMessage(messages.minBudgetNotReached, {
        votesMinimum: minBudget.toLocaleString(),
        currency,
      });
    }
  }

  return;
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
