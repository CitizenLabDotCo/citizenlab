import { createSelector } from 'reselect';

/**
 * Direct selector to the ideasShow state domain
 */
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
  (pageState) => pageState.get('comments')
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
};
