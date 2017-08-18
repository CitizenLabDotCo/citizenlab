/*
 *
 * ProjectsEvents reducer
 *
 */

import { fromJS } from 'immutable';
import { LOAD_PROJECT_EVENTS_SUCCESS } from 'resources/projects/events/constants';

const initialState = fromJS({
  events: [],
});

function projectEvents(state = initialState, action) {
  switch (action.type) {
    case LOAD_PROJECT_EVENTS_SUCCESS: {
      const ids = action.payload.data.map((event) => event.id);
      return state
        .set('events', fromJS(ids));
    }
    default:
      return state;
  }
}

export default projectEvents;
