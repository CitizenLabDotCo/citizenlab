/*
 *
 * SubmitIdeaPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  LOAD_DRAFT, LOAD_DRAFT_ERROR, LOAD_DRAFT_SUCCESS, STORE_DRAFT, STORE_DRAFT_SUCCESS, STORE_DRAFT_ERROR,
  SAVE_DRAFT,
} from './constants';

export const submitIdeaPageInitialState = fromJS({
  draft: {
    loading: false,
    loadError: false,
    storeError: false,
    loaded: false,
    stored: false,
    content: null,
  },
});

function submitIdeaPageReducer(state = submitIdeaPageInitialState, action) {
  switch (action.type) {
    case LOAD_DRAFT:
      return state
        .setIn(['draft', 'loading'], true)
        .setIn(['draft', 'loadError'], false);
    case LOAD_DRAFT_SUCCESS:
      return state
        .setIn(['draft', 'content'], action.content)
        .setIn(['draft', 'loading'], false);
    case LOAD_DRAFT_ERROR:
      return state
        .setIn(['draft', 'loadError'], true)
        .setIn(['draft', 'loading'], false);
    case STORE_DRAFT:
      return state
        .setIn(['draft', 'stored'], false)
        .setIn(['draft', 'storeError'], false);
    case STORE_DRAFT_SUCCESS:
      return state
        .setIn(['draft', 'stored'], true)
        .setIn(['draft', 'storeError'], false);
    case STORE_DRAFT_ERROR:
      return state
        .setIn(['draft', 'stored'], false)
        .setIn(['draft', 'storeError'], true);
    case SAVE_DRAFT:
      return state
        .setIn(['draft', 'content'], action.draft);
    default:
      return state;
  }
}

export default submitIdeaPageReducer;
