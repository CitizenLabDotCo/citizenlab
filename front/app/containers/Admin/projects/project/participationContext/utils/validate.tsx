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
    voting_max_votes_per_idea,
    voting_term_plural_multiloc,
    voting_term_singular_multiloc,
    appConfig,
  } = state;

  let isValidated = true;
  let noLikingLimitError: JSX.Element | null = null;
  let noDislikingLimitError: JSX.Element | null = null;
  let minTotalVotesError: string | null = null;
  let maxTotalVotesError: string | null = null;
  let maxVotesPerOptionError: string | null = null;
  let voteTermError: string | null = null;

  const locales = appConfig?.data.attributes.settings.core.locales;

  if (voting_method === 'multiple_voting') {
    locales?.map((locale) => {
      if (
        (voting_term_plural_multiloc && !voting_term_plural_multiloc[locale]) ||
        (voting_term_singular_multiloc &&
          !voting_term_singular_multiloc[locale])
      ) {
        voteTermError = formatMessage(messages.voteTermError);
        isValidated = false;
      }
    });
  }

  if (
    voting_max_votes_per_idea &&
    voting_max_total &&
    voting_max_votes_per_idea > voting_max_total
  ) {
    maxVotesPerOptionError = formatMessage(messages.maxVotesPerOptionError);
    isValidated = false;
  }

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

    if (isNaN(voting_max_votes_per_idea)) {
      maxVotesPerOptionError =
        voting_method === 'multiple_voting'
          ? formatMessage(messages.maxBudgetRequired)
          : formatMessage(messages.maxVotesRequired);

      isValidated = false;
    }

    if (voting_max_votes_per_idea && voting_max_total) {
      if (voting_max_votes_per_idea > voting_max_total) {
        maxVotesPerOptionError = formatMessage(
          messages.maxVotesPerOptionErrorText
        );
        isValidated = false;
      }
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
    maxVotesPerOptionError,
    isValidated,
    voteTermError,
  };
};
