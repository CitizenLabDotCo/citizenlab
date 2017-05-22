/*
 *
 * PagesShowPage reducer
 *
 */

import { fromJS } from 'immutable';
import { LOAD_PAGE_ERROR, LOAD_PAGE_REQUEST, LOAD_PAGE_SUCCESS } from './constants';

export const initialState = fromJS({
  loading: false,
  loadError: null,
  page: null,
});

function pagesShowPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_PAGE_REQUEST:
      return state
        .set('loading', true)
        .set('loadError', null);
    case LOAD_PAGE_SUCCESS:
      return state
        .set('loading', false)
        .set('page', action.payload.data.id);
    case LOAD_PAGE_ERROR:
      return state
        .set('loading', false)
        .set('loadError', action.error);
    default:
      return state;
  }
}

export default pagesShowPageReducer;
