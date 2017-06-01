/*
 *
 * AdminPagesNew reducer
 *
 */

import { fromJS } from 'immutable';

import {
  PUBLISH_PAGE_REQUEST, PUBLISH_PAGE_SUCCESS, PUBLISH_PAGE_ERROR, INVALID_FORM_ERROR, SET_TITLE,
} from './constants';

const initialState = fromJS({
  publishing: false,
  invalidFormError: false,
  publishError: null,
  published: false,
  title: '',
});

function adminPagesNewReducer(state = initialState, action) {
  switch (action.type) {
    case PUBLISH_PAGE_REQUEST:
      return state
        .set('publishing', true)
        .set('invalidFormError', false)
        .set('publishError', null);
    case PUBLISH_PAGE_SUCCESS:
      return state
        .set('publishing', false)
        .set('published', true);
    case PUBLISH_PAGE_ERROR:
      return state
        .set('publishing', false)
        .set('publishError', action.error);
    case INVALID_FORM_ERROR:
      return state
        .set('publishing', false)
        .set('publishError', null)
        .set('invalidFormError', true);
    case SET_TITLE:
      return state
        .set('title', action.payload);
    default:
      return state;
  }
}

export default adminPagesNewReducer;
