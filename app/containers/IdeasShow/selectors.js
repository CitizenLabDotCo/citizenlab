/**
 * Direct selector to the ideasShow state domain
 */
import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

import { selectResourcesDomain } from '../../utils/resources/selectors';

const selectIdeasShowDomain = () => (state) => state.get('ideasShow');

/**
 * Other specific selectors
 */


/**
 * Default selector used by IdeasShow
 */

const makeSelectIdeasShow = () => createSelector(
  selectIdeasShowDomain(),
  (substate) => substate.toJS()
);

const makeSelectLoadingIdea = () => createSelector(
  selectIdeasShowDomain(),
  (pageState) => pageState.get('loadingIdea')
);

const makeSelectLoadIdeaError = () => createSelector(
  selectIdeasShowDomain(),
  (pageState) => pageState.get('loadIdeaError')
);

const makeSelectLoadingComments = () => createSelector(
  selectIdeasShowDomain(),
  (pageState) => pageState.get('loadingComments')
);

const makeSelectLoadCommentsError = () => createSelector(
  selectIdeasShowDomain(),
  (pageState) => pageState.get('storeCommentError')
);

const makeSelectComments = () => createSelector(
  selectIdeasShowDomain(),
  selectResourcesDomain(),
  (pageState, resources) => {
    const ids = pageState.get('comments', fromJS([]));
    const commentsMap = resources.get('comments', fromJS({}));
    return ids.map((id) => commentsMap.get(id)).toJS();
  }
);

const makeSelectStoreCommentError = () => createSelector(
  selectIdeasShowDomain(),
  (pageState) => pageState.get('storeCommentError')
);

const makeSelectSubmittingComment = () => createSelector(
  selectIdeasShowDomain(),
  (pageState) => pageState.get('submittingComment')
);

const makeSelectCommentContent = () => createSelector(
  selectIdeasShowDomain(),
  (pageState) => pageState.get('commentContent')
);

const makeSelectResetEditorContent = () => createSelector(
  selectIdeasShowDomain(),
  (pageState) => pageState.get('resetEditorContent')
);

const makeSelectNextCommentPageNumber = () => createSelector(
  selectIdeasShowDomain(),
  (pageState) => pageState.get('nextCommentPageNumber')
);

const makeSelectNextCommentPageItemCount = () => createSelector(
  selectIdeasShowDomain(),
  (pageState) => pageState.get('nextCommentPageItemCount')
);

const makeSelectActiveParentId = () => createSelector(
  selectIdeasShowDomain(),
  (pageState) => pageState.get('makeSelectActiveParentId')
);

export default makeSelectIdeasShow;
export {
  selectIdeasShowDomain,
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
