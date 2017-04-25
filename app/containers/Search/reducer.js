/*
 *
 * Search reducer
 *
 */

import { fromJS } from 'immutable';
import {
  SEARCH_IDEAS_ERROR,
  SEARCH_IDEAS_REQUEST, SEARCH_IDEAS_SUCCESS,
} from './constants';

const initialState = fromJS({
  isLoadingFilteredIdeas: false,
});

function searchReducer(state = initialState, action) {
  switch (action.type) {
    case SEARCH_IDEAS_REQUEST:
      return state
        .set('isLoadingFilteredIdeas', true);
    case SEARCH_IDEAS_ERROR:
      return state
        .set('isLoadingFilteredIdeas', false);
    case SEARCH_IDEAS_SUCCESS:
      return state
        .set('isLoadingFilteredIdeas', false);
    default:
      return state;
  }
}

export default searchReducer;
