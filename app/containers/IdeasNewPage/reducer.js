/*
 *
 * IdeasNewPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  LOAD_DRAFT, LOAD_DRAFT_ERROR, LOAD_DRAFT_SUCCESS, STORE_DRAFT, STORE_DRAFT_SUCCESS, STORE_DRAFT_ERROR,
  SAVE_DRAFT, STORE_IDEA, STORE_IDEA_ERROR, STORE_IDEA_SUCCESS, SET_TITLE, STORE_ATTACHMENT, STORE_IMAGE,
  STORE_IMAGE_ERROR, STORE_ATTACHMENT_ERROR,
} from './constants';

export const ideasNewPageInitialState = fromJS({
  draft: {
    loading: false,
    loadError: false,
    storeError: false,
    loaded: false,
    stored: false,
    submitted: false,
    submitError: false,
    submitting: false,
    content: null,
    title: '',
    shortTitleError: true,
    longTitleError: false,
    titleLength: 0,
    attachments: [],
    storeAttachmentError: false,
    images: [],
    storeImageError: false,
  },
});

function ideasNewPageReducer(state = ideasNewPageInitialState, action) {
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
        .setIn(['draft', 'loadError'], false)
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
        .setIn(['draft', 'loadError'], false)
        .setIn(['draft', 'storeError'], false)
        .setIn(['draft', 'content'], action.draft);
    case STORE_IDEA:
      return state
        .setIn(['draft', 'loadError'], false)
        .setIn(['draft', 'storeError'], false)
        .setIn(['draft', 'submitting'], true)
        .setIn(['draft', 'submitted'], false)
        .setIn(['draft', 'submitError'], false);
    case STORE_IDEA_ERROR:
      return state
        .setIn(['draft', 'submitting'], false)
        .setIn(['draft', 'submitError'], true);
    case STORE_IDEA_SUCCESS:
      return state
        .setIn(['draft', 'submitting'], false)
        .setIn(['draft', 'submitted'], true);
    case SET_TITLE:
      return state
        .setIn(['draft', 'title'], action.title)
        .setIn(['draft', 'shortTitleError'], action.title.length < 5)
        .setIn(['draft', 'longTitleError'], action.title.length > 120)
        .setIn(['draft', 'titleLength'], action.title.length);
    case STORE_ATTACHMENT:
      return state
        .setIn(['draft', 'storeAttachmentError'], false)
        .setIn(['draft', 'attachments'], fromJS(state.getIn(['draft', 'attachments'])).concat(action.source));
    case STORE_ATTACHMENT_ERROR:
      return state
        .setIn(['draft', 'storeAttachmentError'], true);
    case STORE_IMAGE:
      return state
        .setIn(['draft', 'storeImageError'], false)
        .setIn(['draft', 'images'], fromJS(state.getIn(['draft', 'images'])).concat(action.source));
    case STORE_IMAGE_ERROR:
      return state
        .setIn(['draft', 'storeImageError'], true);
    default:
      return state;
  }
}

export default ideasNewPageReducer;
