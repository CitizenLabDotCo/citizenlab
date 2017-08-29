/*
 *
 * ProjectsTimeline reducer
 *
 */

import { fromJS } from 'immutable';
import { LOAD_PROJECT_PHASES_SUCCESS } from 'resources/projects/phases/constants';

const initialState = fromJS({
  phases: [],
});

function projectTimeline(state = initialState, action) {
  switch (action.type) {
    case LOAD_PROJECT_PHASES_SUCCESS: {
      const ids = action.payload.data.map((phase) => phase.id);
      return state
        .set('phases', fromJS(ids));
    }
    default:
      return state;
  }
}

export default projectTimeline;
