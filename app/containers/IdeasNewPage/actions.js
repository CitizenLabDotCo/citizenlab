/*
 *
 * IdeasNewPage actions
 *
 */
import {
  SAVE_DRAFT, PUBLISH_IDEA_ERROR, PUBLISH_IDEA_SUCCESS, PUBLISH_IDEA_REQUEST, SET_TITLE, STORE_ATTACHMENT, STORE_IMAGE,
  STORE_ATTACHMENT_ERROR, STORE_IMAGE_ERROR, LOAD_TOPICS_REQUEST, LOAD_TOPICS_SUCCESS, LOAD_TOPICS_ERROR,
  LOAD_AREAS_REQUEST, LOAD_AREAS_SUCCESS, LOAD_AREAS_ERROR, STORE_SELECTED_TOPICS, STORE_SELECTED_AREAS, INVALID_FORM,
} from './constants';

/*
 *
 * IdeasNewPage actions
 *
 */


// store draft in redux store
export function saveDraft(content) {
  return {
    type: SAVE_DRAFT,
    draft: content,
  };
}

export function publishIdeaRequest(contents, titles, images, attachments, userId, isDraft) {
  return (contents
    ? {
      type: PUBLISH_IDEA_REQUEST,
      payload: contents,
      titles,
      images,
      attachments,
      userId,
      isDraft,
    }
    : {
      type: PUBLISH_IDEA_ERROR,
    }
  );
}

export function publishIdeaSuccess() {
  return {
    type: PUBLISH_IDEA_SUCCESS,
  };
}

export function publishIdeaError() {
  return {
    type: PUBLISH_IDEA_ERROR,
  };
}

export function setTitle(title) {
  return {
    type: SET_TITLE,
    payload: title,
  };
}

export function storeAttachment(file) {
  return {
    type: STORE_ATTACHMENT,
    payload: file,
  };
}

export function storeAttachmentError() {
  return {
    type: STORE_ATTACHMENT_ERROR,
  };
}

export function storeImage(image) {
  return {
    type: STORE_IMAGE,
    payload: image,
  };
}

export function storeImageError() {
  return {
    type: STORE_IMAGE_ERROR,
  };
}

export function loadTopicsRequest() {
  return {
    type: LOAD_TOPICS_REQUEST,
  };
}

export function loadTopicsSuccess(response) {
  return {
    type: LOAD_TOPICS_SUCCESS,
    payload: response,
  };
}

export function loadTopicsError(error) {
  return {
    type: LOAD_TOPICS_ERROR,
    error,
  };
}

export function loadAreasRequest() {
  return {
    type: LOAD_AREAS_REQUEST,
  };
}

export function loadAreasSuccess(response) {
  return {
    type: LOAD_AREAS_SUCCESS,
    payload: response,
  };
}

export function loadAreasError(error) {
  return {
    type: LOAD_AREAS_ERROR,
    error,
  };
}

export function storeSelectedTopics(topics) {
  return {
    type: STORE_SELECTED_TOPICS,
    payload: topics,
  };
}

export function storeSelectedAreas(areas) {
  return {
    type: STORE_SELECTED_AREAS,
    payload: areas,
  };
}

export function invalidForm() {
  return {
    type: INVALID_FORM,
  };
}
