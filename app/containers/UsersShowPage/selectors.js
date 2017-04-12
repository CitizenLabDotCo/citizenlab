import { createSelector } from 'reselect';

const selectProfile = (state) => state.get('usersShowPage');

const makeSelectLoading = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('loading')
);

const makeSelectLoadError = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('loadError')
);

const makeSelectUserData = () => createSelector(
  selectProfile,
  (profileState) => profileState.get('userData')
);

export {
  makeSelectLoading,
  makeSelectLoadError,
  makeSelectUserData,
};
