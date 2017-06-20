/*
 *
 * SignInPage reducer
 *
 */

import { fromJS } from 'immutable';
import { LOAD_PROJECT_PAGES_SUCCESS } from 'resources/projects/pages/constants';

const initialState = fromJS({
  pages: [],
});

function projectContainer(state = initialState, action) {
  switch (action.type) {
    case LOAD_PROJECT_PAGES_SUCCESS: {
      console.log(action.payload.data);
      const ids = action.payload.data.map((pages) => pages.id);
      return state
        .set('pages', fromJS(ids));
    }
    default:
      return state;
  }
}

export default projectContainer;
