import { createSelector } from 'reselect';

/**
 * Direct selector to the submitIdeaPage state domain
 */
const selectSubmitIdeaPageDomain = () => (state) => state.get('submitIdeaPage');

/**
 * Other specific selectors
 */


/**
 * Default selector used by SubmitIdeaPage
 */

const makeSelectSubmitIdeaPage = () => createSelector(
  selectSubmitIdeaPageDomain(),
  (substate) => substate.toJS()
);

export default makeSelectSubmitIdeaPage;
export {
  selectSubmitIdeaPageDomain,
};
