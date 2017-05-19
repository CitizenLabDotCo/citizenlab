/*
 *
 * ProjectsIndexPage reducer
 *
 */

import { fromJS } from 'immutable';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from 'utils/paginationUtils';

import { LOAD_PROJECTS_ERROR, LOAD_PROJECTS_REQUEST, LOAD_PROJECTS_SUCCESS, RESET_PROJECTS } from './constants';

const initialState = fromJS({
  loading: false,
  loadError: null,
  nextPageNumber: null,
  nextPageItemCount: null,
  projects: [],
});

function projectsIndexPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_PROJECTS_REQUEST:
      return state
        .set('loading', true)
        .set('loadError', null);
    case LOAD_PROJECTS_SUCCESS: {
      const ids = action.payload.data.map((idea) => idea.id);
      const nextPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.links.next);

      return state
        .update('projects', (projects) => projects.concat(ids))
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount)
        .set('loading', false);
    }
    case LOAD_PROJECTS_ERROR:
      return state
        .set('loading', false)
        .set('loadError', action.error);
    case RESET_PROJECTS:
      return state
        .set('projects', fromJS([]));
    default:
      return state;
  }
}

export default projectsIndexPageReducer;
