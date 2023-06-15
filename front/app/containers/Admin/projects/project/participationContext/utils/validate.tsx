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
    min_budget,
    max_budget,
  } = state;

  let isValidated = true;
  let noLikingLimitError: JSX.Element | null = null;
  let noDislikingLimitError: JSX.Element | null = null;
  let minBudgetError: string | null = null;
  let maxBudgetError: string | null = null;

  if (
    reacting_like_method === 'limited' &&
    (!reacting_like_limited_max ||
      !isFinite(reacting_like_limited_max) ||
      reacting_like_limited_max < 1)
  ) {
    noLikingLimitError = (
      <FormattedMessage {...messages.noReactingLimitErrorMessage} />
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
      <FormattedMessage {...messages.noReactingLimitErrorMessage} />
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
    noLikingLimitError,
    noDislikingLimitError,
    minBudgetError,
    maxBudgetError,
    isValidated,
  };
};
