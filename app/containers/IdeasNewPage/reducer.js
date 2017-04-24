/*
 *
 * IdeasNewPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  SAVE_DRAFT, STORE_IDEA, STORE_IDEA_ERROR, STORE_IDEA_SUCCESS, SET_TITLE, STORE_ATTACHMENT,
  STORE_IMAGE, STORE_IMAGE_ERROR, STORE_ATTACHMENT_ERROR,
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
    loadAttachmentsError: false,
    storeAttachmentError: false,
    images: [],
    loadImagesError: false,
    storeImageError: false,
  },
});

function ideasNewPageReducer(state = ideasNewPageInitialState, action) {
  switch (action.type) {
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
        .updateIn(['draft', 'attachments'], (attachments) => attachments.concat(action.source));
    case STORE_ATTACHMENT_ERROR:
      return state
        .setIn(['draft', 'storeAttachmentError'], true);
    case STORE_IMAGE:
      return state
        .setIn(['draft', 'storeImageError'], false)
        .updateIn(['draft', 'images'], (images) => images.concat(action.source));
    case STORE_IMAGE_ERROR:
      return state
        .setIn(['draft', 'storeImageError'], true);
    default:
      return state;
  }
}

export default ideasNewPageReducer;
