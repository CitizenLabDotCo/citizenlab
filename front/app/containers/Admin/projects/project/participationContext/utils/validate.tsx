import React from 'react';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { State } from '..';
import { isFinite, isNaN } from 'lodash-es';
import { FormatMessage } from 'typings';

export default (state: State, formatMessage: FormatMessage) => {
  const {
    upvoting_method,
    downvoting_method,
    upvoting_limited_max,
    downvoting_limited_max,
    participation_method,
    voting_min_total,
    voting_max_total,
  } = state;

  let isValidated = true;
  let noUpvotingLimitError: JSX.Element | null = null;
  let noDownvotingLimitError: JSX.Element | null = null;
  let minBudgetError: string | null = null;
  let maxBudgetError: string | null = null;

  if (
    upvoting_method === 'limited' &&
    (!upvoting_limited_max ||
      !isFinite(upvoting_limited_max) ||
      upvoting_limited_max < 1)
  ) {
    noUpvotingLimitError = (
      <FormattedMessage {...messages.noVotingLimitErrorMessage} />
    );
    isValidated = false;
  }

  if (
    downvoting_method === 'limited' &&
    (!downvoting_limited_max ||
      !isFinite(downvoting_limited_max) ||
      downvoting_limited_max < 1)
  ) {
    noDownvotingLimitError = (
      <FormattedMessage {...messages.noVotingLimitErrorMessage} />
    );
    isValidated = false;
  }

  if (participation_method === 'voting') {
    if (isNaN(voting_min_total)) {
      minBudgetError = formatMessage(messages.minBudgetRequired);
      isValidated = false;
    }

    if (isNaN(voting_max_total)) {
      maxBudgetError = formatMessage(messages.maxBudgetRequired);
      isValidated = false;
    }

    if (
      // need to check for typeof, because if voting_min_total
      // is 0, just checking voting_min_total will coerce to false
      typeof voting_min_total === 'number' &&
      typeof voting_max_total === 'number' &&
      voting_min_total > voting_max_total
    ) {
      minBudgetError = formatMessage(messages.minBudgetLargerThanMaxError);
      isValidated = false;
    }
  }

  return {
    noUpvotingLimitError,
    noDownvotingLimitError,
    minBudgetError,
    maxBudgetError,
    isValidated,
  };
};
