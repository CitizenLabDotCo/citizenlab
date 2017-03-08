import { createSelector } from 'reselect';

/**
 * Other specific selectors
 */

const selectProfile = (state) => state.get('profile');

const makeSelectLoading = () => createSelector(
  selectProfile,
  (globalState) => globalState.get('loading')
);

const makeSelectError = () => createSelector(
  selectProfile,
  (globalState) => globalState.get('error')
);

const makeSelectUserData = () => createSelector(
  selectProfile,
  (globalState) => globalState.get('userData')
);

export {
  makeSelectLoading,
  makeSelectError,
  makeSelectUserData,
};
