import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

const selectIdeasNewPage2 = (state) => state.get('ideasNewPage2');
const selectTopics = (state) => state.getIn(['resources', 'topics']);
const selectTopicsIds = (state) => state.getIn(['ideasNewPage2', 'topics']);
const selectAreas = (state) => state.getIn(['resources', 'areas']);
const selectAreasIds = (state) => state.getIn(['ideasNewPage2', 'areas']);
const selectProjects = (state) => state.getIn(['resources', 'projects']);
const selectProjectsIds = (state) => state.getIn(['ideasNewPage2', 'projects']);

const empty = fromJS([]);

const makeSelectTopics = () => createSelector(
  selectTopicsIds,
  selectTopics,
  (topicsIds, topics) => {
    if (topics && topicsIds) {
      return topicsIds.map((id) => topics.get(id));
    }

    return empty;
  }
);

const makeSelectAreas = () => createSelector(
  selectAreasIds,
  selectAreas,
  (areasIds, areas) => {
    if (areas && areasIds) {
      return areasIds.map((id) => areas.get(id));
    }

    return empty;
  }
);

const makeSelectProjects = () => createSelector(
  selectProjectsIds,
  selectProjects,
  (projectsIds, projects) => {
    if (projects && projectsIds) {
      return projectsIds.map((id) => projects.get(id));
    }

    return empty;
  }
);

export {
  selectIdeasNewPage2,
  makeSelectTopics,
  makeSelectProjects,
  makeSelectAreas,
};
