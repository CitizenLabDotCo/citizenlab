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
  (profileState) => (
    profileState
      ? profileState.getIn(['userData', 'user'])
      : null
  )
);

export {
  makeSelectLoading,
  makeSelectError,
  makeSelectUserData,
};
