import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

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

const makeSelectUser = () => createSelector(
  selectUserShowPage,
  selectResourcesDomain(),
  (pageState, resources) => {
    const id = pageState.get('user', fromJS(null));
    const users = resources.get('users', fromJS({})).toJS();
    return users[id] ? users[id].attributes : null;
  }
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
    const ideasMap = resources.get('ideas', fromJS({}));
    return ids.map((id) => ideasMap.get(id)).toJS();
  }
);

export {
  makeSelectLoadingUser,
  makeSelectLoadUserError,
  makeSelectUser,
  makeSelectLoadingUserIdeas,
  makeSelectLoadUserIdeasError,
  makeSelectIdeas,
};
