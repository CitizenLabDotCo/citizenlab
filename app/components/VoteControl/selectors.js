import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

export const selectIdea = createSelector(
  selectResourcesDomain('ideas'),
  (_, props) => props.ideaId,
  (ideas, id) => id && ideas && ideas.get(id),
);

export const selectUserVoteId = createSelector(
  selectIdea,
  (idea) => idea && idea.getIn(['relationships', 'user_vote', 'data', 'id'])
);

export const selectUserVote = createSelector(
  selectResourcesDomain('votes'),
  selectUserVoteId,
  (resourcesVotes, voteId) => resourcesVotes && resourcesVotes.get(voteId)
);
