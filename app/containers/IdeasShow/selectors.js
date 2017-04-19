/**
 * Direct selector to the ideasShow state domain
 */
import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

import { selectResourcesDomain } from '../../utils/resources/selectors';

const selectIdeasShow = (state) => state.get('ideasShow');
const selectResources = selectResourcesDomain();

/**
 * Other specific selectors
 */


/**
 * Default selector used by IdeasShow
 */

const makeSelectIdeasShow = () => createSelector(
  selectIdeasShow,
  (substate) => substate.toJS()
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
  (pageState) => pageState.get('makeSelectActiveParentId')
);

export default makeSelectIdeasShow;
export {
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
