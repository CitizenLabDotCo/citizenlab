import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectProjectsIndexPage = (state) => state.get('projectsIndexPage');

const makeSelectProjects = () => createSelector(
  selectProjectsIndexPage,
  selectResourcesDomain(),
  (pageState, resources) => {
    const ids = pageState.get('projects');
    const projects = resources.get('projects');
    return ids.map((id) => projects.get(id));
  }
);

export default selectProjectsIndexPage;
export {
  makeSelectProjects,
};
