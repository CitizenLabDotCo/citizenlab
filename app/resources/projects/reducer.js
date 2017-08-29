/*
 *
 * resources/projects reducer
 *
 */

import { fromJS } from 'immutable';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from 'utils/paginationUtils';

import { LOAD_PROJECTS_SUCCESS, RESET_PROJECTS, DELETE_PROJECT_SUCCESS, CREATE_PROJECT_SUCCESS } from './constants';

export const initialState = fromJS({
  nextPageNumber: 1,
  nextPageItemCount: 3,
  loaded: [],
});

function projectsReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_PROJECTS_SUCCESS: {
      const ids = action.payload.data.map((idea) => idea.id);
      const nextPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.links.next);
      return state
        .update('loaded', (projects) => projects.concat(ids))
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount);
    }
    case RESET_PROJECTS:
      return initialState;
    case DELETE_PROJECT_SUCCESS: {
      const projectIndex = state.get('loaded').findIndex((id) => action.id === id);
      return state.deleteIn(['loaded', projectIndex]);
    }
    case CREATE_PROJECT_SUCCESS: {
      const { id } = action.payload.data;
      return state.update('loaded', (projects) => projects.concat(id));
    }
    default:
      return state;
  }
}

export default projectsReducer;
