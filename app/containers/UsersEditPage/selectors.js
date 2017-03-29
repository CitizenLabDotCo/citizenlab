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

const makeSelectAvatarLoadError = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('avatarLoadError')
);

const makeSelectAvatarStoreError = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('avatarStoreError')
);

const makeSelectAvatarBase64 = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('avatarBase64')
);

export {
  makeSelectLoading,
  makeSelectLoadError,
  makeSelectStoreError,
  makeSelectUserData,
  makeSelectProcessing,
  makeSelectStored,
  makeSelectAvatarLoadError,
  makeSelectAvatarStoreError,
  makeSelectAvatarBase64,
};
