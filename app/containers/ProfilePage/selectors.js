import { createSelector } from 'reselect';

/**
 * Other specific selectors
 */

const selectProfile = (state) => state.get('profile');

const makeSelectLoading = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('loading')
);

const makeSelectError = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('error')
);

const makeSelectUserData = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('userData')
);

export {
  makeSelectLoading,
  makeSelectError,
  makeSelectUserData,
};
