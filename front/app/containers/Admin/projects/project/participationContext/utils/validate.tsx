import React from 'react';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { State } from '..';
import { isFinite, isNaN } from 'lodash-es';
import { FormatMessage } from 'typings';

export default (state: State, formatMessage: FormatMessage) => {
  const {
    reacting_like_method,
    reacting_dislike_method,
    reacting_like_limited_max,
    reacting_dislike_limited_max,
    participation_method,
    voting_method,
    voting_min_total,
    voting_max_total,
  } = state;

  let isValidated = true;
  let noLikingLimitError: JSX.Element | null = null;
  let noDislikingLimitError: JSX.Element | null = null;
  let minTotalVotesError: string | null = null;
  let maxTotalVotesError: string | null = null;

  if (
    reacting_like_method === 'limited' &&
    (!reacting_like_limited_max ||
      !isFinite(reacting_like_limited_max) ||
      reacting_like_limited_max < 1)
  ) {
    noLikingLimitError = (
      <FormattedMessage {...messages.noVotingLimitErrorMessage} />
    );
    isValidated = false;
  }

  if (
    reacting_dislike_method === 'limited' &&
    (!reacting_dislike_limited_max ||
      !isFinite(reacting_dislike_limited_max) ||
      reacting_dislike_limited_max < 1)
  ) {
    noDislikingLimitError = (
      <FormattedMessage {...messages.noVotingLimitErrorMessage} />
    );
    isValidated = false;
  }

  if (participation_method === 'voting') {
    if (isNaN(voting_min_total)) {
      minTotalVotesError =
        voting_method === 'budgeting'
          ? formatMessage(messages.minBudgetRequired)
          : formatMessage(messages.minVotesRequired);

      isValidated = false;
    }

    if (isNaN(voting_max_total)) {
      maxTotalVotesError =
        voting_method === 'budgeting'
          ? formatMessage(messages.maxBudgetRequired)
          : formatMessage(messages.maxVotesRequired);

      isValidated = false;
    }

    if (
      // need to check for typeof, because if voting_min_total
      // is 0, just checking voting_min_total will coerce to false
      typeof voting_min_total === 'number' &&
      typeof voting_max_total === 'number' &&
      voting_min_total > voting_max_total
    ) {
      minTotalVotesError =
        voting_method === 'budgeting'
          ? formatMessage(messages.minBudgetLargerThanMaxError)
          : formatMessage(messages.minTotalVotesLargerThanMaxError);

      isValidated = false;
    }
  }

  return {
    noLikingLimitError,
    noDislikingLimitError,
    minTotalVotesError,
    maxTotalVotesError,
    isValidated,
  };
};
