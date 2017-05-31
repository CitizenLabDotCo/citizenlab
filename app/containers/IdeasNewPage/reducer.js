/*
 *
 * IdeasNewPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  SAVE_DRAFT, PUBLISH_IDEA_REQUEST, PUBLISH_IDEA_ERROR, PUBLISH_IDEA_SUCCESS, SET_TITLE, STORE_ATTACHMENT,
  STORE_IMAGE, STORE_IMAGE_ERROR, STORE_ATTACHMENT_ERROR, STORE_SELECTED_TOPICS, STORE_SELECTED_AREAS, STORE_SELECTED_PROJECT, INVALID_FORM, RESET_DATA,
} from './constants';
import { LOAD_TOPICS_SUCCESS } from 'resources/topics/constants';
import { LOAD_AREAS_SUCCESS } from 'resources/areas/constants';
import { LOAD_PROJECTS_SUCCESS } from 'resources/projects/constants';

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
    invalidForm: false,
  },
  topics: {
    ids: [],
    selected: [],
  },
  areas: {
    ids: [],
    selected: [],
  },
  projects: {
    ids: [],
    selected: [],
  },
});

function ideasNewPageReducer(state = ideasNewPageInitialState, action) {
  switch (action.type) {
    case SAVE_DRAFT:
      return state
        .setIn(['draft', 'invalidForm'], false)
        .setIn(['draft', 'loadError'], false)
        .setIn(['draft', 'storeError'], false)
        .setIn(['draft', 'content'], action.draft);
    case PUBLISH_IDEA_REQUEST:
      return state
        .setIn(['draft', 'invalidForm'], false)
        .setIn(['draft', 'loadError'], false)
        .setIn(['draft', 'storeError'], false)
        .setIn(['draft', 'submitting'], true)
        .setIn(['draft', 'submitted'], false)
        .setIn(['draft', 'submitError'], false);
    case PUBLISH_IDEA_ERROR:
      return state
        .setIn(['draft', 'submitting'], false)
        .setIn(['draft', 'submitError'], true);
    case PUBLISH_IDEA_SUCCESS:
      return state
        .setIn(['draft', 'submitting'], false)
        .setIn(['draft', 'submitted'], true);
    case SET_TITLE:
      return state
        .setIn(['draft', 'invalidForm'], false)
        .setIn(['draft', 'title'], action.payload)
        .setIn(['draft', 'shortTitleError'], action.payload.length < 5)
        .setIn(['draft', 'longTitleError'], action.payload.length > 120)
        .setIn(['draft', 'titleLength'], action.payload.length);
    case STORE_ATTACHMENT:
      return state
        .setIn(['draft', 'invalidForm'], false)
        .setIn(['draft', 'storeAttachmentError'], false)
         // file names
        .updateIn(['draft', 'attachments'], (attachments) => attachments.concat(action.payload));
    case STORE_ATTACHMENT_ERROR:
      return state
        .setIn(['draft', 'storeAttachmentError'], true);
    case STORE_IMAGE:
      return state
        .setIn(['draft', 'invalidForm'], false)
        .setIn(['draft', 'storeImageError'], false)
         // image URLs
        .updateIn(['draft', 'images'], (images) => images.concat(action.payload));
    case STORE_IMAGE_ERROR:
      return state
        .setIn(['draft', 'storeImageError'], true);
    case LOAD_TOPICS_SUCCESS: {
      const ids = action.payload.data.map((topic) => topic.id);

      return state
        .setIn(['topics', 'ids'], fromJS(ids));
    }
    case LOAD_AREAS_SUCCESS: {
      const ids = action.payload.data.map((area) => area.id);

      return state
        .setIn(['areas', 'ids'], fromJS(ids));
    }
    case LOAD_PROJECTS_SUCCESS: {
      const ids = action.payload.data.map((project) => project.id);

      return state
        .setIn(['projects', 'ids'], fromJS(ids));
    }
    case STORE_SELECTED_TOPICS:
      return state
        .setIn(['draft', 'invalidForm'], false)
        .setIn(['topics', 'selected'], fromJS(action.payload));
    case STORE_SELECTED_AREAS:
      return state
        .setIn(['draft', 'invalidForm'], false)
        .setIn(['areas', 'selected'], fromJS(action.payload));
    case STORE_SELECTED_PROJECT:
      return state
        .setIn(['draft', 'invalidForm'], false)
        .setIn(['projects', 'selected'], fromJS(action.payload));
    case INVALID_FORM:
      return state
        .setIn(['draft', 'submitted'], false)
        .setIn(['draft', 'invalidForm'], true);
    case RESET_DATA:
      return ideasNewPageInitialState;
    default:
      return state;
  }
}

export default ideasNewPageReducer;
