import { FormatMessage } from 'typings';

import { TCurrency } from 'api/app_configuration/types';
import { IPhaseData } from 'api/phases/types';

import { Localize } from 'hooks/useLocalize';

import voteInputMessages from 'components/VoteInputs/_shared/messages';

import { getPermissionsDisabledMessage } from 'utils/actionDescriptors';
import { DisabledReason } from 'utils/actionDescriptors/types';
import { isNil } from 'utils/helperUtils';

import messages from './messages';

export const getVoteSubmissionDisabledExplanation = (
  formatMessage: FormatMessage,
  localize: Localize,
  phase: IPhaseData,
  permissionsDisabledReason: DisabledReason | null,
  numberOfVotesCast: number,
  currency: TCurrency | undefined
) => {
  const { voting_method } = phase.attributes;
  const maxVotes = phase.attributes.voting_max_total;

  const action =
    phase.attributes.voting_method === 'budgeting' ? 'budgeting' : 'voting';
  const permissionsMessage = getPermissionsDisabledMessage(
    action,
    permissionsDisabledReason
  );
  if (permissionsMessage) return formatMessage(permissionsMessage);

  const maxNumberOfVotesExceeded =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    typeof maxVotes === 'number' && numberOfVotesCast !== undefined
      ? numberOfVotesCast > maxVotes
      : false;

  if (voting_method === 'single_voting') {
    if (maxNumberOfVotesExceeded) {
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
    if (maxNumberOfVotesExceeded) {
      if (isNil(maxVotes)) return;

      return formatMessage(messages.votesExceedLimit, {
        votesCast: numberOfVotesCast.toLocaleString(),
        votesLimit: maxVotes.toLocaleString(),
      });
    }

    if (numberOfVotesCast === 0) {
      const { voting_term_plural_multiloc } = phase.attributes;

      const votesTerm = voting_term_plural_multiloc
        ? localize(voting_term_plural_multiloc)
        : formatMessage(voteInputMessages.votes);

      return formatMessage(messages.noVotesCast, {
        votesTerm,
      });
    }
  }

  if (voting_method === 'budgeting') {
    if (maxNumberOfVotesExceeded) {
      if (isNil(maxVotes)) return;

      return formatMessage(messages.budgetExceedsLimit, {
        votesCast: numberOfVotesCast.toLocaleString(),
        votesLimit: maxVotes.toLocaleString(),
      });
    }

    if (numberOfVotesCast === 0) return formatMessage(messages.nothingInBasket);

    const minBudget = phase.attributes.voting_min_total ?? 0;
    const minBudgetRequired = minBudget > 0;
    const minBudgetReached =
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      numberOfVotesCast !== undefined ? numberOfVotesCast >= minBudget : false;

    const minBudgetRequiredNotReached = minBudgetRequired && !minBudgetReached;

    if (minBudgetRequiredNotReached) {
      return formatMessage(messages.minBudgetNotReached, {
        votesMinimum: minBudget.toLocaleString(),
        currency: currency ?? '',
      });
    }
  }

  return;
};

export const getVotesCounter = (
  formatMessage: FormatMessage,
  localize: Localize,
  phase: IPhaseData,
  numberOfVotesCast: number,
  currency: TCurrency | undefined
) => {
  const { voting_method, voting_max_total } = phase.attributes;

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
      phase.attributes;

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
      currency: currency ?? '',
    });
  }

  return;
};
