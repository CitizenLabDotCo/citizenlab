import { createSelector } from 'reselect';
import { fromJS } from 'immutable';
import denormalize from 'utils/denormalize';

import { selectResourcesDomain } from '../../utils/resources/selectors';

const selectUserShowPage = (state) => state.get('usersShowPage');

const makeSelectLoadingUser = () => createSelector(
  selectUserShowPage,
  (userShowPageState) => userShowPageState.get('loadingUser')
);

const makeSelectLoadUserError = () => createSelector(
  selectUserShowPage,
  (userShowPageState) => userShowPageState.get('loadUserError')
);

const makeSelectUserData = () => createSelector(
  selectUserShowPage,
  (userShowPageState) => userShowPageState.get('userData')
);

const makeSelectLoadingUserIdeas = () => createSelector(
  selectUserShowPage,
  (userShowPageState) => userShowPageState.get('loadingUserIdeas')
);

const makeSelectLoadUserIdeasError = () => createSelector(
  selectUserShowPage,
  (userShowPageState) => userShowPageState.get('loadUserIdeasError')
);

const makeSelectIdeas = () => createSelector(
  selectUserShowPage,
  selectResourcesDomain(),
  (pageState, resources) => {
    const ids = pageState.get('ideas', fromJS([]));
    return ids.map((id) => denormalize(resources, 'ideas', id)).toJS();
  }
);

export {
  makeSelectLoadingUser,
  makeSelectLoadUserError,
  makeSelectUserData,
  makeSelectLoadingUserIdeas,
  makeSelectLoadUserIdeasError,
  makeSelectIdeas,
};
