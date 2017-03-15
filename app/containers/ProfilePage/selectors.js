import { createSelector } from 'reselect';

/**
 * Other specific selectors
 */

const selectProfile = (state) => state.get('profile');

const makeSelectLoading = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('loading')
);

const makeSelectLoadError = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('loadError')
);

const makeSelectStoreError = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('storeError')
);

const makeSelectUserData = () => createSelector(
  selectProfile,
  (profileState) => profileState.getIn(['userData', 'user'])
);

const makeSelectProcessing = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('processing')
);

const makeSelectStored = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('stored')
);

export {
  makeSelectLoading,
  makeSelectLoadError,
  makeSelectStoreError,
  makeSelectUserData,
  makeSelectProcessing,
  makeSelectStored,
};
