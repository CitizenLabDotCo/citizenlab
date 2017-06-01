/*
 *
 * AdminPages selectors
 *
 */

import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectAdminPages = (state) => state.get('adminPages');

const makeSelectPages = () => createSelector(
  selectAdminPages,
  selectResourcesDomain(),
  (submitIdeaState, resources) => {
    const ids = submitIdeaState.get('pages');
    const pages = resources.get('pages');
    return ids.map((id) => pages.get(id));
  }
);

export {
  selectAdminPages,
  makeSelectPages,
};
