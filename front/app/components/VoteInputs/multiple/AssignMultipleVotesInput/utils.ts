import messages from './messages';

export const getMinusButtonDisabledMessage = (
  basketSubmitted: boolean,
  onIdeaPage?: boolean
) => {
  if (basketSubmitted) {
    return onIdeaPage
      ? messages.votesSubmittedIdeaPage
      : messages.votesSubmitted;
  }
  return undefined;
};

export const getPlusButtonDisabledMessage = (
  userHasVotesLeft: boolean,
  basketSubmitted: boolean,
  maxVotesPerIdeaReached: boolean,
  onIdeaPage?: boolean
) => {
  if (!userHasVotesLeft) return messages.maxVotesReached;
  if (basketSubmitted) {
    return onIdeaPage
      ? messages.votesSubmittedIdeaPage
      : messages.votesSubmitted;
  }
  if (maxVotesPerIdeaReached) return messages.maxVotesPerIdeaReached;
  return undefined;
};
