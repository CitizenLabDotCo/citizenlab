/*
 *
 * resources/areas reducer
 *
 */

import { fromJS } from 'immutable';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from 'utils/paginationUtils';

import { LOAD_AREAS_SUCCESS, RESET_AREAS, DELETE_AREA_SUCCESS, CREATE_AREA_SUCCESS } from './constants';

export const initialState = fromJS({
  nextPageNumber: 1,
  nextPageItemCount: 3,
  loaded: [],
});

function areasReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_AREAS_SUCCESS: {
      const ids = action.payload.data.map((idea) => idea.id);
      const nextPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.links.next);
      return state
        .update('loaded', (areas) => areas.concat(ids))
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount);
    }
    case RESET_AREAS:
      return initialState;
    case DELETE_AREA_SUCCESS: {
      const areaIndex = state.get('loaded').findIndex((id) => action.id === id);
      return state.deleteIn(['loaded', areaIndex]);
    }
    case CREATE_AREA_SUCCESS: {
      const { id } = action.payload.data;
      return state.update('loaded', (areas) => areas.concat(id));
    }
    default:
      return state;
  }
}

export default areasReducer;
