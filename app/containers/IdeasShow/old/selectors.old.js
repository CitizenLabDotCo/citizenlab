/**
 * Direct selector to the ideasShow state domain
 */
import { createSelector } from 'reselect';
import { OrderedMap } from 'immutable';

const selectIdeasShowPageDomain = (...types) => (state) => state.getIn(['ideasShow', ...types]);


import { selectResourcesDomain } from 'utils/resources/selectors';

const makeSelectIdeasShow = (...types) => (state) => {
  let data = state.get('ideasShow');
  types.map((type) => (data = data.get(type)));
  return data;
};

const makeSelectIdea = () => createSelector(
  makeSelectIdeasShow(),
  selectResourcesDomain(),
  (pageState, resources) => {
    const id = pageState.get('idea', null);
    return id && resources.getIn(['ideas', id]).toJS();
  }
);

const makeSelectComments = () => createSelector(
  makeSelectIdeasShow('comments'),
  selectResourcesDomain('comments'),
  (ids, comments) => {
    if (!comments || comments.isEmpty() || !ids || ids.isEmpty()) return null;
    return activeTree(ids, comments);
  }
);

const activeTree = (ids, comments) => {
  const parentIdLoc = ['relationships', 'parent', 'data', 'id'];
  const childAddLoc = ['relationships', 'children', 'data'];
  let childComments;
  let tempParentId;

  let tree = OrderedMap();

  ids.reduceRight((tot, id) => {
    let output;
    let currentComment = comments.get(id);
    const parentId = currentComment.getIn(parentIdLoc);

    if (parentId && !tempParentId) {
      tempParentId = parentId;
      return tot.set(id, currentComment);
    }
    if (parentId) {
      tempParentId = parentId;
    }

    if (parentId && !tempParentId) {
      return tot.set(id, currentComment);
    }

    if (parentId && tempParentId === parentId) {
      return tot.set(id, currentComment);
    }

    if (parentId && tempParentId !== parentId && id === tempParentId) {
      const newTot = OrderedMap();

      currentComment = currentComment.setIn(childAddLoc, childComments);
      return newTot.set(id, currentComment);
    }

    if (!parentId) {
      tempParentId = null;
      currentComment = currentComment.setIn(childAddLoc, tot);
      tree = tree.set(id, currentComment);
      return OrderedMap();
    }
    return output || tot;
  }, OrderedMap());
  return tree;
};

// const tree = [];

// data.reduceRight((newTree, comment, i) => {
//   console.log(comment.relationships.parent.data)
//   if (comment.relationships.parent.data) {
//     comment.relationships.parent = data.parent;
//     data.children = data[i - 1];
//     return tree;
//   }
//   return tree.push(comment);
// }, tree);

/**
 * Other selectors
 */
// const makeSelectLoadingVotes = () => createSelector(
//   makeSelectIdeasShow(),
//   (pageState) => pageState.get('loadingVotes')
// );

// const makeSelectSubmittingVote = () => createSelector(
//   makeSelectIdeasShow(),
//   (pageState) => pageState.get('submittingVote')
// );


// TOBE IMPLEMENTED!!!

// const makeSelectUpVotes = () => createSelector(
//   makeSelectIdeasShow(),
//   selectResourcesDomain(),
//   (pageState, resources) => {
//     const ids = pageState.get('votes', fromJS([]));
//     const results = ids.map((id) => denormalize(resources, 'votes', id)).toJS();
//     return results.filter((result) => result.attributes.mode === 'up');
//   }
// );

// const makeSelectDownVotes = () => createSelector(
//   makeSelectIdeasShow(),
//   selectResourcesDomain(),
//   (pageState, resources) => {
//     const ids = pageState.get('votes', fromJS([]));
//     const results = ids.map((id) => denormalize(resources, 'votes', id)).toJS();
//     return results.filter((result) => result.attributes.mode === 'down');
//   }
// );

// const makeSelectIdeaVotesLoadError = () => createSelector(
//   makeSelectIdeasShow(),
//   (pageState) => pageState.get('ideaVotesLoadError')
// );

// const makeSelectIdeaVoteSubmitError = () => createSelector(
//   makeSelectIdeasShow(),
//   (pageState) => pageState.get('ideaVoteSubmitError')
// );

// const makeSelectLoadingIdea = () => createSelector(
//   makeSelectIdeasShow(),
//   (pageState) => pageState.get('loadingIdea')
// );

// const makeSelectLoadIdeaError = () => createSelector(
//   makeSelectIdeasShow(),
//   (pageState) => pageState.get('loadIdeaError')
// );

// const makeSelectLoadingComments = () => createSelector(
//   makeSelectIdeasShow(),
//   (pageState) => pageState.get('loadingComments')
// );

// const makeSelectLoadCommentsError = () => createSelector(
//   makeSelectIdeasShow(),
//   (pageState) => pageState.get('storeCommentError')
// );

// const makeSelectStoreCommentError = () => createSelector(
//   makeSelectIdeasShow(),
//   (pageState) => pageState.get('storeCommentError')
// );

// const makeSelectSubmittingComment = () => createSelector(
//   makeSelectIdeasShow(),
//   (pageState) => pageState.get('submittingComment')
// );

// const makeSelectCommentContent = () => createSelector(
//   makeSelectIdeasShow(),
//   (pageState) => pageState.get('commentContent')
// );

// const makeSelectResetEditorContent = () => createSelector(
//   makeSelectIdeasShow(),
//   (pageState) => pageState.get('resetEditorContent')
// );

// const makeSelectNextCommentPageNumber = () => createSelector(
//   makeSelectIdeasShow(),
//   (pageState) => pageState.get('nextCommentPageNumber')
// );

// const makeSelectNextCommentPageItemCount = () => createSelector(
//   makeSelectIdeasShow(),
//   (pageState) => pageState.get('nextCommentPageItemCount')
// );

// const makeSelectActiveParentId = () => createSelector(
//   makeSelectIdeasShow(),
//   (pageState) => pageState.get('activeParentId')
// );

export default makeSelectIdeasShow;
export {
  makeSelectIdea,
  // makeSelectUpVotes,
  // makeSelectDownVotes,
  makeSelectComments,
};
