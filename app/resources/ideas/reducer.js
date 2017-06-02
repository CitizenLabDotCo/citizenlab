/*
 *
 * resources/ideas reducer
 *
 */

import { fromJS } from 'immutable';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from 'utils/paginationUtils';

import { LOAD_IDEAS_SUCCESS, RESET_IDEAS, DELETE_IDEA_SUCCESS, CREATE_IDEA_SUCCESS } from './constants';

export const initialState = fromJS({
  nextPageNumber: 1,
  nextPageItemCount: 3,
  loaded: [],
});

function ideasReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEAS_SUCCESS: {
      const ids = action.payload.data.map((idea) => idea.id);
      const nextPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.links.next);
      return state
        .update('loaded', (ideas) => ideas.concat(ids))
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount);
    }
    case RESET_IDEAS:
      return initialState;
    case DELETE_IDEA_SUCCESS: {
      const ideaIndex = state.get('loaded').findIndex((id) => action.id === id);
      return state.deleteIn(['loaded', ideaIndex]);
    }
    case CREATE_IDEA_SUCCESS: {
      const { id } = action.payload.data;
      return state.update('loaded', (ideas) => ideas.concat(id));
    }
    default:
      return state;
  }
}

export default ideasReducer;
