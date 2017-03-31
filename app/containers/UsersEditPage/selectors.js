import { createSelector } from 'reselect';

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
  (profileState) => profileState.get('currentUser')
);

const makeSelectProcessing = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('processing')
);

const makeSelectStored = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('stored')
);

const makeSelectAvatarUploadError = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('avatarUploadError')
);

export {
  makeSelectLoading,
  makeSelectLoadError,
  makeSelectStoreError,
  makeSelectUserData,
  makeSelectProcessing,
  makeSelectStored,
  makeSelectAvatarUploadError,
};
