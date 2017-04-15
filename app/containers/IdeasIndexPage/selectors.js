import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';
import denormalize from 'utils/denormalize';
import { fromJS } from 'immutable';

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

const makeSelectIdeasIndexPage = () => createSelector(
  selectIdeasIndexPageDomain(),
  (substate) => substate.toJS()
);


const makeSelectIdeas = () => createSelector(
  selectIdeasIndexPageDomain(),
  selectResourcesDomain(),
  (pageState, resources) => {
    const ids = pageState.get('ideas', fromJS([]));

    return ids.map((id) => denormalize(resources, 'ideas', id)).toJS();
  }
);

const makeSelectNextPageNumber = () => createSelector(
  selectIdeasIndexPageDomain(),
  (pageState) => pageState.get('nextPageNumber')
);

const makeSelectNextPageItemCount = () => createSelector(
  selectIdeasIndexPageDomain(),
  (pageState) => pageState.get('nextPageItemCount')
);

const makeSelectLoading = () => createSelector(
  selectIdeasIndexPageDomain(),
  (submitIdeaState) => submitIdeaState.get('loading')
);

const makeSelectTopicsDomain = () => createSelector(
  selectIdeasIndexPageDomain(),
  (substate) => substate.get('topics'),
);

const makeSelectAreasDomain = () => createSelector(
  selectIdeasIndexPageDomain(),
  (substate) => substate.get('areas'),
);

const makeSelectTopics = () => createSelector(
  makeSelectTopicsDomain(),
  selectResourcesDomain(),
  (topicsState, resources) => {
    const ids = topicsState.get('ids');
    const topicsMap = resources.get('topics');
    return ids.map((id) => topicsMap.get(id).toJS());
  }
);

const makeSelectAreas = () => createSelector(
  makeSelectAreasDomain(),
  selectResourcesDomain(),
  (areasState, resources) => {
    const ids = areasState.get('ids');
    const areasMap = resources.get('areas');
    return ids.map((id) => areasMap.get(id).toJS());
  }
);

export default makeSelectIdeasIndexPage;

export {
  selectIdeasIndexPageDomain,
  makeSelectIdeas,
  makeSelectNextPageNumber,
  makeSelectLoading,
  makeSelectNextPageItemCount,
  makeSelectTopicsDomain,
  makeSelectTopics,
  makeSelectAreas,
};
