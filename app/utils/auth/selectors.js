import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectAuthDomain = (...type) => (state) => state.getIn(['auth', ...type]);

const makeSelectCurrentUser = () => createSelector(
  selectAuthDomain('id'),
  selectResourcesDomain(),
  (id, resources) => {
    const immutableUser = resources.getIn(['users', id]);
    return immutableUser && immutableUser.toJS();
  }
);

const makeSelectCurrentUserImmutable = (...type) => createSelector(
  selectAuthDomain('id'),
  selectResourcesDomain(),
  (id, resources) => resources.getIn(['users', id, ...type]),
);

export {
  selectAuthDomain,
  makeSelectCurrentUser,
  makeSelectCurrentUserImmutable,
};
