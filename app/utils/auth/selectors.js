import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectAuthDomain = () => (state) => state.get('auth');

const makeSelectCurrentUser = createSelector(
  selectAuthDomain(),
  selectResourcesDomain(),
  (auth, resources) => resources.getIn(['users', auth.get('id')])
);

export {
  selectAuthDomain,
  makeSelectCurrentUser,
};
