import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

/**
 * Direct selector to the ideasIndexPage state domain
 */
const selectIdeasIndexPageDomain = () => (state) => state.get('ideasIndexPage');

/**
 * Other specific selectors
 */


/**
 * Default selector used by IdeasIndexPage
 */

// const makeSelectIdeasIndexPage = () => createSelector(
//   selectIdeasIndexPageDomain(),
//   (substate) => substate.toJS()
// );

const makeSelectIdeas = () => createSelector(
  selectIdeasIndexPageDomain(),
  selectResourcesDomain(),
  (pageState, resources) => {
    const ids = pageState.get('ideas', []);
    const ideasMap = resources.get('ideas', {});
    return ids.map((id) => ideasMap.get(id).toJS());
  }
);

const makeSelectNextPageLink = () => createSelector(
  selectIdeasIndexPageDomain(),
  (pageState) => pageState.get('nextPageLink')
);

const makeSelectLoading = () => createSelector(
  selectIdeasIndexPageDomain(),
  (submitIdeaState) => submitIdeaState.get('loading')
);

// export default makeSelectIdeasIndexPage;
export {
  selectIdeasIndexPageDomain,
  makeSelectIdeas,
  makeSelectNextPageLink,
  makeSelectLoading,
};
