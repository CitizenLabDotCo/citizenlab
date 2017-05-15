/**
 * Direct selector to the ideasShow state domain
 */
import { createSelector } from 'reselect';

import { selectResourcesDomain } from 'utils/resources/selectors';
import { selectAuthDomain } from 'utils/auth/selectors';

const selectIdeasShow = (...types) => (state) => state.getIn(['ideasShow', ...types]);
export default selectIdeasShow;

export const selectIdea = createSelector(
  selectIdeasShow('idea'),
  selectResourcesDomain('ideas'),
  (id, ideas) => id && ideas.get(id),
);

export const makeSelectComments = createSelector(
  selectIdeasShow('comments'),
  selectResourcesDomain('comments'),
  (ids, comments) => (ids && activeTree(ids, comments)) || [],
);

export const activeTree = (ids, comments) => {
  const map = {};
  const roots = [];

  ids.forEach((id) => {
    const parentId = comments.get(id).getIn(['relationships', 'parent', 'data', 'id']);
    const node = { id, children: [] };
    map[id] = node;

    if (!parentId) return roots.push(node);
    if (map[parentId]) map[parentId].children.push(node);
    return '';
  });

  return roots;
};


export const makeSelectOwnVotesTot = (ideaId) => createSelector(
  selectAuthDomain('id'),
  selectResourcesDomain('votes'),
  (currentUserId, votes) => {
    if (!votes) return 0;
    const ownVotes = votes.filter((vote) => {
      const ownVote = vote.getIn(['relationships', 'user', 'data', 'id']) === currentUserId;
      const thisIdeaVote = vote.getIn(['relationships', 'votable', 'data', 'id']) === ideaId;
      return ownVote && thisIdeaVote;
    });
    const totVotes = ownVotes.reduce((tot, vote) => {
      const mode = vote.getIn(['attributes', 'mode']) === 'up' ? 1 : -1;
      return tot + mode;
    }, 0);
    return totVotes;
  },
);