/*
 *
 * IdeasIndexPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  IDEAS_LOADED, LOAD_IDEAS_REQUEST,
} from './constants';

const initialState = fromJS({
  nextPageLink: null,
  ideas: [],
  loading: false,
});

function ideasIndexPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEAS_REQUEST:
      return state
        .set('loading', true);
    case IDEAS_LOADED: {
      const ids = action.payload.data.map((idea) => idea.id);
      return state
        .set('ideas', fromJS(state.get('ideas')).concat(ids))
        .set('nextPageLink', action.payload.links.next)
        .set('loading', false);
    }
    default:
      return state;
  }
}

export default ideasIndexPageReducer;
