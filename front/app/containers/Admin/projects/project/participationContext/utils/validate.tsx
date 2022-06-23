import React from 'react';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { State } from '..';
import { isFinite, isNaN } from 'lodash-es';

export default (state: State, formatMessage) => {
  const {
    upvoting_method,
    downvoting_method,
    upvoting_limited_max,
    downvoting_limited_max,
    participation_method,
    min_budget,
    max_budget,
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

  if (participation_method === 'budgeting') {
    if (isNaN(min_budget)) {
      minBudgetError = formatMessage(messages.minBudgetRequired);
      isValidated = false;
    }

    if (isNaN(max_budget)) {
      maxBudgetError = formatMessage(messages.maxBudgetRequired);
      isValidated = false;
    }

    if (
      // need to check for typeof, because if min_budget
      // is 0, just checking min_budget will coerce to false
      typeof min_budget === 'number' &&
      typeof max_budget === 'number' &&
      min_budget > max_budget
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
