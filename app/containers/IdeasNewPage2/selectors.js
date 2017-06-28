import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

const selectTopics = (state) => state.getIn(['resources', 'topics']);
const selectTopicsIds = (state) => state.getIn(['ideasNewPage2', 'topics']);
const selectProjects = (state) => state.getIn(['resources', 'projects']);
const selectProjectsIds = (state) => state.getIn(['ideasNewPage2', 'projects']);
const selectIdeaId = (state) => state.getIn(['ideasNewPage2', 'ideaId']);

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

const makeSelectIdeaId = () => createSelector(
  selectIdeaId,
  (ideaId) => (ideaId || null)
);

export {
  makeSelectTopics,
  makeSelectProjects,
  makeSelectIdeaId,
};
