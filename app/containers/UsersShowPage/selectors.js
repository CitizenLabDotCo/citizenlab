import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

import { selectResourcesDomain } from 'utils/resources/selectors';

const selectUserShowPage = (state) => state.get('usersShowPage');

const makeSelectUser = () => createSelector(
  selectUserShowPage,
  selectResourcesDomain(),
  (pageState, resources) => {
    const id = pageState.get('user', fromJS(null));
    const users = resources.get('users', fromJS({})).toJS();
    return users[id] ? users[id].attributes : null;
  }
);

const makeSelectIdeas = () => createSelector(
  selectUserShowPage,
  selectResourcesDomain(),
  (pageState, resources) => {
    const ids = pageState.get('ideas', fromJS([]));
    return ids.map((id) => resources.get(id)).toJS();
  }
);

export {
  selectUserShowPage,
  makeSelectUser,
  makeSelectIdeas,
};

