import { createSelector } from 'reselect';

const selectIdeas = (state) => state.getIn(['resources', 'ideas']);
const selectIdeasIds = (state) => state.getIn(['landingPage', 'ideas']);
const selectLoadingIdeas = (state) => state.getIn(['landingPage', 'loadingIdeas']);
const selectLoadIdeasError = (state) => state.getIn(['landingPage', 'loadIdeasError']);

const makeSelectIdeas = () => createSelector(
  selectIdeasIds,
  selectIdeas,
  (ideasIds, ideas) => ideasIds.map((id) => ideas.get(id))
);

export {
  selectIdeas,
  selectIdeasIds,
  selectLoadingIdeas,
  selectLoadIdeasError,
  makeSelectIdeas,
};
