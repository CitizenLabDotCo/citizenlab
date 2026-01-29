import { FormatMessage } from 'typings';

import { IPhaseData } from 'api/phases/types';
import { getPhaseVoteTermMessage } from 'api/phases/utils';

import voteInputMessages from 'components/VoteInputs/_shared/messages';

import { getPermissionsDisabledMessage } from 'utils/actionDescriptors';
import { DisabledReason } from 'utils/actionDescriptors/types';
import { UseFormatCurrencyReturn } from 'utils/currency/useFormatCurrency';
import { isNil } from 'utils/helperUtils';

import messages from './messages';

export const getVoteSubmissionDisabledExplanation = (
  formatMessage: FormatMessage,
  phase: IPhaseData,
  permissionsDisabledReason: DisabledReason | null,
  numberOfVotesCast: number,
  formatCurrency: UseFormatCurrencyReturn,
  numberOfOptionsSelected: number | undefined
) => {
  const { voting_method } = phase.attributes;
  const maxVotes = phase.attributes.voting_max_total;
  const minimumSelectedOptions = phase.attributes.voting_min_selected_options;

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

    if (
      !isNil(numberOfOptionsSelected) &&
      minimumSelectedOptions &&
      numberOfOptionsSelected < minimumSelectedOptions
    ) {
      return formatMessage(messages.selectMinXOptionsToVote, {
        minSelectedOptions: minimumSelectedOptions,
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

    if (
      !isNil(numberOfOptionsSelected) &&
      minimumSelectedOptions &&
      numberOfOptionsSelected < minimumSelectedOptions
    ) {
      return formatMessage(messages.selectMinXOptionsToVote, {
        minSelectedOptions: minimumSelectedOptions,
      });
    }

    if (numberOfVotesCast === 0) {
      return formatMessage(messages.noVotesCast);
    }
  }

  if (voting_method === 'budgeting') {
    if (maxNumberOfVotesExceeded) {
      if (isNil(maxVotes)) return;

      return formatMessage(messages.budgetExceedsLimit, {
        votesCast: formatCurrency(numberOfVotesCast),
        votesLimit: formatCurrency(maxVotes),
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
      return formatMessage(messages.minBudgetNotReached1, {
        votesMinimum: formatCurrency(minBudget),
      });
    }
  }

  return;
};

export const getVotesCounter = (
  formatMessage: FormatMessage,
  phase: IPhaseData,
  numberOfVotesCast: number,
  formatCurrency: UseFormatCurrencyReturn
) => {
  const { voting_method, voting_max_total } = phase.attributes;

  if (voting_method === 'single_voting') {
    if (isNil(voting_max_total)) {
      return formatMessage(messages.votesCast, {
        votes: numberOfVotesCast,
      });
    } else {
      const votesLeft = voting_max_total - numberOfVotesCast;

      return formatMessage(messages.numberOfVotesLeft, {
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

    const votesLeftMessage = getPhaseVoteTermMessage(phase, {
      vote: messages.numberOfVotesLeft,
      point: messages.numberOfPointsLeft,
      token: messages.numberOfTokensLeft,
      credit: messages.numberOfCreditsLeft,
      percent: messages.numberOfPercentsLeft,
    });

    return formatMessage(votesLeftMessage, {
      votesLeft: votesLeft.toLocaleString(),
      totalNumberOfVotes: voting_max_total.toLocaleString(),
    });
  }

  if (voting_method === 'budgeting') {
    if (isNil(voting_max_total)) return;

    const budgetLeft = voting_max_total - numberOfVotesCast;

    return formatMessage(messages.currencyLeft1, {
      budgetLeft: formatCurrency(budgetLeft),
      totalBudget: formatCurrency(voting_max_total),
    });
  }

  return;
};

export const getOptionSelectionCounter = (
  formatMessage: FormatMessage,
  phase: IPhaseData,
  numberOfOptionsSelected: number | undefined
) => {
  const { voting_min_selected_options } = phase.attributes;

  if (
    !numberOfOptionsSelected ||
    !voting_min_selected_options ||
    voting_min_selected_options === 1
  ) {
    return; // We don't show any message if min selected options is 1 or not set
  }

  const optionsLeft = voting_min_selected_options - numberOfOptionsSelected;

  if (optionsLeft <= 0) {
    return '';
  }

  return formatMessage(messages.selectMinXOptions, {
    minSelectedOptions: voting_min_selected_options,
  });
};
