import { MessageDescriptor } from 'react-intl';

import { IPhaseData } from 'api/phases/types';
import { getPhaseVoteTermMessage } from 'api/phases/utils';

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
): MessageDescriptor | null => {
  if (!isPhaseActive(phase)) {
    return messages.phaseNotActive;
  }

  if (basketSubmitted) {
    return onIdeaPage
      ? messages.votesSubmittedIdeaPage1
      : messages.votesSubmitted1;
  }

  if (!userHasVotesLeft) {
    return getPhaseVoteTermMessage(phase, {
      vote: messages.maxVotesInTotalReached,
      point: messages.maxPointsInTotalReached,
      token: messages.maxTokensInTotalReached,
      credit: messages.maxCreditsInTotalReached,
      percent: messages.maxPercentsInTotalReached,
    });
  }
  if (maxVotesPerIdeaReached) {
    return getPhaseVoteTermMessage(phase, {
      vote: messages.maxVotesPerInputReached,
      point: messages.maxPointsPerInputReached,
      token: messages.maxTokensPerInputReached,
      credit: messages.maxCreditsPerInputReached,
      percent: messages.maxPercentsPerInputReached,
    });
  }
  return null;
};
