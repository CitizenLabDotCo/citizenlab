/**
 * Direct selector to the ideasShow state domain
 */
import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

import { selectResourcesDomain } from '../../utils/resources/selectors';
import denormalize from '../../utils/denormalize';

const selectIdeasShowDomain = () => (state) => state.get('ideasShow');

const selectIdeasShow = (state) => state.get('ideasShow');
const selectResources = selectResourcesDomain();


/**
 * Default selector used by IdeasShow
 */
const makeSelectIdeasShow = () => createSelector(
  selectIdeasShow,
  (substate) => substate.toJS()
);

const makeSelectIdea = () => createSelector(
  selectIdeasShowDomain(),
  selectResourcesDomain(),
  (pageState, resources) => {
    const id = pageState.get('idea', null);
    return (id
      ? denormalize(resources, 'ideas', id).toJS()
      : null);
  }
);


/**
 * Other selectors
 */
const makeSelectLoadingVotes = () => createSelector(
  selectIdeasShowDomain(),
  (pageState) => pageState.get('loadingVotes')
);

const makeSelectSubmittingVote = () => createSelector(
  selectIdeasShowDomain(),
  (pageState) => pageState.get('submittingVote')
);

const makeSelectUpVotes = () => createSelector(
  selectIdeasShowDomain(),
  selectResourcesDomain(),
  (pageState, resources) => {
    const ids = pageState.get('votes', fromJS([]));
    const results = ids.map((id) => denormalize(resources, 'votes', id)).toJS();
    return results.filter((result) => result.attributes.mode === 'up');
  }
);

const makeSelectDownVotes = () => createSelector(
  selectIdeasShowDomain(),
  selectResourcesDomain(),
  (pageState, resources) => {
    const ids = pageState.get('votes', fromJS([]));
    const results = ids.map((id) => denormalize(resources, 'votes', id)).toJS();
    return results.filter((result) => result.attributes.mode === 'down');
  }
);

const makeSelectIdeaVotesLoadError = () => createSelector(
  selectIdeasShowDomain(),
  (pageState) => pageState.get('ideaVotesLoadError')
);

const makeSelectIdeaVoteSubmitError = () => createSelector(
  selectIdeasShowDomain(),
  (pageState) => pageState.get('ideaVoteSubmitError')
);

const makeSelectLoadingIdea = () => createSelector(
  selectIdeasShow,
  (pageState) => pageState.get('loadingIdea')
);

const makeSelectLoadIdeaError = () => createSelector(
  selectIdeasShow,
  (pageState) => pageState.get('loadIdeaError')
);

const makeSelectLoadingComments = () => createSelector(
  selectIdeasShow,
  (pageState) => pageState.get('loadingComments')
);

const makeSelectLoadCommentsError = () => createSelector(
  selectIdeasShow,
  (pageState) => pageState.get('storeCommentError')
);

const makeSelectComments = () => createSelector(
  selectIdeasShow,
  selectResources,
  (pageState, resources) => {
    const ids = pageState.get('comments', fromJS([]));
    const commentsMap = resources.get('comments', fromJS({}));
    return ids.map((id) => commentsMap.get(id)).toJS();
  }
);

const makeSelectStoreCommentError = () => createSelector(
  selectIdeasShow,
  (pageState) => pageState.get('storeCommentError')
);

const makeSelectSubmittingComment = () => createSelector(
  selectIdeasShow,
  (pageState) => pageState.get('submittingComment')
);

const makeSelectCommentContent = () => createSelector(
  selectIdeasShow,
  (pageState) => pageState.get('commentContent')
);

const makeSelectResetEditorContent = () => createSelector(
  selectIdeasShow,
  (pageState) => pageState.get('resetEditorContent')
);

const makeSelectNextCommentPageNumber = () => createSelector(
  selectIdeasShow,
  (pageState) => pageState.get('nextCommentPageNumber')
);

const makeSelectNextCommentPageItemCount = () => createSelector(
  selectIdeasShow,
  (pageState) => pageState.get('nextCommentPageItemCount')
);

const makeSelectActiveParentId = () => createSelector(
  selectIdeasShow,
  (pageState) => pageState.get('activeParentId')
);

export default makeSelectIdeasShow;
export {
  makeSelectIdea,
  makeSelectUpVotes,
  makeSelectDownVotes,
  makeSelectIdeaVotesLoadError,
  makeSelectLoadingVotes,
  makeSelectSubmittingVote,
  makeSelectIdeaVoteSubmitError,
  makeSelectLoadingComments,
  makeSelectLoadCommentsError,
  makeSelectComments,
  makeSelectStoreCommentError,
  makeSelectSubmittingComment,
  makeSelectCommentContent,
  makeSelectResetEditorContent,
  makeSelectNextCommentPageNumber,
  makeSelectNextCommentPageItemCount,
  makeSelectLoadingIdea,
  makeSelectLoadIdeaError,
  makeSelectActiveParentId,
};
