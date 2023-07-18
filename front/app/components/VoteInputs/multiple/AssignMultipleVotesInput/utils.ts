import messages from './messages';

export const getMinusButtonDisabledMessage = (basketSubmitted: boolean) => {
  if (basketSubmitted) return messages.votesSubmitted;
  return undefined;
};

export const getPlusButtonDisabledMessage = (
  userHasVotesLeft: boolean,
  basketSubmitted: boolean,
  maxVotesPerIdeaReached: boolean
) => {
  if (!userHasVotesLeft) return messages.maxVotesReached;
  if (basketSubmitted) return messages.votesSubmitted;
  if (maxVotesPerIdeaReached) return messages.maxVotesPerIdeaReached;
  return undefined;
};
