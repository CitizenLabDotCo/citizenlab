/*
 *
 * IdeasIndexPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  LOAD_IDEAS,
  IDEAS_LOADED,
} from './constants';

const initialState = fromJS({});

function ideasIndexPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEAS:
      return state;
    case IDEAS_LOADED: {
      const ids = action.payload.data.map((idea) => idea.id);
      return state.set('ideas', ids);
    }
    default:
      return state;
  }
}

export default ideasIndexPageReducer;
