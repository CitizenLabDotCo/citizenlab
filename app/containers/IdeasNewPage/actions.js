/*
 *
 * IdeasNewPage actions
 *
 */
import {
  SAVE_DRAFT, PUBLISH_IDEA_ERROR, PUBLISH_IDEA_SUCCESS, PUBLISH_IDEA_REQUEST, SET_TITLE, STORE_ATTACHMENT, STORE_IMAGE, STORE_ATTACHMENT_ERROR, STORE_IMAGE_ERROR, INVALID_FORM, STORE_SELECTED_TOPICS,
 STORE_SELECTED_AREAS, STORE_SELECTED_PROJECT, RESET_DATA,
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

export function publishIdeaRequest(contents, titles, images, /* attachments, */ userId, isDraft, topics, areas, projects) {
  // console.log([contents, titles, images, userId, isDraft, topics, areas, projects]);

  return (contents
    ? {
      type: PUBLISH_IDEA_REQUEST,
      payload: contents,
      titles,
      images,
      // attachments,
      userId,
      isDraft,
      topics,
      areas,
      projects,
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

export function storeSelectedProject(projects) {
  return {
    type: STORE_SELECTED_PROJECT,
    payload: projects,
  };
}

export function invalidForm() {
  return {
    type: INVALID_FORM,
  };
}

export function resetData() {
  return {
    type: RESET_DATA,
  };
}
