import { IPhaseData } from 'api/phases/types';

import { isPhaseActive } from 'utils/projectUtils';

import messages from './messages';

export const getMinusButtonDisabledMessage = (
  basketSubmitted: boolean,
  phase: IPhaseData,
  onIdeaPage?: boolean
) => {
  if (!isPhaseActive(phase)) {
    return messages.phaseNotActive;
  }

  if (basketSubmitted) {
    return onIdeaPage
      ? messages.votesSubmittedIdeaPage1
      : messages.votesSubmitted1;
  }
  return undefined;
};

export const getPlusButtonDisabledMessage = (
  userHasVotesLeft: boolean,
  basketSubmitted: boolean,
  maxVotesPerIdeaReached: boolean,
  phase: IPhaseData,
  onIdeaPage?: boolean
) => {
  if (!isPhaseActive(phase)) {
    return messages.phaseNotActive;
  }

  if (basketSubmitted) {
    return onIdeaPage
      ? messages.votesSubmittedIdeaPage1
      : messages.votesSubmitted1;
  }
  if (!userHasVotesLeft) return messages.maxVotesReached;
  if (maxVotesPerIdeaReached) return messages.maxVotesPerIdeaReached;
  return undefined;
};
