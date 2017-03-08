/*
 *
 * IdeasPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  ADD_IDEA,
} from './constants';

const initialState = fromJS({
  ideas: [
    { heading: 'Eureka', description: 'I like to...' },
  ],
});

function ideasPageReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_IDEA:
      return state.update('ideas', (arr) => arr.push(action.payload));
    default:
      return state;
  }
}

export default ideasPageReducer;
