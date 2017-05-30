import { createSelector } from 'reselect';

const selectLandingPage = (state) => state.get('landingPage');
const selectIdeas = (state) => state.getIn(['resources', 'ideas']);
const selectIdeasIds = (state) => state.getIn(['landingPage', 'ideas']);
const selectProjects = (state) => state.getIn(['resources', 'projects']);
const selectProjectsIds = (state) => state.getIn(['landingPage', 'projects']);

const makeSelectIdeas = () => createSelector(
  selectIdeasIds,
  selectIdeas,
  (ideasIds, ideas) => ideasIds.map((id) => ideas.get(id))
);

const makeSelectProjects = () => createSelector(
  selectProjectsIds,
  selectProjects,
  (projectsIds, projects) => projectsIds.map((id) => projects.get(id))
);

export {
  selectLandingPage,
  makeSelectIdeas,
  makeSelectProjects,
};
