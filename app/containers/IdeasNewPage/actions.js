/*
 *
 * IdeasNewPage actions
 *
 */
import {
  STORE_DRAFT_SUCCESS, STORE_DRAFT, STORE_DRAFT_ERROR, LOAD_DRAFT, LOAD_DRAFT_SUCCESS, LOAD_DRAFT_ERROR,
  SAVE_DRAFT, STORE_IDEA_ERROR, STORE_IDEA_SUCCESS, STORE_IDEA, SET_TITLE, LOAD_ATTACHMENTS, LOAD_ATTACHMENTS_SUCCESS,
  LOAD_ATTACHMENTS_ERROR, STORE_ATTACHMENT, STORE_ATTACHMENT_SUCCESS, STORE_ATTACHMENT_ERROR, LOAD_IMAGES,
  LOAD_IMAGES_SUCCESS, LOAD_IMAGES_ERROR, STORE_IMAGE_SUCCESS, STORE_IMAGE_ERROR, STORE_IMAGE,
} from './constants';

/*
 *
 * IdeasNewPage actions
 *
 */

export function loadDraft() {
  return {
    type: LOAD_DRAFT,
  };
}

export function draftLoaded(content) {
  return {
    type: (content ? LOAD_DRAFT_SUCCESS : LOAD_DRAFT_ERROR),
    content,
  };
}

export function loadDraftError() {
  return {
    type: LOAD_DRAFT_ERROR,
  };
}

// send draft to backend
export function storeDraft(content) {
  return {
    type: STORE_DRAFT,
    draft: content,
  };
}

export function draftStored() {
  return {
    type: STORE_DRAFT_SUCCESS,
  };
}

export function storeDraftError() {
  return {
    type: STORE_DRAFT_ERROR,
  };
}

// store draft in redux store
export function saveDraft(content) {
  return {
    type: SAVE_DRAFT,
    draft: content,
  };
}

export function storeIdea(content) {
  return {
    type: STORE_IDEA,
    idea: content,
  };
}

export function ideaStored() {
  return {
    type: STORE_IDEA_SUCCESS,
  };
}

export function storeIdeaError() {
  return {
    type: STORE_IDEA_ERROR,
  };
}

export function setTitle(title) {
  return {
    type: SET_TITLE,
    title,
  };
}

export function loadAttachments() {
  return {
    type: LOAD_ATTACHMENTS,
  };
}

export function attachmentsLoaded(sources) {
  return {
    type: (sources ? LOAD_ATTACHMENTS_SUCCESS : LOAD_ATTACHMENTS_ERROR),
    sources,
  };
}

export function loadAttachmentsError() {
  return {
    type: LOAD_ATTACHMENTS_ERROR,
  };
}

export function storeAttachment(file) {
  return {
    type: STORE_ATTACHMENT,
    source: file,
  };
}

export function attachmentStored(source) {
  return {
    type: (source ? STORE_ATTACHMENT_SUCCESS : STORE_ATTACHMENT_ERROR),
    source,
  };
}

export function storeAttachmentError() {
  return {
    type: STORE_ATTACHMENT_ERROR,
  };
}

export function loadImages() {
  return {
    type: LOAD_IMAGES,
  };
}

export function imagesLoaded(sources) {
  return {
    type: (sources ? LOAD_IMAGES_SUCCESS : LOAD_IMAGES_ERROR),
    sources,
  };
}

export function loadImagesError() {
  return {
    type: LOAD_IMAGES_ERROR,
  };
}

export function storeImage(file) {
  return {
    type: STORE_IMAGE,
    source: file,
  };
}

export function imageStored(source) {
  return {
    type: (source ? STORE_IMAGE_SUCCESS : STORE_IMAGE_ERROR),
    source,
  };
}

export function storeImageError() {
  return {
    type: STORE_IMAGE_ERROR,
  };
}
