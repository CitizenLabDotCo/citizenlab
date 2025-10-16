import { isFinite, isNaN } from 'lodash-es';
import { FormatMessage } from 'typings';

import { IUpdatedPhaseProperties, IPhases } from 'api/phases/types';

import messages from '../messages';

const validate = (
  state: IUpdatedPhaseProperties,
  phases: IPhases | undefined,
  formatMessage: FormatMessage
) => {
  const {
    start_at,
    end_at,
    reacting_like_method,
    reacting_dislike_method,
    reacting_like_limited_max,
    reacting_dislike_limited_max,
    participation_method,
    voting_method,
    voting_min_total,
    voting_max_total,
    voting_max_votes_per_idea,
    voting_min_selected_options,
    reacting_threshold,
    expire_days_limit,
  } = state;

  let isValidated = true;
  let phaseDateError: string | undefined;
  let noLikingLimitError: string | undefined;
  let noDislikingLimitError: string | undefined;
  let minTotalVotesError: string | undefined;
  let maxTotalVotesError: string | undefined;
  let maxVotesPerOptionError: string | undefined;
  let expireDateLimitError: string | undefined;
  let reactingThresholdError: string | undefined;
  let minSelectedOptionsError: string | undefined;

  if (!phases || phases.data.length === 0) {
    if (!start_at) {
      phaseDateError = formatMessage(messages.missingStartDateError);
      isValidated = false;
    }
  } else {
    if (!start_at) {
      phaseDateError = formatMessage(messages.missingStartDateError);
      isValidated = false;
    } else {
      if (!end_at) {
        const startAtDates = phases.data.map((phase) =>
          new Date(phase.attributes.start_at).getTime()
        );
        const maxStartAt = Math.max(...startAtDates);
        if (new Date(start_at).getTime() < maxStartAt) {
          phaseDateError = formatMessage(messages.missingEndDateError);
          isValidated = false;
        }
      }
    }
  }

  if (
    participation_method === 'voting' &&
    voting_max_votes_per_idea &&
    voting_max_total &&
    voting_max_votes_per_idea > voting_max_total
  ) {
    maxVotesPerOptionError = formatMessage(messages.maxVotesPerOptionError);
    isValidated = false;
  }

  if (
    participation_method === 'voting' &&
    voting_min_selected_options &&
    voting_max_total &&
    voting_min_selected_options > voting_max_total
  ) {
    minSelectedOptionsError = formatMessage(messages.minSelectedOptionsError);
    isValidated = false;
  }

  if (
    participation_method === 'ideation' &&
    reacting_like_method === 'limited' &&
    (!reacting_like_limited_max ||
      !isFinite(reacting_like_limited_max) ||
      reacting_like_limited_max < 1)
  ) {
    noLikingLimitError = formatMessage(messages.noReactingLimitErrorMessage);
    isValidated = false;
  }

  if (
    participation_method === 'ideation' &&
    reacting_dislike_method === 'limited' &&
    (!reacting_dislike_limited_max ||
      !isFinite(reacting_dislike_limited_max) ||
      reacting_dislike_limited_max < 1)
  ) {
    noDislikingLimitError = formatMessage(messages.noReactingLimitErrorMessage);
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

  if (participation_method === 'proposals') {
    if (isNaN(expire_days_limit)) {
      expireDateLimitError = formatMessage(messages.expireDateLimitRequired);
      isValidated = false;
    }
    if (isNaN(reacting_threshold)) {
      reactingThresholdError = formatMessage(
        messages.reactingThresholdRequired
      );
      isValidated = false;
    }
  }

  return {
    isValidated,
    errors: {
      phaseDateError,
      noLikingLimitError,
      noDislikingLimitError,
      minTotalVotesError,
      maxTotalVotesError,
      maxVotesPerOptionError,
      expireDateLimitError,
      reactingThresholdError,
      minSelectedOptionsError,
    },
  };
};

export default validate;
