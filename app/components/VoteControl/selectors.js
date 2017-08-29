import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';
import { makeSelectCurrentUser } from 'utils/auth/selectors';

export const selectIdea = createSelector(
  selectResourcesDomain('ideas'),
  (_, props) => props.ideaId,
  (ideas, id) => id && ideas && ideas.get(id),
);

export const selectUserVoteId = createSelector(
  selectIdea,
  makeSelectCurrentUser(),
  (idea, currentUser) => currentUser && idea && idea.getIn(['relationships', 'user_vote', 'data', 'id'])
);

export const selectUserVote = createSelector(
  selectResourcesDomain('votes'),
  selectUserVoteId,
  (resourcesVotes, voteId) => resourcesVotes && resourcesVotes.get(voteId)
);
