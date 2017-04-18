/**
 * Direct selector to the ideasShow state domain
 */
import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

import { selectResourcesDomain } from '../../utils/resources/selectors';
import denormalize from '../../utils/denormalize';

const selectIdeasShowDomain = () => (state) => state.get('ideasShow');

/**
 * Other specific selectors
 */


/**
 * Default selector used by IdeasShow
 */

const makeSelectIdeasShow = () => createSelector(
  selectIdeasShowDomain(),
  (substate) => substate.toJS()
);

const makeSelectUpVotes = () => createSelector(
  selectIdeasShowDomain(),
  selectResourcesDomain(),
  (pageState, resources) => {
    const ids = pageState.get('upVotes', fromJS([]));
    return ids.map((id) => denormalize(resources, 'upVotes', id)).toJS();
  }
);

const makeSelectDownVotes = () => createSelector(
  selectIdeasShowDomain(),
  selectResourcesDomain(),
  (pageState, resources) => {
    const ids = pageState.get('downVotes', fromJS([]));
    return ids.map((id) => denormalize(resources, 'downVotes', id)).toJS();
  }
);

const makeSelectIdeaVotesLoadError = () => createSelector(
  selectIdeasShowDomain(),
  (pageState) => pageState.get('ideaVotesLoadError')
);

export default makeSelectIdeasShow;
export {
  selectIdeasShowDomain,
  makeSelectUpVotes,
  makeSelectDownVotes,
  makeSelectIdeaVotesLoadError,
};
