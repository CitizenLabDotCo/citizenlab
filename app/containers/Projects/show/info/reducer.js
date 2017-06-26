/*
 *
 * Projects.info reducer
 *
 */

import { fromJS } from 'immutable';
import { LOAD_PROJECTS_REQUEST } from 'resources/projects/phases/constants';

const initialState = fromJS({
  topics: [],
});

function projectInfo(state = initialState, action) {
  switch (action.type) {
    case LOAD_PROJECTS_REQUEST: {
      const ids = action.payload.data.topics.map((topics) => topics.id);
      return state
        .set('topics', fromJS(ids));
    }
    default:
      return state;
  }
}

export default projectInfo;
