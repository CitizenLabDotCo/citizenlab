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

const makeSelectComments = createSelector(
  selectIdeasShow('comments'),
  selectResourcesDomain('comments'),
  (ids, comments) => (ids && activeTree(ids, comments)) || [],
);

const activeTree = (ids, comments) => {
  const map = {};
  const roots = [];

  ids.forEach((id) => {
    //if (!comments.get(id)) debugger
    const parentId = comments.get(id).getIn(['relationships', 'parent', 'data', 'id']);
    const node = { id, children: [] };
    map[id] = node;

    if (!parentId) return roots.push(node);
    return map[parentId].children.push(node);
  });

  return roots;
};


export const makeSelectOwnVotesTot = (ideaId) => createSelector(
  selectAuthDomain('id'),
  selectResourcesDomain('votes'),
  (currentUserId, votes) => {
    //console.log(currentUserId, votes).toJS()
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


export { makeSelectComments };

    // if (parentId && !tempParentId) {
    //   return tot.unshift(id);
    // }

    // if (parentId && tempParentId === parentId) {
    //   return tot.unshift(id);
    // }

    // if (parentId && tempParentId !== parentId && id === tempParentId) {
    //   const newTot = List();
    //   return newTot.unshift([id, tot]);
    // }

    // if (parentId) {
    //   tempParentId = parentId;
    // }

    // if (!parentId) {
    //   tempParentId = null;
    //   finalList.unshift([id, tot]);
    //   return List();
    // }

    // return output || tot;
