/*
 *
 * resources/projects reducer
 *
 */

import { fromJS } from 'immutable';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from 'utils/paginationUtils';

import { LOAD_PROJECTS_SUCCESS, RESET_PROJECTS, DELETE_PROJECT_SUCCESS, PUBLISH_PROJECT_SUCCESS } from './constants';

export const initialState = fromJS({
  nextPageNumber: null,
  nextPageItemCount: null,
  projects: [],
});

function projectsReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_PROJECTS_SUCCESS: {
      const ids = action.payload.data.map((idea) => idea.id);
      const nextPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.links.next);
      return state
        .update('projects', (projects) => projects.concat(ids))
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount);
    }
    case RESET_PROJECTS:
      return state
        .set('projects', fromJS([]));
    case DELETE_PROJECT_SUCCESS: {
      const projectIndex = state.get('projects').findIndex((id) => action.id === id);
      return state.deleteIn(['projects', projectIndex]);
    }
    case PUBLISH_PROJECT_SUCCESS: {
      const { id } = action.payload.data;
      return state.update('projects', (projects) => projects.concat(id));
    }
    default:
      return state;
  }
}

export default projectsReducer;
